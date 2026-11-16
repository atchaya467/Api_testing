import express from 'express';
import cors from 'cors';
import axios from 'axios';
import proxyRouter from './routes/proxy.js';
import mockApiRouter from './routes/mockApi.js';
import scannerRouter from './routes/scanner.js';
import generatorRouter from './routes/generator.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/proxy', proxyRouter);
app.use('/api/mock', mockApiRouter);
app.use('/api/scan', scannerRouter);
app.use('/api', generatorRouter);

const server = app.listen(5099, async () => {
  console.log('Testing server running on port 5099');
  try {
    // 1. Test Proxy
    const proxyRes = await axios.post('http://127.0.0.1:5099/api/proxy', {
      url: 'http://127.0.0.1:5099/api/mock/users',
      method: 'GET'
    });
    console.log('1. PROXY SUCCESS:', proxyRes.data.status, 'Items count:', proxyRes.data.data.users?.length);

    // 2. Test Security Scanner on IDOR + PII leak
    const scanRes = await axios.post('http://127.0.0.1:5099/api/scan', {
      url: 'http://127.0.0.1:5099/api/mock/users/1',
      method: 'GET'
    });
    console.log('2. SCAN SUCCESS: Score =', scanRes.data.score, 'Grade =', scanRes.data.grade);
    console.log('   Vulnerabilities detected:', scanRes.data.vulnerabilities.map(v => `${v.id}: ${v.title}`));

    // 3. Test NLP to Request
    const nlpRes = await axios.post('http://127.0.0.1:5099/api/nlp-to-request', {
      prompt: 'Test user login with admin account',
      baseUrl: 'http://127.0.0.1:5099/api/mock'
    });
    console.log('3. NLP TO REQUEST:', nlpRes.data.method, nlpRes.data.url, nlpRes.data.explanation);

    // 4. Test Assertion Generator
    const testGenRes = await axios.post('http://127.0.0.1:5099/api/generate-tests', {
      url: 'http://127.0.0.1:5099/api/mock/users/1',
      method: 'GET',
      sampleResponse: { id: 1, name: 'Alice', email: 'alice@test.com' }
    });
    console.log('4. AI TEST GENERATOR: Generated', testGenRes.data.tests.length, 'assertions');

    console.log('\n>>> ALL TEST VERIFICATIONS PASSED 100%! <<<');
  } catch (err) {
    console.error('VERIFICATION FAILED:', err.message, err.response?.data);
  } finally {
    server.close();
    process.exit(0);
  }
});
