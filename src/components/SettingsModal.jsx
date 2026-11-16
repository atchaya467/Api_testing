import React, { useState } from 'react';
import { 
  X, 
  Settings, 
  Sparkles, 
  Server, 
  Plus, 
  Trash2, 
  KeyRound, 
  Check, 
  ExternalLink 
} from 'lucide-react';

export default function SettingsModal({
  isOpen,
  onClose,
  environments,
  setEnvironments,
  currentEnv,
  aiSettings,
  setAiSettings
}) {
  const [activeTab, setActiveTab] = useState('env'); // 'env' | 'ai'
  const [newVarKey, setNewVarKey] = useState('');
  const [newVarVal, setNewVarVal] = useState('');

  if (!isOpen) return null;

  const currentVariables = environments[currentEnv]?.variables || {};

  const handleAddVariable = (e) => {
    e.preventDefault();
    if (!newVarKey.trim()) return;
    const updated = {
      ...environments,
      [currentEnv]: {
        ...environments[currentEnv],
        variables: {
          ...currentVariables,
          [newVarKey.trim()]: newVarVal
        }
      }
    };
    setEnvironments(updated);
    setNewVarKey('');
    setNewVarVal('');
  };

  const handleDeleteVariable = (key) => {
    const copy = { ...currentVariables };
    delete copy[key];
    setEnvironments({
      ...environments,
      [currentEnv]: {
        ...environments[currentEnv],
        variables: copy
      }
    });
  };

  const handleUpdateVariable = (key, value) => {
    setEnvironments({
      ...environments,
      [currentEnv]: {
        ...environments[currentEnv],
        variables: {
          ...currentVariables,
          [key]: value
        }
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-2xl bg-cyber-panel border border-cyber-border rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-cyber-border flex items-center justify-between bg-cyber-bg/50">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Settings & Configuration</h3>
              <p className="text-xs text-slate-400">Manage environment variables and LLM AI engine providers</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-cyber-card transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab navigation */}
        <div className="flex border-b border-cyber-border bg-cyber-bg/40 px-4 text-xs">
          <button
            onClick={() => setActiveTab('env')}
            className={`py-2.5 px-4 font-semibold border-b-2 flex items-center gap-1.5 transition-all ${
              activeTab === 'env'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Environment Variables ({environments[currentEnv]?.name})</span>
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`py-2.5 px-4 font-semibold border-b-2 flex items-center gap-1.5 transition-all ${
              activeTab === 'ai'
                ? 'border-purple-400 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Copilot & LLM Provider</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4 text-xs">
          {activeTab === 'env' && (
            <div className="space-y-4">
              <p className="text-slate-400">
                Variables can be referenced anywhere in URLs, headers, or request bodies using <code className="text-cyan-400 bg-cyber-bg px-1.5 py-0.5 rounded border border-cyber-border">{'{{variable_name}}'}</code>.
              </p>

              {/* Add Variable Form */}
              <form onSubmit={handleAddVariable} className="flex items-center space-x-2 bg-cyber-bg p-2 rounded-xl border border-cyber-border">
                <input
                  type="text"
                  placeholder="Variable name (e.g. baseUrl)"
                  value={newVarKey}
                  onChange={(e) => setNewVarKey(e.target.value)}
                  className="flex-1 bg-cyber-panel border border-cyber-border px-2.5 py-1.5 rounded-lg text-slate-200 font-mono text-xs focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Value"
                  value={newVarVal}
                  onChange={(e) => setNewVarVal(e.target.value)}
                  className="flex-1 bg-cyber-panel border border-cyber-border px-2.5 py-1.5 rounded-lg text-slate-200 font-mono text-xs focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!newVarKey.trim()}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30 font-semibold disabled:opacity-40"
                >
                  Add
                </button>
              </form>

              {/* Variables List */}
              <div className="space-y-2">
                {Object.entries(currentVariables).map(([key, val]) => (
                  <div key={key} className="flex items-center space-x-2 p-2 rounded-xl bg-cyber-card border border-cyber-border font-mono">
                    <span className="text-cyan-400 font-bold w-32 truncate">{key}</span>
                    <input
                      type="text"
                      value={val}
                      onChange={(e) => handleUpdateVariable(key, e.target.value)}
                      className="flex-1 bg-cyber-bg border border-cyber-border px-2.5 py-1 rounded text-slate-200 text-xs"
                    />
                    <button
                      onClick={() => handleDeleteVariable(key)}
                      className="p-1 text-slate-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="space-y-4">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">AI Intelligence Provider</label>
                <select
                  value={aiSettings.provider}
                  onChange={(e) => setAiSettings({ ...aiSettings, provider: e.target.value })}
                  className="w-full bg-cyber-bg border border-cyber-border rounded-xl px-3 py-2 text-slate-200 font-mono text-xs focus:outline-none"
                >
                  <option value="built-in">Built-in Expert Heuristic & AST Engine (No API key needed! Works offline)</option>
                  <option value="gemini">Google Gemini API (gemini-2.0-flash / gemini-1.5-flash)</option>
                  <option value="openai">OpenAI (GPT-4o, GPT-4o-mini)</option>
                  <option value="ollama">Ollama (Local LLM via http://localhost:11434)</option>
                </select>
              </div>

              {aiSettings.provider === 'gemini' && (
                <div className="space-y-3 p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/30">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-cyan-300">Google Gemini Configuration</span>
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noreferrer"
                      className="text-cyan-400 hover:underline flex items-center gap-1 text-[11px]"
                    >
                      Get Gemini API Key <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Gemini API Key</label>
                    <input
                      type="password"
                      value={aiSettings.apiKey || ''}
                      onChange={(e) => setAiSettings({ ...aiSettings, apiKey: e.target.value })}
                      placeholder="AIzaSy..."
                      className="w-full bg-cyber-bg border border-cyber-border rounded-lg px-2.5 py-1.5 text-slate-200 font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Model Name</label>
                    <select
                      value={aiSettings.model || 'gemini-1.5-flash'}
                      onChange={(e) => setAiSettings({ ...aiSettings, model: e.target.value })}
                      className="w-full bg-cyber-bg border border-cyber-border rounded-lg px-2.5 py-1.5 text-slate-200 font-mono text-xs"
                    >
                      <option value="gemini-2.0-flash">gemini-2.0-flash (Ultra fast & reasoning)</option>
                      <option value="gemini-1.5-flash">gemini-1.5-flash (Standard)</option>
                      <option value="gemini-1.5-pro">gemini-1.5-pro (Deep penetration analysis)</option>
                    </select>
                  </div>
                </div>
              )}

              {aiSettings.provider === 'openai' && (
                <div className="space-y-3 p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/30">
                  <span className="font-semibold text-purple-300">OpenAI Configuration</span>
                  <div>
                    <label className="block text-slate-400 mb-1">OpenAI API Key</label>
                    <input
                      type="password"
                      value={aiSettings.apiKey || ''}
                      onChange={(e) => setAiSettings({ ...aiSettings, apiKey: e.target.value })}
                      placeholder="sk-..."
                      className="w-full bg-cyber-bg border border-cyber-border rounded-lg px-2.5 py-1.5 text-slate-200 font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Model</label>
                    <input
                      type="text"
                      value={aiSettings.model || 'gpt-4o-mini'}
                      onChange={(e) => setAiSettings({ ...aiSettings, model: e.target.value })}
                      placeholder="gpt-4o-mini or gpt-4o"
                      className="w-full bg-cyber-bg border border-cyber-border rounded-lg px-2.5 py-1.5 text-slate-200 font-mono text-xs"
                    />
                  </div>
                </div>
              )}

              {aiSettings.provider === 'built-in' && (
                <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-300">
                  <div className="font-semibold mb-1">Built-in Intelligence Engine Active</div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Zero configuration needed. API Testing executes multi-probe fuzzing against OWASP API Top 10 vulnerabilities directly from your server with instant results and automated remediation scripts.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-cyber-border bg-cyber-bg/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
