import React, { useState } from 'react';
import { 
  Send, 
  ShieldAlert, 
  Sparkles, 
  Plus, 
  Trash2, 
  Code2, 
  KeyRound, 
  Sliders, 
  FileText, 
  CheckSquare,
  Bot,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { HTTP_METHODS } from '../constants';

export default function RequestBuilder({
  request,
  onChangeRequest,
  onSendRequest,
  onRunScan,
  onGenerateTests,
  onNlpPrompt,
  isLoading,
  isScanning,
  isGeneratingTests,
  environments,
  currentEnv
}) {
  const [activeTab, setActiveTab] = useState('params'); // 'params' | 'headers' | 'auth' | 'body' | 'assertions'
  const [nlpInput, setNlpInput] = useState('');
  const [isNlpLoading, setIsNlpLoading] = useState(false);

  // Method color helper
  const currentMethodObj = HTTP_METHODS.find(m => m.name === request.method.toUpperCase()) || HTTP_METHODS[0];

  // Resolve environment variables in URL
  const resolveUrl = (rawUrl) => {
    let resolved = rawUrl || '';
    const vars = environments[currentEnv]?.variables || {};
    for (const [key, val] of Object.entries(vars)) {
      resolved = resolved.replaceAll(`{{${key}}}`, val);
    }
    return resolved;
  };

  // Natural Language prompt submit
  const handleNlpSubmit = async (e) => {
    e.preventDefault();
    if (!nlpInput.trim()) return;
    setIsNlpLoading(true);
    await onNlpPrompt(nlpInput);
    setIsNlpLoading(false);
    setNlpInput('');
  };

  // Param helpers
  const addParam = () => {
    const updated = [...(request.params || []), { key: '', value: '', enabled: true }];
    onChangeRequest({ ...request, params: updated });
  };

  const updateParam = (index, field, value) => {
    const updated = [...(request.params || [])];
    updated[index][field] = value;
    onChangeRequest({ ...request, params: updated });
  };

  const deleteParam = (index) => {
    const updated = (request.params || []).filter((_, i) => i !== index);
    onChangeRequest({ ...request, params: updated });
  };

  // Header helpers
  const addHeader = () => {
    const updated = [...(request.headers || []), { key: '', value: '', enabled: true }];
    onChangeRequest({ ...request, headers: updated });
  };

  const updateHeader = (index, field, value) => {
    const updated = [...(request.headers || [])];
    updated[index][field] = value;
    onChangeRequest({ ...request, headers: updated });
  };

  const deleteHeader = (index) => {
    const updated = (request.headers || []).filter((_, i) => i !== index);
    onChangeRequest({ ...request, headers: updated });
  };

  // Assertion helpers
  const addAssertion = () => {
    const newId = `assert-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const updated = [
      ...(request.assertions || []),
      { id: newId, type: 'status', target: 'status', operator: 'equals', expected: 200 }
    ];
    onChangeRequest({ ...request, assertions: updated });
  };

  const deleteAssertion = (index) => {
    const current = request.assertions || [];
    const updated = current.filter((_, i) => i !== index);
    onChangeRequest({ ...request, assertions: updated });
  };

  const clearAllAssertions = () => {
    onChangeRequest({ ...request, assertions: [] });
  };

  const formatJsonBody = () => {
    try {
      if (!request.body) return;
      const formatted = JSON.stringify(JSON.parse(request.body), null, 2);
      onChangeRequest({ ...request, body: formatted });
    } catch {
      // invalid JSON, ignore
    }
  };

  return (
    <div className="flex flex-col h-full bg-cyber-bg overflow-hidden border-b border-cyber-border">
      {/* 1. Request Bar */}
      <div className="p-3 bg-cyber-panel/60 border-b border-cyber-border space-y-2.5">
        <div className="flex items-center justify-between">
          <input
            type="text"
            value={request.name || ''}
            onChange={(e) => onChangeRequest({ ...request, name: e.target.value })}
            placeholder="Request Name (e.g. My API Check)"
            className="text-xs font-semibold text-slate-200 hover:text-white bg-transparent border-b border-transparent hover:border-slate-600 focus:border-cyan-500 focus:outline-none px-1 py-0.5 transition-all w-72"
          />
          <span className="text-[10px] text-slate-500 font-mono">Auto-saved</span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Method Dropdown */}
          <div className="relative">
            <select
              value={request.method}
              onChange={(e) => onChangeRequest({ ...request, method: e.target.value })}
              className={`font-mono font-bold text-xs px-3 py-2 rounded-xl border bg-cyber-bg cursor-pointer focus:outline-none appearance-none pr-8 ${currentMethodObj.color}`}
            >
              {HTTP_METHODS.map(m => (
                <option key={m.name} value={m.name} className="bg-cyber-panel text-slate-100 font-bold">
                  {m.name}
                </option>
              ))}
            </select>
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">▼</div>
          </div>

          {/* URL Input */}
          <div className="flex-1 relative flex items-center">
            <input
              type="text"
              value={request.url}
              onChange={(e) => {
                const newUrl = e.target.value;
                const shouldUpdateName = !request.name || request.name === request.url || request.name === 'New API Request' || request.name === 'New Custom Endpoint';
                onChangeRequest({
                  ...request,
                  url: newUrl,
                  name: shouldUpdateName ? newUrl : request.name
                });
              }}
              placeholder="Enter endpoint URL (e.g. http://localhost:5001/api/contact)"
              className="w-full pl-3.5 pr-2 py-2 text-xs font-mono bg-cyber-bg border border-cyber-border rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/20 shadow-inner"
            />
          </div>

          {/* Action Buttons */}
          <button
            onClick={onSendRequest}
            disabled={isLoading}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25 transition-all duration-200 active:scale-95 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            <span>{isLoading ? 'Sending...' : 'Send'}</span>
          </button>

          <button
            onClick={onRunScan}
            disabled={isScanning}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white shadow-lg shadow-rose-500/20 transition-all duration-200 active:scale-95 disabled:opacity-50"
            title="Scan endpoint for OWASP Top 10 API Vulnerabilities"
          >
            {isScanning ? (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <ShieldAlert className="w-3.5 h-3.5" />
            )}
            <span>{isScanning ? 'Scanning...' : 'LLM Scan'}</span>
          </button>

          <button
            onClick={onGenerateTests}
            disabled={isGeneratingTests}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 border border-indigo-500/30 transition-all duration-200 active:scale-95 disabled:opacity-50"
            title="Auto-generate assertion tests using LLM"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden xl:inline">AI Tests</span>
          </button>
        </div>

        {/* 2. Natural Language AI Copilot Bar */}
        <form onSubmit={handleNlpSubmit} className="flex items-center space-x-2 bg-cyber-card/70 border border-cyber-border/80 px-2.5 py-1.5 rounded-xl">
          <Bot className="w-4 h-4 text-purple-400 shrink-0" />
          <input
            type="text"
            value={nlpInput}
            onChange={(e) => setNlpInput(e.target.value)}
            placeholder="AI Prompt: 'Test login with invalid password' or 'Create order with role admin'..."
            className="flex-1 bg-transparent text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={isNlpLoading || !nlpInput.trim()}
            className="flex items-center space-x-1 text-[11px] font-semibold text-purple-300 hover:text-purple-200 px-2 py-0.5 rounded bg-purple-500/20 border border-purple-500/30 disabled:opacity-40"
          >
            {isNlpLoading ? <span>Generating...</span> : <span>Apply <ArrowRight className="w-3 h-3 inline" /></span>}
          </button>
        </form>
      </div>

      {/* 3. Configuration Sub-Tabs */}
      <div className="flex items-center border-b border-cyber-border bg-cyber-panel/40 px-3 text-xs select-none">
        {[
          { id: 'params', label: 'Params', icon: Sliders, badge: request.params?.length },
          { id: 'headers', label: 'Headers', icon: FileText, badge: request.headers?.length },
          { id: 'auth', label: 'Auth', icon: KeyRound, badge: request.auth?.type !== 'none' ? '✓' : null },
          { id: 'body', label: 'Body', icon: Code2, badge: request.body ? 'JSON' : null },
          { id: 'assertions', label: 'Assertions', icon: CheckSquare, badge: request.assertions?.length }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-1.5 py-2.5 px-3 font-medium border-b-2 transition-all duration-150 ${
                isActive
                  ? 'border-cyan-400 text-cyan-300 bg-cyan-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-cyber-card border border-cyber-border text-slate-400 font-mono">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 4. Tab Content Panels */}
      <div className="flex-1 overflow-y-auto p-3 text-xs">
        {/* PARAMS TAB */}
        {activeTab === 'params' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 font-mono text-[11px]">Query Parameters</span>
              <button
                onClick={addParam}
                className="flex items-center space-x-1 text-cyan-400 hover:text-cyan-300 font-semibold text-[11px]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Parameter</span>
              </button>
            </div>

            {(!request.params || request.params.length === 0) ? (
              <p className="text-slate-500 italic text-[11px] py-4 text-center">No query parameters added yet.</p>
            ) : (
              request.params.map((param, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={param.enabled}
                    onChange={(e) => updateParam(idx, 'enabled', e.target.checked)}
                    className="accent-cyan-500 rounded"
                  />
                  <input
                    type="text"
                    value={param.key}
                    onChange={(e) => updateParam(idx, 'key', e.target.value)}
                    placeholder="Key (e.g. q)"
                    className="flex-1 bg-cyber-panel border border-cyber-border px-2.5 py-1 rounded text-slate-200 font-mono"
                  />
                  <input
                    type="text"
                    value={param.value}
                    onChange={(e) => updateParam(idx, 'value', e.target.value)}
                    placeholder="Value"
                    className="flex-1 bg-cyber-panel border border-cyber-border px-2.5 py-1 rounded text-slate-200 font-mono"
                  />
                  <button
                    onClick={() => deleteParam(idx)}
                    className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* HEADERS TAB */}
        {activeTab === 'headers' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 font-mono text-[11px]">HTTP Request Headers</span>
              <button
                onClick={addHeader}
                className="flex items-center space-x-1 text-cyan-400 hover:text-cyan-300 font-semibold text-[11px]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Header</span>
              </button>
            </div>

            {(!request.headers || request.headers.length === 0) ? (
              <p className="text-slate-500 italic text-[11px] py-4 text-center">No custom headers defined.</p>
            ) : (
              request.headers.map((h, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={h.enabled}
                    onChange={(e) => updateHeader(idx, 'enabled', e.target.checked)}
                    className="accent-cyan-500 rounded"
                  />
                  <input
                    type="text"
                    value={h.key}
                    onChange={(e) => updateHeader(idx, 'key', e.target.value)}
                    placeholder="Header (e.g. Authorization)"
                    className="flex-1 bg-cyber-panel border border-cyber-border px-2.5 py-1 rounded text-slate-200 font-mono"
                  />
                  <input
                    type="text"
                    value={h.value}
                    onChange={(e) => updateHeader(idx, 'value', e.target.value)}
                    placeholder="Value"
                    className="flex-1 bg-cyber-panel border border-cyber-border px-2.5 py-1 rounded text-slate-200 font-mono"
                  />
                  <button
                    onClick={() => deleteHeader(idx)}
                    className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* AUTH TAB */}
        {activeTab === 'auth' && (
          <div className="space-y-3 max-w-lg">
            <div>
              <label className="block text-slate-400 mb-1 text-[11px]">Authentication Type</label>
              <select
                value={request.auth?.type || 'none'}
                onChange={(e) => onChangeRequest({ ...request, auth: { ...(request.auth || {}), type: e.target.value } })}
                className="w-full bg-cyber-panel border border-cyber-border rounded-lg px-2.5 py-1.5 text-slate-200 font-mono text-xs focus:outline-none"
              >
                <option value="none">No Auth</option>
                <option value="bearer">Bearer Token</option>
                <option value="apikey">API Key Header</option>
              </select>
            </div>

            {request.auth?.type === 'bearer' && (
              <div>
                <label className="block text-slate-400 mb-1 text-[11px]">Bearer Token / Variable</label>
                <input
                  type="text"
                  value={request.auth?.token || ''}
                  onChange={(e) => onChangeRequest({ ...request, auth: { ...(request.auth || {}), token: e.target.value } })}
                  placeholder="eyJhbGciOi... or {{token}}"
                  className="w-full bg-cyber-panel border border-cyber-border rounded-lg px-2.5 py-1.5 text-slate-200 font-mono text-xs focus:outline-none"
                />
              </div>
            )}

            {request.auth?.type === 'apikey' && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1 text-[11px]">Header Key</label>
                  <input
                    type="text"
                    value={request.auth?.apiKeyHeader || 'X-API-Key'}
                    onChange={(e) => onChangeRequest({ ...request, auth: { ...(request.auth || {}), apiKeyHeader: e.target.value } })}
                    className="w-full bg-cyber-panel border border-cyber-border rounded-lg px-2.5 py-1.5 text-slate-200 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 text-[11px]">Key Value</label>
                  <input
                    type="text"
                    value={request.auth?.apiKeyValue || ''}
                    onChange={(e) => onChangeRequest({ ...request, auth: { ...(request.auth || {}), apiKeyValue: e.target.value } })}
                    placeholder="sk_live_..."
                    className="w-full bg-cyber-panel border border-cyber-border rounded-lg px-2.5 py-1.5 text-slate-200 font-mono text-xs"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* BODY TAB */}
        {activeTab === 'body' && (
          <div className="space-y-2 h-full flex flex-col">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-mono text-[11px]">JSON Payload</span>
              <button
                onClick={formatJsonBody}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold"
              >
                Format / Beautify JSON
              </button>
            </div>
            <textarea
              value={request.body || ''}
              onChange={(e) => onChangeRequest({ ...request, body: e.target.value })}
              placeholder='{\n  "key": "value"\n}'
              rows={8}
              className="w-full flex-1 bg-cyber-panel border border-cyber-border rounded-xl p-3 text-slate-200 font-mono text-xs focus:outline-none focus:border-cyan-500/50 resize-y"
            />
          </div>
        )}

        {/* ASSERTIONS TAB */}
        {activeTab === 'assertions' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 font-mono text-[11px]">
                Automated Test Assertions ({request.assertions?.length || 0})
              </span>
              <div className="flex items-center space-x-3">
                {request.assertions?.length > 0 && (
                  <button
                    type="button"
                    onClick={clearAllAssertions}
                    className="flex items-center space-x-1 text-rose-400 hover:text-rose-300 font-semibold text-[11px] transition-colors"
                    title="Remove all test assertions"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear All</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={addAssertion}
                  className="flex items-center space-x-1 text-cyan-400 hover:text-cyan-300 font-semibold text-[11px]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Assertion</span>
                </button>
              </div>
            </div>

            {(!request.assertions || request.assertions.length === 0) ? (
              <div className="text-center py-6 text-slate-500">
                <CheckSquare className="w-6 h-6 mx-auto mb-1 opacity-40" />
                <p>No test assertions defined. Click "AI Tests" above to auto-generate contract checks!</p>
              </div>
            ) : (
              request.assertions.map((a, idx) => {
                const rowKey = a.id ? `${a.id}-${idx}` : `assert-${idx}`;
                return (
                  <div key={rowKey} className="flex items-center space-x-2 bg-cyber-panel/60 p-2 rounded-lg border border-cyber-border/70 group hover:border-cyber-border transition-all">
                    <span className="font-mono text-cyan-400 text-[10px] w-14 font-bold uppercase truncate" title={a.type}>{a.type}</span>
                    <input
                      type="text"
                      value={a.name ?? a.target ?? ''}
                      onChange={(e) => {
                        const updated = [...request.assertions];
                        updated[idx] = { ...updated[idx], name: e.target.value };
                        onChangeRequest({ ...request, assertions: updated });
                      }}
                      placeholder="Assertion name"
                      className="flex-1 bg-cyber-bg border border-cyber-border px-2 py-0.5 rounded text-slate-200 font-mono text-xs focus:outline-none focus:border-cyan-500/50"
                    />
                    <span className="text-slate-400 text-xs font-mono">{a.operator}</span>
                    <input
                      type="text"
                      value={a.expected ?? ''}
                      onChange={(e) => {
                        const updated = [...request.assertions];
                        updated[idx] = { ...updated[idx], expected: e.target.value };
                        onChangeRequest({ ...request, assertions: updated });
                      }}
                      placeholder="Expected"
                      className="w-24 bg-cyber-bg border border-cyber-border px-2 py-0.5 rounded text-slate-200 font-mono text-xs focus:outline-none focus:border-cyan-500/50"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        deleteAssertion(idx);
                      }}
                      title="Delete this assertion"
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
