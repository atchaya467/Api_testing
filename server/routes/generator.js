import express from 'express';
import { generateAICompletion } from '../services/llmService.js';

const router = express.Router();

// 1. Generate Test Assertions
router.post('/generate-tests', async (req, res) => {
  const { url, method = 'GET', sampleResponse, body, provider, apiKey, model } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  // If LLM configured, call Gemini / OpenAI
  if (apiKey && (provider === 'gemini' || provider === 'openai')) {
    const prompt = `Generate a comprehensive suite of API test assertions for:
URL: ${url}
Method: ${method}
Request Body: ${JSON.stringify(body || {})}
Sample Response: ${JSON.stringify(sampleResponse || {})}.

Return a JSON object with a "tests" array. Each item must have:
- id: string
- name: string
- type: "status" | "latency" | "body_contains" | "json_path" | "header"
- target: string (e.g. status code "200", property key "token", max ms "800")
- operator: "equals" | "less_than" | "exists" | "contains"
- expected: any
- description: string`;

    const aiRes = await generateAICompletion({
      systemPrompt: 'You are an elite QA automation engineer specializing in API contract testing and reliability. Return strictly valid JSON.',
      userPrompt: prompt,
      provider,
      apiKey,
      model
    });

    if (aiRes && Array.isArray(aiRes.tests)) {
      return res.json({ tests: aiRes.tests, generatedBy: provider });
    }
  }

  // Built-in intelligent assertion generator
  const generatedTests = [
    {
      id: 'test-1',
      name: 'Verify Successful Status Code',
      type: 'status',
      target: 'status',
      operator: 'equals',
      expected: method === 'POST' ? 201 : 200,
      description: 'Ensures the server responds with a valid HTTP success code'
    },
    {
      id: 'test-2',
      name: 'High Performance SLA Check',
      type: 'latency',
      target: 'duration',
      operator: 'less_than',
      expected: 800,
      description: 'API response time must be under 800ms for optimal UX'
    },
    {
      id: 'test-3',
      name: 'Content-Type JSON Header',
      type: 'header',
      target: 'content-type',
      operator: 'contains',
      expected: 'application/json',
      description: 'API must return JSON MIME type'
    }
  ];

  // Inspect sampleResponse to add smart assertions
  if (sampleResponse && typeof sampleResponse === 'object') {
    if (Array.isArray(sampleResponse)) {
      generatedTests.push({
        id: 'test-4',
        name: 'Array Result Validation',
        type: 'body_contains',
        target: 'length',
        operator: 'greater_than',
        expected: 0,
        description: 'Result list must contain at least one item'
      });
    } else {
      const keys = Object.keys(sampleResponse).slice(0, 3);
      keys.forEach((key, idx) => {
        generatedTests.push({
          id: `test-${idx + 4}`,
          name: `Schema Field Exists: ${key}`,
          type: 'json_path',
          target: key,
          operator: 'exists',
          expected: true,
          description: `Validates payload contains expected attribute '${key}'`
        });
      });
    }
  }

  res.json({ tests: generatedTests, generatedBy: 'built-in' });
});

// 2. Natural Language Prompt to API Request
router.post('/nlp-to-request', async (req, res) => {
  const { prompt, baseUrl = 'http://localhost:5000/api/mock', provider, apiKey, model } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  if (apiKey && (provider === 'gemini' || provider === 'openai')) {
    const aiRes = await generateAICompletion({
      systemPrompt: `You are an API Request Synthesizer. Convert the user's natural language request into an API test configuration.
Base URL context: ${baseUrl}
Return JSON strictly with format:
{
  "method": "GET"|"POST"|"PUT"|"DELETE"|"PATCH",
  "url": string,
  "headers": object,
  "params": object,
  "body": object or null,
  "explanation": string
}`,
      userPrompt: prompt,
      provider,
      apiKey,
      model
    });

    if (aiRes && aiRes.method && aiRes.url) {
      return res.json(aiRes);
    }
  }

  // Built-in intelligent NLP matcher
  const lower = prompt.toLowerCase();
  let result = {
    method: 'GET',
    url: `${baseUrl}/users`,
    headers: { 'Content-Type': 'application/json' },
    params: {},
    body: null,
    explanation: 'Generated request based on your query'
  };

  if (lower.includes('login') || lower.includes('auth') || lower.includes('sign in')) {
    result.method = 'POST';
    result.url = `${baseUrl}/auth/login`;
    result.body = { email: 'admin@enterprise.com', password: 'admin123' };
    result.explanation = 'Generated login authentication request with demo admin credentials';
  } else if (lower.includes('order') || lower.includes('buy') || lower.includes('purchase')) {
    result.method = 'POST';
    result.url = `${baseUrl}/orders`;
    result.body = { productId: 101, quantity: 2, discount: 15 };
    result.explanation = 'Generated order creation POST request';
  } else if (lower.includes('search') || lower.includes('find') || lower.includes('query')) {
    result.method = 'GET';
    result.url = `${baseUrl}/search`;
    result.params = { q: 'Quantum' };
    result.explanation = 'Generated search query request with product search parameter';
  } else if (lower.includes('single user') || lower.includes('user 1') || lower.includes('user profile') || lower.includes('alice')) {
    result.method = 'GET';
    result.url = `${baseUrl}/users/1`;
    result.explanation = 'Generated request to fetch individual user resource';
  } else if (lower.includes('secure') || lower.includes('protected') || lower.includes('profile')) {
    result.method = 'GET';
    result.url = `${baseUrl}/secure/profile`;
    result.headers['Authorization'] = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MX0.MOCK';
    result.explanation = 'Generated secured endpoint request with Bearer authorization header';
  } else if (lower.includes('rate limit') || lower.includes('throttle') || lower.includes('dos')) {
    result.method = 'GET';
    result.url = `${baseUrl}/rate-limited`;
    result.explanation = 'Generated request to rate-limited testing endpoint';
  } else if (lower.includes('export') || lower.includes('admin') || lower.includes('backup')) {
    result.method = 'POST';
    result.url = `${baseUrl}/admin/export`;
    result.explanation = 'Generated privileged admin export endpoint request';
  }

  res.json(result);
});

export default router;
