import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import RequestBuilder from './components/RequestBuilder';
import ResponsePanel from './components/ResponsePanel';
import BatchScanModal from './components/BatchScanModal';
import SettingsModal from './components/SettingsModal';
import MatrixIntro from './components/MatrixIntro';
import MatrixRainCanvas from './components/MatrixRainCanvas';
import { DEFAULT_COLLECTIONS, DEFAULT_ENVIRONMENTS } from './constants';

export default function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [collections, setCollections] = useState(() => {
    try {
      const saved = localStorage.getItem('apitesting_collections') || localStorage.getItem('apipulse_collections');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Clean out old pre-packaged demo collections if present
        const hasOldDemos = parsed.some(c => c.id === 'col-owasp' || c.id === 'col-secure');
        if (!hasOldDemos && parsed.length > 0) {
          return parsed.map(col => ({
            ...col,
            name: 'Tested APIs',
            requests: (col.requests || []).map(r => ({
              ...r,
              name: (!r.name || r.name === 'New API Request' || r.name === 'New Custom Endpoint') ? (r.url || 'http://localhost:5001/api/contact') : r.name
            }))
          }));
        }
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_COLLECTIONS;
  });

  const [activeRequest, setActiveRequest] = useState(() => {
    try {
      const saved = localStorage.getItem('apitesting_active_request') || localStorage.getItem('apipulse_active_request');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.id && !parsed.id.startsWith('req-users-exposure')) {
          if (!parsed.name || parsed.name === 'New API Request') {
            parsed.name = parsed.url || 'http://localhost:5001/api/contact';
          }
          return parsed;
        }
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_COLLECTIONS[0]?.requests[0] || {
      id: 'req-' + Date.now(),
      name: 'http://localhost:5001/api/health',
      method: 'GET',
      url: 'http://localhost:5001/api/health',
      headers: [],
      params: [],
      body: '',
      auth: { type: 'none' },
      assertions: []
    };
  });

  const [environments, setEnvironments] = useState(DEFAULT_ENVIRONMENTS);
  const [currentEnv, setCurrentEnv] = useState('local');
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('apitesting_history') || localStorage.getItem('apipulse_history');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('apitesting_collections', JSON.stringify(collections));
    } catch (e) {
      console.error(e);
    }
  }, [collections]);

  useEffect(() => {
    try {
      if (activeRequest) {
        localStorage.setItem('apitesting_active_request', JSON.stringify(activeRequest));
      }
    } catch (e) {
      console.error(e);
    }
  }, [activeRequest]);

  useEffect(() => {
    try {
      localStorage.setItem('apitesting_history', JSON.stringify(history));
    } catch (e) {
      console.error(e);
    }
  }, [history]);

  // Keep activeRequest synced with collection list
  const handleChangeRequest = (updatedReq) => {
    const withName = {
      ...updatedReq,
      name: (!updatedReq.name || updatedReq.name === 'New API Request' || updatedReq.name === 'New Custom Endpoint')
        ? (updatedReq.url || 'New Request')
        : updatedReq.name
    };

    setActiveRequest(withName);

    setCollections(prev => {
      const next = [...prev];
      if (next.length === 0) {
        return [{ id: 'col-my-apis', name: 'Tested APIs', requests: [withName] }];
      }

      let reqs = [...(next[0].requests || [])];
      const idx = reqs.findIndex(r => r.id === withName.id);

      if (idx !== -1) {
        reqs[idx] = withName;
      } else {
        reqs.unshift(withName);
      }

      next[0].requests = reqs;
      return next;
    });
  };
  
  // Response & Scan state
  const [response, setResponse] = useState(null);
  const [scanReport, setScanReport] = useState(null);
  const [testResults, setTestResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isGeneratingTests, setIsGeneratingTests] = useState(false);

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isBatchScanOpen, setIsBatchScanOpen] = useState(false);
  const [batchProgress, setBatchProgress] = useState(0);
  const [batchResults, setBatchResults] = useState([]);
  const [isScanningBatch, setIsScanningBatch] = useState(false);

  // AI Configuration
  const [aiSettings, setAiSettings] = useState({
    provider: 'built-in',
    apiKey: '',
    model: 'gemini-1.5-flash'
  });

  // Resolve template variables like {{baseUrl}}
  const resolveTemplate = (text) => {
    if (typeof text !== 'string') return text;
    let resolved = text;
    const vars = environments[currentEnv]?.variables || {};
    for (const [key, val] of Object.entries(vars)) {
      resolved = resolved.replaceAll(`{{${key}}}`, val);
    }
    return resolved;
  };

  // 1. Send Request
  const handleSendRequest = async () => {
    if (!activeRequest?.url) return;
    setIsLoading(true);
    setResponse(null);
    setTestResults([]);

    // Auto-save this tested API
    const testedReq = {
      ...activeRequest,
      name: (!activeRequest.name || activeRequest.name === 'New API Request' || activeRequest.name === 'New Custom Endpoint')
        ? activeRequest.url
        : activeRequest.name
    };
    handleChangeRequest(testedReq);

    try {
      // Build resolved headers
      const resolvedHeaders = {};
      (activeRequest.headers || []).forEach(h => {
        if (h.enabled && h.key) {
          resolvedHeaders[h.key] = resolveTemplate(h.value);
        }
      });

      // Handle Auth
      if (activeRequest.auth?.type === 'bearer' && activeRequest.auth.token) {
        resolvedHeaders['Authorization'] = `Bearer ${resolveTemplate(activeRequest.auth.token)}`;
      } else if (activeRequest.auth?.type === 'apikey' && activeRequest.auth.apiKeyHeader) {
        resolvedHeaders[activeRequest.auth.apiKeyHeader] = resolveTemplate(activeRequest.auth.apiKeyValue);
      }

      // Build resolved params
      const resolvedParams = {};
      (activeRequest.params || []).forEach(p => {
        if (p.enabled && p.key) {
          resolvedParams[p.key] = resolveTemplate(p.value);
        }
      });

      // Build resolved body
      let resolvedBody = null;
      if (activeRequest.body && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(activeRequest.method.toUpperCase())) {
        try {
          resolvedBody = JSON.parse(resolveTemplate(activeRequest.body));
        } catch {
          resolvedBody = resolveTemplate(activeRequest.body);
        }
      }

      const res = await axios.post('/api/proxy', {
        url: resolveTemplate(activeRequest.url),
        method: activeRequest.method,
        headers: resolvedHeaders,
        params: resolvedParams,
        body: resolvedBody
      });

      const respData = res.data;
      setResponse(respData);

      // Evaluate contract test assertions
      if (activeRequest.assertions?.length > 0) {
        const results = activeRequest.assertions.map(a => {
          let passed = false;
          let received = null;

          if (a.type === 'status') {
            received = respData.status;
            passed = Number(received) === Number(a.expected);
          } else if (a.type === 'latency') {
            received = respData.duration;
            passed = Number(received) <= Number(a.expected);
          } else if (a.type === 'header') {
            received = respData.headers?.[a.target?.toLowerCase()] || '';
            passed = String(received).toLowerCase().includes(String(a.expected).toLowerCase());
          } else if (a.type === 'body_contains' || a.type === 'json_path') {
            const bodyStr = JSON.stringify(respData.data || '');
            if (a.operator === 'exists') {
              passed = respData.data && (a.target in respData.data || bodyStr.includes(`"${a.target}"`));
              received = passed ? 'Exists' : 'Not found';
            } else {
              passed = bodyStr.includes(String(a.expected));
              received = passed ? 'Contains' : 'Missing';
            }
          }

          return {
            name: a.name || `${a.type.toUpperCase()}: ${a.target || ''}`,
            expected: a.expected,
            received,
            passed
          };
        });
        setTestResults(results);
      }

      // Add to execution history
      setHistory(prev => [
        {
          id: Date.now(),
          url: resolveTemplate(activeRequest.url),
          method: activeRequest.method,
          status: respData.status,
          duration: respData.duration,
          timestamp: new Date().toLocaleTimeString()
        },
        ...prev.slice(0, 19)
      ]);
    } catch (err) {
      setResponse({
        status: err.response?.data?.status || 500,
        statusText: err.response?.data?.statusText || 'ERROR',
        duration: err.response?.data?.duration || 0,
        size: 0,
        headers: {},
        data: err.response?.data?.error || err.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Run LLM Security Scan
  const handleRunScan = async () => {
    if (!activeRequest?.url) return;
    setIsScanning(true);
    setScanReport(null);

    try {
      const resolvedHeaders = {};
      (activeRequest.headers || []).forEach(h => {
        if (h.enabled && h.key) resolvedHeaders[h.key] = resolveTemplate(h.value);
      });

      if (activeRequest.auth?.type === 'bearer' && activeRequest.auth.token) {
        resolvedHeaders['Authorization'] = `Bearer ${resolveTemplate(activeRequest.auth.token)}`;
      }

      const resolvedParams = {};
      (activeRequest.params || []).forEach(p => {
        if (p.enabled && p.key) resolvedParams[p.key] = resolveTemplate(p.value);
      });

      let resolvedBody = null;
      if (activeRequest.body) {
        try {
          resolvedBody = JSON.parse(resolveTemplate(activeRequest.body));
        } catch {
          resolvedBody = resolveTemplate(activeRequest.body);
        }
      }

      const res = await axios.post('/api/scan', {
        url: resolveTemplate(activeRequest.url),
        method: activeRequest.method,
        headers: resolvedHeaders,
        params: resolvedParams,
        body: resolvedBody,
        provider: aiSettings.provider,
        apiKey: aiSettings.apiKey,
        model: aiSettings.model
      });

      setScanReport(res.data);
    } catch (err) {
      console.error('Scan failed:', err);
    } finally {
      setIsScanning(false);
    }
  };

  // 3. AI Test Generator
  const handleGenerateTests = async () => {
    if (!activeRequest?.url) return;
    setIsGeneratingTests(true);

    try {
      const res = await axios.post('/api/generate-tests', {
        url: resolveTemplate(activeRequest.url),
        method: activeRequest.method,
        sampleResponse: response?.data,
        body: activeRequest.body,
        provider: aiSettings.provider,
        apiKey: aiSettings.apiKey,
        model: aiSettings.model
      });

      if (res.data?.tests) {
        const incomingTests = (res.data.tests || []).map((t, idx) => ({
          ...t,
          id: `test-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`
        }));

        // Deduplicate against already existing assertions
        const existing = activeRequest.assertions || [];
        const existingKeys = new Set(
          existing.map(a => `${a.type}__${a.target || a.name}__${a.operator}__${a.expected}`)
        );

        const newUnique = incomingTests.filter(
          t => !existingKeys.has(`${t.type}__${t.target || t.name}__${t.operator}__${t.expected}`)
        );

        const merged = newUnique.length > 0 ? [...existing, ...newUnique] : incomingTests;
        handleChangeRequest({ ...activeRequest, assertions: merged });
      }
    } catch (err) {
      console.error('Generate tests failed:', err);
    } finally {
      setIsGeneratingTests(false);
    }
  };

  // 4. Natural Language Prompt to API Request
  const handleNlpPrompt = async (prompt) => {
    try {
      const res = await axios.post('/api/nlp-to-request', {
        prompt,
        baseUrl: environments[currentEnv]?.variables?.baseUrl || 'http://localhost:5000/api/mock',
        provider: aiSettings.provider,
        apiKey: aiSettings.apiKey,
        model: aiSettings.model
      });

      if (res.data?.url) {
        setActiveRequest({
          ...activeRequest,
          name: prompt,
          method: res.data.method || 'GET',
          url: res.data.url,
          body: res.data.body ? JSON.stringify(res.data.body, null, 2) : '',
          headers: Object.entries(res.data.headers || {}).map(([key, value]) => ({ key, value, enabled: true })),
          params: Object.entries(res.data.params || {}).map(([key, value]) => ({ key, value, enabled: true }))
        });
      }
    } catch (err) {
      console.error('NLP to request error:', err);
    }
  };

  // 5. Batch Collection Scan
  const handleStartBatchScan = async () => {
    setIsScanningBatch(true);
    setBatchProgress(0);
    setBatchResults([]);

    const allRequests = collections.flatMap(c => c.requests);
    const results = [];

    for (let i = 0; i < allRequests.length; i++) {
      const req = allRequests[i];
      try {
        const res = await axios.post('/api/scan', {
          url: resolveTemplate(req.url),
          method: req.method,
          provider: aiSettings.provider,
          apiKey: aiSettings.apiKey,
          model: aiSettings.model
        });
        results.push(res.data);
      } catch (err) {
        results.push({
          target: { url: resolveTemplate(req.url), method: req.method },
          score: 50,
          grade: 'D',
          vulnerabilities: [{ id: 'ERR', title: 'Target Connection Failed', severity: 'MEDIUM' }]
        });
      }
      setBatchProgress(Math.round(((i + 1) / allRequests.length) * 100));
      setBatchResults([...results]);
    }

    setIsScanningBatch(false);
  };

  // New Request Creator - Always creates a clean new request
  const handleNewRequest = () => {
    const newReq = {
      id: 'req-' + Date.now(),
      name: 'New Request',
      method: 'GET',
      url: '',
      headers: [],
      params: [],
      body: '',
      auth: { type: 'none' },
      assertions: []
    };

    setCollections(prev => {
      const next = [...prev];
      if (next.length === 0) {
        return [{
          id: 'col-my-apis',
          name: 'Tested APIs',
          description: 'Your tested APIs and endpoints',
          requests: [newReq]
        }];
      }
      return [{
        ...next[0],
        requests: [newReq, ...(next[0].requests || [])]
      }];
    });

    setActiveRequest(newReq);
    setResponse(null);
    setScanReport(null);
    setTestResults([]);
  };

  // Delete an individual request
  const handleDeleteRequest = (reqId) => {
    setCollections(prev => {
      const next = prev.map(col => ({
        ...col,
        requests: col.requests.filter(r => r.id !== reqId)
      }));

      if (activeRequest?.id === reqId) {
        const remaining = next[0]?.requests || [];
        if (remaining.length > 0) {
          setActiveRequest(remaining[0]);
        } else {
          const freshReq = {
            id: 'req-' + Date.now(),
            name: 'New Request',
            method: 'GET',
            url: '',
            headers: [],
            params: [],
            body: '',
            auth: { type: 'none' },
            assertions: []
          };
          setActiveRequest(freshReq);
        }
      }
      return next;
    });
  };

  // Clear all saved APIs - Completely deletes all saved requests!
  const handleClearAll = () => {
    const blankReq = {
      id: 'req-' + Date.now(),
      name: 'New Request',
      method: 'GET',
      url: '',
      headers: [],
      params: [],
      body: '',
      auth: { type: 'none' },
      assertions: []
    };

    const emptyCols = [
      {
        id: 'col-my-apis',
        name: 'Tested APIs',
        description: 'Your tested APIs and endpoints',
        requests: [] // Completely 0!
      }
    ];

    try {
      localStorage.removeItem('apitesting_collections');
      localStorage.removeItem('apitesting_active_request');
      localStorage.removeItem('apitesting_history');
      localStorage.removeItem('apipulse_collections');
      localStorage.removeItem('apipulse_active_request');
      localStorage.removeItem('apipulse_history');
    } catch (e) {
      console.error(e);
    }

    setCollections(emptyCols);
    setActiveRequest(blankReq);
    setHistory([]);
    setResponse(null);
    setScanReport(null);
    setTestResults([]);
  };

  return (
    <div className="relative flex flex-col h-screen w-screen bg-[#070b14] overflow-hidden text-slate-100 scan-radar-grid">
      {/* Fullscreen Matrix-Style Aizawa Intro Screen */}
      {showIntro && <MatrixIntro onComplete={() => setShowIntro(false)} />}

      {/* Top Header */}
      <Header
        currentEnv={currentEnv}
        setCurrentEnv={setCurrentEnv}
        environments={environments}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onRunBatchScan={() => setIsBatchScanOpen(true)}
        onReplayIntro={() => setShowIntro(true)}
        aiProvider={aiSettings.provider}
        isScanningBatch={isScanningBatch}
      />

      {/* Main Workspace Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          collections={collections}
          activeRequestId={activeRequest?.id}
          onSelectRequest={(req) => {
            setActiveRequest(req);
            setResponse(null);
            setScanReport(null);
            setTestResults([]);
          }}
          onNewRequest={handleNewRequest}
          onDeleteRequest={handleDeleteRequest}
          history={history}
          onClearHistory={() => setHistory([])}
          onSelectHistoryItem={(item) => {
            handleChangeRequest({
              ...activeRequest,
              url: item.url,
              method: item.method
            });
          }}
          onClearAll={handleClearAll}
        />

        {/* Center / Right Panels */}
        <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Request Section */}
          <div className="w-full md:w-1/2 h-1/2 md:h-full border-r border-cyber-border flex flex-col">
            <RequestBuilder
              request={activeRequest}
              onChangeRequest={handleChangeRequest}
              onSendRequest={handleSendRequest}
              onRunScan={handleRunScan}
              onGenerateTests={handleGenerateTests}
              onNlpPrompt={handleNlpPrompt}
              isLoading={isLoading}
              isScanning={isScanning}
              isGeneratingTests={isGeneratingTests}
              environments={environments}
              currentEnv={currentEnv}
            />
          </div>

          {/* Response & AI Scan Report Section */}
          <div className="w-full md:w-1/2 h-1/2 md:h-full flex flex-col bg-cyber-bg/95">
            <ResponsePanel
              response={response}
              scanReport={scanReport}
              testResults={testResults}
              isScanning={isScanning}
              isLoading={isLoading}
            />
          </div>
        </main>
      </div>

      {/* Modals */}
      <BatchScanModal
        isOpen={isBatchScanOpen}
        onClose={() => setIsBatchScanOpen(false)}
        isScanning={isScanningBatch}
        progress={batchProgress}
        batchResults={batchResults}
        onStartBatchScan={handleStartBatchScan}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        environments={environments}
        setEnvironments={setEnvironments}
        currentEnv={currentEnv}
        aiSettings={aiSettings}
        setAiSettings={setAiSettings}
      />
    </div>
  );
}
