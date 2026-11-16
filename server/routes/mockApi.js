import express from 'express';

const router = express.Router();

// Mock database in memory
const mockUsers = [
  { id: 1, name: 'Alice Walker', email: 'alice@enterprise.com', role: 'admin', ssn: '992-01-4491', passwordHash: '$2b$12$K1r.mZ0eYdYQfFf1j1j1jeEXAMPLEADMINHASH', balance: 45000 },
  { id: 2, name: 'Bob Dylan', email: 'bob@enterprise.com', role: 'user', ssn: '302-88-1290', passwordHash: '$2b$12$L9p.sA1xZtYQfAa2k2k2keEXAMPLEUSERHASH', balance: 1200 },
  { id: 3, name: 'Charlie Green', email: 'charlie@enterprise.com', role: 'user', ssn: '441-23-8822', passwordHash: '$2b$12$M8q.tB2wXuZRfBb3l3l3leEXAMPLEUSERHASH', balance: 350 },
];

let rateLimitCounter = {};

// 1. Auth Login
router.post('/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  if (email === 'admin@enterprise.com' && password === 'admin123') {
    return res.json({
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6ImFkbWluIn0.MOCK_SIGNATURE',
      user: { id: 1, name: 'Alice Walker', email, role: 'admin' },
      expiresIn: 3600
    });
  }

  // Demo user login
  return res.json({
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZSI6InVzZXIifQ.MOCK_SIGNATURE',
    user: { id: 2, name: 'Bob Dylan', email, role: 'user' },
    expiresIn: 3600
  });
});

// 2. Vulnerable Users List (VULNERABILITY: API3 Excessive Data Exposure - Leaks SSN and passwordHash)
router.get('/users', (req, res) => {
  // Returns all users including sensitive fields!
  res.json({
    total: mockUsers.length,
    users: mockUsers
  });
});

// 3. Vulnerable Single User (VULNERABILITY: API1 BOLA/IDOR - no token check, anyone can fetch user 1 or user 2)
router.get('/users/:id', (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const user = mockUsers.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  // Leaking sensitive data
  res.json(user);
});

// 4. Vulnerable Search (VULNERABILITY: API10 SQL Injection vulnerability simulator)
router.get('/search', (req, res) => {
  const q = req.query.q || '';
  
  // Simulating SQL Injection vulnerability detection
  if (q.includes("'") || q.toLowerCase().includes('or 1=1') || q.toLowerCase().includes('drop table') || q.includes('--')) {
    return res.status(500).json({
      error: "SQL syntax error: select * from products where title like '%" + q + "%' near 'OR' at line 1",
      stack: "DatabaseSyntaxException at executeQuery (/db/postgres.js:142)\n    at Object.search (/controllers/search.js:33)",
      vulnerableQuery: `SELECT * FROM products WHERE name LIKE '%${q}%'`
    });
  }

  res.json({
    query: q,
    results: [
      { id: 101, name: 'Quantum Processor X1', category: 'Hardware', price: 999.99 },
      { id: 102, name: 'Cyber Shield Endpoint Sentinel', category: 'Software', price: 249.50 }
    ]
  });
});

// 5. Vulnerable Orders (VULNERABILITY: API3 Mass Assignment - accepts isAdmin or discount directly into order/user state)
router.post('/orders', (req, res) => {
  const { productId, quantity = 1, role, isAdmin, discount = 0 } = req.body || {};

  if (!productId) {
    return res.status(400).json({ error: 'productId is required' });
  }

  // Dangerous: assigns client-supplied privilege fields directly
  const order = {
    orderId: 'ORD-' + Math.floor(Math.random() * 90000 + 10000),
    productId,
    quantity,
    status: 'CONFIRMED',
    discountApplied: discount,
    grantedPrivileges: { role: role || 'user', isAdmin: !!isAdmin },
    createdAt: new Date().toISOString()
  };

  res.status(201).json({
    message: 'Order created successfully',
    order
  });
});

// 6. Vulnerable Admin Export (VULNERABILITY: API5 Broken Function Level Authorization / BFLA)
router.post('/admin/export', (req, res) => {
  // Vulnerable: no authorization header check! Any anonymous caller can download database export!
  res.json({
    message: 'Database export generated',
    exportUrl: 'https://storage.internal.corp/backups/dump-2026-production.sql.gz',
    recordsExported: 48920,
    generatedBy: req.headers['user-agent'] || 'anonymous'
  });
});

// 7. Rate Limited Demo Endpoint (VULNERABILITY: API4 Unrestricted Resource Consumption when count >= 5)
router.get('/rate-limited', (req, res) => {
  const ip = req.ip || 'client';
  rateLimitCounter[ip] = (rateLimitCounter[ip] || 0) + 1;

  if (rateLimitCounter[ip] > 5) {
    return res.status(429).json({
      error: 'Rate limit exceeded: 5 requests per minute allowed',
      retryAfter: 60
    });
  }

  res.json({
    message: 'Request successful within rate quota',
    requestsRemaining: 5 - rateLimitCounter[ip],
    windowReset: '60s'
  });
});

// 8. Secure Hardened Endpoint (Demonstrates clean, secure API response with proper headers)
router.get('/secure/profile', (req, res) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. Bearer token missing.' });
  }

  // Add standard security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Content-Security-Policy', "default-src 'self'");

  res.json({
    id: 1,
    name: 'Alice Walker',
    email: 'alice@enterprise.com',
    role: 'admin',
    accountStatus: 'ACTIVE',
    lastLogin: new Date().toISOString()
  });
});

export default router;
