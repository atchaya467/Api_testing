import express from 'express';
import axios from 'axios';

const router = express.Router();

router.post('/', async (req, res) => {
  const { url, method = 'GET', headers = {}, params = {}, body = null, timeout = 30000 } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'Target URL is required' });
  }

  // Sanitize headers
  const reqHeaders = { ...headers };
  // Remove hop-by-hop headers
  delete reqHeaders['host'];
  delete reqHeaders['content-length'];

  const startTime = performance.now();
  try {
    const config = {
      method: method.toLowerCase(),
      url,
      headers: reqHeaders,
      params,
      timeout,
      validateStatus: () => true, // Don't throw on 4xx/5xx status codes
      transformResponse: [(data) => data], // Keep raw response to parse manually
    };

    if (body && ['post', 'put', 'patch', 'delete'].includes(method.toLowerCase())) {
      config.data = body;
    }

    const response = await axios(config);
    const duration = Math.round(performance.now() - startTime);

    let parsedData = response.data;
    try {
      if (typeof response.data === 'string') {
        parsedData = JSON.parse(response.data);
      }
    } catch {
      parsedData = response.data;
    }

    const contentLength = response.headers['content-length'] 
      || (typeof response.data === 'string' ? Buffer.byteLength(response.data, 'utf8') : JSON.stringify(response.data || '').length);

    res.json({
      success: true,
      status: response.status,
      statusText: response.statusText || 'OK',
      duration,
      size: contentLength,
      headers: response.headers,
      data: parsedData,
    });
  } catch (err) {
    const duration = Math.round(performance.now() - startTime);
    res.status(502).json({
      success: false,
      status: err.response?.status || 502,
      statusText: err.code || 'BAD_GATEWAY',
      duration,
      size: 0,
      headers: err.response?.headers || {},
      error: err.message,
      data: err.response?.data || { error: err.message, code: err.code }
    });
  }
});

export default router;
