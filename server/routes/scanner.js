import express from 'express';
import axios from 'axios';
import { generateAICompletion } from '../services/llmService.js';

const router = express.Router();

// Helper to make sandboxed request
async function sendProbe({ url, method = 'GET', headers = {}, params = {}, body = null }) {
  const startTime = performance.now();
  try {
    const config = {
      method: method.toLowerCase(),
      url,
      headers,
      params,
      timeout: 5000,
      validateStatus: () => true,
    };
    if (body && ['post', 'put', 'patch', 'delete'].includes(method.toLowerCase())) {
      config.data = body;
    }
    const res = await axios(config);
    return {
      status: res.status,
      headers: res.headers,
      data: res.data,
      duration: Math.round(performance.now() - startTime),
      error: null
    };
  } catch (err) {
    return {
      status: err.response?.status || 0,
      headers: err.response?.headers || {},
      data: err.response?.data || null,
      duration: Math.round(performance.now() - startTime),
      error: err.message
    };
  }
}

// Check for sensitive data leakage
function detectSensitiveData(obj) {
  const str = typeof obj === 'string' ? obj : JSON.stringify(obj || '');
  const findings = [];

  if (/(passwordHash|password|passwd|pwd)[\"':\s]/i.test(str)) {
    findings.push('Password/Password Hash exposed in response');
  }
  if (/\b\d{3}-\d{2}-\d{4}\b/.test(str)) {
    findings.push('Social Security Number (SSN) pattern found');
  }
  if (/(eyJhbGciOi[a-zA-Z0-9_\-]+\.[a-zA-Z0-9_\-]+\.[a-zA-Z0-9_\-]+)/.test(str)) {
    findings.push('Unmasked JWT token in payload');
  }
  if (/(stack trace|exception at|syntax error|near ')/i.test(str)) {
    findings.push('Internal server stack trace or raw SQL exception leak');
  }
  if (/(api[_-]?key|secret[_-]?token|bearer[ ]+[a-z0-9_-]{20,})/i.test(str)) {
    findings.push('API Keys or Secrets leaked in plain text');
  }

  return findings;
}

router.post('/', async (req, res) => {
  const {
    url,
    method = 'GET',
    headers = {},
    params = {},
    body = null,
    scanProfile = 'owasp-top-10',
    provider = 'built-in',
    apiKey = '',
    model = ''
  } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'Endpoint URL is required' });
  }

  const scanTimestamp = new Date().toISOString();
  const vulnerabilities = [];
  const testResults = [];
  const complianceChecks = [];

  // --- Step 1: Baseline Request ---
  const baseline = await sendProbe({ url, method, headers, params, body });
  testResults.push({ name: 'Baseline Request', status: baseline.status, duration: baseline.duration });

  // --- Step 2: Missing Security Headers Check (API8: Security Misconfiguration) ---
  const respHeaders = baseline.headers || {};
  const missingHeaders = [];
  if (!respHeaders['x-content-type-options']) missingHeaders.push('X-Content-Type-Options: nosniff');
  if (!respHeaders['x-frame-options']) missingHeaders.push('X-Frame-Options: DENY / SAMEORIGIN');
  if (!respHeaders['strict-transport-security'] && url.startsWith('https:')) missingHeaders.push('Strict-Transport-Security');
  if (!respHeaders['content-security-policy']) missingHeaders.push('Content-Security-Policy');

  if (missingHeaders.length > 0) {
    vulnerabilities.push({
      id: 'VULN-API8-01',
      title: 'Missing Essential Defensive HTTP Headers',
      owaspCategory: 'API8:2023 Security Misconfiguration',
      severity: 'LOW',
      cvssScore: 3.8,
      description: `The API server does not send crucial protective headers: ${missingHeaders.join(', ')}. This exposes clients to MIME-sniffing and clickjacking attacks.`,
      exploitPoc: `Response headers received:\n${JSON.stringify(respHeaders, null, 2)}`,
      remediationSnippet: `// Express.js middleware\napp.use(helmet());\n// Or manual headers:\nres.setHeader('X-Content-Type-Options', 'nosniff');\nres.setHeader('X-Frame-Options', 'DENY');`,
      curlCommand: `curl -I "${url}"`
    });
    complianceChecks.push({ check: 'HTTP Security Headers', passed: false, detail: `${missingHeaders.length} headers missing` });
  } else {
    complianceChecks.push({ check: 'HTTP Security Headers', passed: true, detail: 'Hardened security headers configured' });
  }

  // Server banner leakage
  if (respHeaders['x-powered-by'] || (respHeaders['server'] && !['cloudflare', 'nginx'].includes(respHeaders['server']?.toLowerCase()))) {
    vulnerabilities.push({
      id: 'VULN-API8-02',
      title: 'Server Fingerprint & Technology Disclosure',
      owaspCategory: 'API8:2023 Security Misconfiguration',
      severity: 'LOW',
      cvssScore: 2.5,
      description: `Server exposes internal framework via header '${respHeaders['x-powered-by'] || respHeaders['server']}'. Attackers use this to craft targeted exploit chains.`,
      exploitPoc: `X-Powered-By: ${respHeaders['x-powered-by'] || 'N/A'}\nServer: ${respHeaders['server'] || 'N/A'}`,
      remediationSnippet: `app.disable('x-powered-by');`,
      curlCommand: `curl -sI "${url}" | grep -iE "(server|x-powered-by)"`
    });
  }

  // --- Step 3: Sensitive Data Exposure / Excessive Data Check (API3) ---
  const sensitiveLeaks = detectSensitiveData(baseline.data);
  if (sensitiveLeaks.length > 0) {
    vulnerabilities.push({
      id: 'VULN-API3-01',
      title: 'Excessive Data Exposure & Sensitive PII Leakage',
      owaspCategory: 'API3:2023 Broken Object Property Level Authorization',
      severity: 'HIGH',
      cvssScore: 7.9,
      description: `The endpoint response payload exposes sensitive internal or personally identifiable information: ${sensitiveLeaks.join(', ')}.`,
      exploitPoc: `Sample leaked data:\n${JSON.stringify(baseline.data, null, 2).substring(0, 400)}...`,
      remediationSnippet: `// Use DTO / schema filtering before returning data:\nconst safeUser = { id: user.id, name: user.name, email: user.email };\nreturn res.json(safeUser);`,
      curlCommand: `curl -X ${method} "${url}"`
    });
    complianceChecks.push({ check: 'PII & Sensitive Data Protection', passed: false, detail: sensitiveLeaks.join(', ') });
  } else {
    complianceChecks.push({ check: 'PII & Sensitive Data Protection', passed: true, detail: 'No plaintext credentials or PII patterns detected' });
  }

  // --- Step 4: Broken Authentication & Authorization Probes (API2) ---
  const hasAuth = !!headers['authorization'] || !!headers['Authorization'];
  if (hasAuth) {
    // Probe without auth
    const strippedHeaders = { ...headers };
    delete strippedHeaders['authorization'];
    delete strippedHeaders['Authorization'];
    const unauthProbe = await sendProbe({ url, method, headers: strippedHeaders, params, body });
    testResults.push({ name: 'Unauthenticated Request Probe', status: unauthProbe.status, duration: unauthProbe.duration });

    if (unauthProbe.status === 200) {
      vulnerabilities.push({
        id: 'VULN-API2-01',
        title: 'Broken Authentication - Missing Token Verification',
        owaspCategory: 'API2:2023 Broken Authentication',
        severity: 'CRITICAL',
        cvssScore: 9.3,
        description: 'Endpoint accepts requests even when the Authorization token is completely omitted, allowing unauthenticated anonymous access to protected data.',
        exploitPoc: `Request without Authorization header returned HTTP 200 OK with ${JSON.stringify(unauthProbe.data).substring(0, 150)}...`,
        remediationSnippet: `// Enforce auth middleware\nrouter.use(verifyJwtToken);\nfunction verifyJwtToken(req, res, next) {\n  const token = req.headers.authorization?.split(' ')[1];\n  if (!token) return res.status(401).json({ error: 'Unauthorized' });\n  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {\n    if (err) return res.status(403).json({ error: 'Invalid Token' });\n    req.user = decoded;\n    next();\n  });\n}`,
        curlCommand: `curl -X ${method} "${url}"`
      });
      complianceChecks.push({ check: 'Enforced Token Authentication', passed: false, detail: 'Accepted request with no token' });
    } else {
      complianceChecks.push({ check: 'Enforced Token Authentication', passed: true, detail: `Rejected with ${unauthProbe.status}` });
    }
  }

  // --- Step 5: BOLA / IDOR Probing (API1) ---
  const urlIdMatch = url.match(/\/(\d+)(\/?$|\?)/);
  if (urlIdMatch) {
    const originalId = urlIdMatch[1];
    const probeId = parseInt(originalId, 10) === 1 ? '2' : '1';
    const bolaUrl = url.replace(new RegExp(`/${originalId}(\\/?$|\\?)`), `/${probeId}$1`);
    
    const bolaProbe = await sendProbe({ url: bolaUrl, method, headers, params, body });
    testResults.push({ name: `BOLA / IDOR Target Probe (${probeId})`, status: bolaProbe.status, duration: bolaProbe.duration });

    if (bolaProbe.status === 200 && bolaProbe.data && JSON.stringify(bolaProbe.data) !== JSON.stringify(baseline.data)) {
      vulnerabilities.push({
        id: 'VULN-API1-01',
        title: 'Broken Object Level Authorization (BOLA / IDOR)',
        owaspCategory: 'API1:2023 Broken Object Level Authorization',
        severity: 'CRITICAL',
        cvssScore: 9.5,
        description: `Direct object reference vulnerability detected. Requesting resource ID ${probeId} returned another user's record without validating if the current session owns that resource.`,
        exploitPoc: `GET ${bolaUrl}\nReturned 200 OK: ${JSON.stringify(bolaProbe.data).substring(0, 200)}`,
        remediationSnippet: `// Check ownership before fetching record\nconst record = await db.users.findById(req.params.id);\nif (!record || record.tenantId !== req.user.tenantId) {\n  return res.status(403).json({ error: 'Forbidden: Access denied to object' });\n}`,
        curlCommand: `curl -X ${method} "${bolaUrl}"`
      });
      complianceChecks.push({ check: 'Object Level Authorization (BOLA)', passed: false, detail: `IDOR found on ID swap ${originalId} -> ${probeId}` });
    } else {
      complianceChecks.push({ check: 'Object Level Authorization (BOLA)', passed: true, detail: 'Resource isolation maintained or rejected' });
    }
  }

  // --- Step 6: SQL & Command Injection Fuzzing (API10) ---
  const sqliPayload = "' OR '1'='1";
  let sqliProbeUrl = url;
  let sqliParams = { ...params };
  let sqliBody = body ? JSON.parse(JSON.stringify(body)) : null;

  if (Object.keys(params).length > 0) {
    const firstParamKey = Object.keys(params)[0];
    sqliParams[firstParamKey] = sqliPayload;
  } else if (url.includes('?')) {
    sqliProbeUrl = `${url}&fuzz=${encodeURIComponent(sqliPayload)}`;
  } else {
    sqliProbeUrl = `${url}?q=${encodeURIComponent(sqliPayload)}`;
  }

  const sqliProbe = await sendProbe({ url: sqliProbeUrl, method, headers, params: sqliParams, body: sqliBody });
  testResults.push({ name: 'SQL/NoSQL Injection Fuzz Probe', status: sqliProbe.status, duration: sqliProbe.duration });

  const sqliResponseStr = JSON.stringify(sqliProbe.data || '');
  if (
    sqliResponseStr.includes('SQL syntax') ||
    sqliResponseStr.includes('DatabaseSyntaxException') ||
    sqliResponseStr.includes('syntax error near') ||
    sqliResponseStr.includes('vulnerableQuery') ||
    (sqliProbe.status === 500 && sqliResponseStr.toLowerCase().includes('sql'))
  ) {
    vulnerabilities.push({
      id: 'VULN-API10-01',
      title: 'SQL Injection / Database Syntax Leakage',
      owaspCategory: 'API10:2023 Unsafe Consumption of APIs / Injection',
      severity: 'CRITICAL',
      cvssScore: 9.8,
      description: `Unsanitized input was evaluated directly in database backend, resulting in a syntax error or database reflection. An attacker can extract entire database contents, bypass authentication, or corrupt data.`,
      exploitPoc: `Payload injected: ${sqliPayload}\nResponse returned HTTP ${sqliProbe.status}:\n${sqliResponseStr.substring(0, 300)}`,
      remediationSnippet: `// Use parameterized queries or ORM\nconst query = 'SELECT * FROM products WHERE name = $1';\nconst result = await db.query(query, [searchTerm]);`,
      curlCommand: `curl -G --data-urlencode "q=' OR '1'='1" "${url}"`
    });
    complianceChecks.push({ check: 'Injection Input Sanitization', passed: false, detail: 'Database error thrown on single-quote injection' });
  } else {
    complianceChecks.push({ check: 'Injection Input Sanitization', passed: true, detail: 'Sanitized or safely handled' });
  }

  // --- Step 7: Mass Assignment Check (API3) for POST/PUT ---
  if (['post', 'put', 'patch'].includes(method.toLowerCase())) {
    const massAssignmentBody = {
      ...(typeof body === 'object' && body !== null ? body : {}),
      isAdmin: true,
      role: 'admin',
      permissions: ['*'],
      balance: 999999
    };
    const massProbe = await sendProbe({ url, method, headers, body: massAssignmentBody });
    testResults.push({ name: 'Mass Assignment Privilege Escalation Probe', status: massProbe.status, duration: massProbe.duration });

    const massRespStr = JSON.stringify(massProbe.data || '');
    if (massProbe.status < 300 && (massRespStr.includes('admin') || massRespStr.includes('isAdmin') || massRespStr.includes('grantedPrivileges'))) {
      vulnerabilities.push({
        id: 'VULN-API3-02',
        title: 'Mass Assignment Privilege Escalation',
        owaspCategory: 'API3:2023 Broken Object Property Level Authorization',
        severity: 'HIGH',
        cvssScore: 8.2,
        description: 'The endpoint bound client-supplied attributes (`isAdmin: true`, `role: "admin"`) directly into the domain object without an allowlist filter.',
        exploitPoc: `Payload sent: ${JSON.stringify(massAssignmentBody)}\nResponse confirmed assignment: ${massRespStr.substring(0, 200)}`,
        remediationSnippet: `// Whitelist allowed fields with Zod, Joi, or lodash pick\nconst allowedFields = req.body;\nconst safeData = {\n  productId: allowedFields.productId,\n  quantity: Number(allowedFields.quantity)\n};\n// Never spread req.body directly!`,
        curlCommand: `curl -X ${method} -H "Content-Type: application/json" -d '{"isAdmin":true,"role":"admin"}' "${url}"`
      });
      complianceChecks.push({ check: 'Mass Assignment Protection', passed: false, detail: 'Accepted unverified privilege attributes' });
    }
  }

  // --- Step 8: Calculate Security Score & Grade ---
  let score = 100;
  for (const v of vulnerabilities) {
    if (v.severity === 'CRITICAL') score -= 30;
    else if (v.severity === 'HIGH') score -= 20;
    else if (v.severity === 'MEDIUM') score -= 10;
    else if (v.severity === 'LOW') score -= 5;
  }
  score = Math.max(5, Math.min(100, score));

  let grade = 'A+';
  if (score >= 90) grade = 'A';
  else if (score >= 80) grade = 'B';
  else if (score >= 65) grade = 'C';
  else if (score >= 50) grade = 'D';
  else grade = 'F';

  // --- Step 9: LLM Deep Analysis Enrichment ---
  let executiveSummary = `Security assessment of ${method} ${url} completed with ${vulnerabilities.length} security finding(s).`;
  let aiInsights = [];

  // Attempt to enrich with Gemini / OpenAI if configured
  if (apiKey && (provider === 'gemini' || provider === 'openai')) {
    const prompt = `Analyze this API scan result and provide a 2-sentence executive summary and 3 bullet recommendations:\nURL: ${url}\nMethod: ${method}\nVulnerabilities found: ${vulnerabilities.map(v => v.title + ' (' + v.severity + ')').join(', ')}`;
    const aiResult = await generateAICompletion({
      systemPrompt: 'You are an elite API penetration tester and security architect. Return JSON with keys: executiveSummary (string), recommendations (array of strings).',
      userPrompt: prompt,
      provider,
      apiKey,
      model
    });

    if (aiResult?.executiveSummary) {
      executiveSummary = aiResult.executiveSummary;
    }
    if (Array.isArray(aiResult?.recommendations)) {
      aiInsights = aiResult.recommendations;
    }
  }

  if (aiInsights.length === 0) {
    if (vulnerabilities.length === 0) {
      aiInsights = [
        'Endpoint demonstrates strong defensive headers and sanitization.',
        'Continuous fuzz testing is recommended in CI/CD pipelines.',
        'Ensure token expiration times remain short with automatic rotation.'
      ];
    } else {
      aiInsights = [
        'Prioritize remediation of Critical/High severity vulnerabilities immediately before deployment.',
        'Implement automated API gateway rate-limiting and authorization token validators.',
        'Adopt strict JSON schema validation and object property whitelisting.'
      ];
    }
  }

  res.json({
    scanId: 'SCAN-' + Date.now().toString(36).toUpperCase(),
    timestamp: scanTimestamp,
    target: { url, method },
    score,
    grade,
    executiveSummary,
    vulnerabilities,
    complianceChecks,
    testResults,
    aiInsights,
    stats: {
      probesSent: testResults.length,
      averageLatencyMs: Math.round(testResults.reduce((acc, t) => acc + (t.duration || 0), 0) / (testResults.length || 1)),
      criticalCount: vulnerabilities.filter(v => v.severity === 'CRITICAL').length,
      highCount: vulnerabilities.filter(v => v.severity === 'HIGH').length,
      mediumCount: vulnerabilities.filter(v => v.severity === 'MEDIUM').length,
      lowCount: vulnerabilities.filter(v => v.severity === 'LOW').length,
    }
  });
});

export default router;
