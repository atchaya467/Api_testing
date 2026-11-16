import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import proxyRouter from './routes/proxy.js';
import mockApiRouter from './routes/mockApi.js';
import scannerRouter from './routes/scanner.js';
import generatorRouter from './routes/generator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'API Testing Core',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/proxy', proxyRouter);
app.use('/api/mock', mockApiRouter);
app.use('/api/scan', scannerRouter);
app.use('/api', generatorRouter);

// Serve static frontend from dist if built
const distPath = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 API Testing Platform is active on: http://localhost:${PORT}`);
  console.log(`   - UI & Test Suite: http://localhost:${PORT}`);
  console.log(`   - Mock Target Sandbox: http://localhost:${PORT}/api/mock`);
  console.log(`======================================================\n`);
});
