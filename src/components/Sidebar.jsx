import React, { useState } from 'react';
import { 
  Folder, 
  FolderOpen, 
  Plus, 
  Clock, 
  ChevronRight, 
  ChevronDown, 
  FileCode, 
  Sparkles,
  Trash2,
  RefreshCw,
  Search
} from 'lucide-react';
import { HTTP_METHODS } from '../constants';

export default function Sidebar({ 
  collections, 
  activeRequestId, 
  onSelectRequest, 
  onNewRequest, 
  onDeleteRequest,
  history, 
  onClearHistory, 
  onSelectHistoryItem,
  onClearAll
}) {
  const [activeTab, setActiveTab] = useState('apis'); // 'apis' | 'history'
  const [filterText, setFilterText] = useState('');

  const allRequests = collections.flatMap(col => col.requests);
  const filteredRequests = allRequests.filter(r => 
    (r.name || '').toLowerCase().includes(filterText.toLowerCase()) || 
    (r.url || '').toLowerCase().includes(filterText.toLowerCase())
  );

  const getMethodBadge = (method) => {
    const item = HTTP_METHODS.find(m => m.name === method.toUpperCase()) || HTTP_METHODS[0];
    return (
      <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${item.color} min-w-[42px] text-center`}>
        {method.toUpperCase()}
      </span>
    );
  };

  return (
    <aside className="w-72 h-[calc(100vh-3.5rem)] bg-cyber-panel border-r border-cyber-border flex flex-col select-none">
      {/* Top Sidebar Navigation Tabs */}
      <div className="flex border-b border-cyber-border p-1 bg-cyber-bg/50">
        <button
          onClick={() => setActiveTab('apis')}
          className={`flex-1 flex items-center justify-center space-x-1.5 py-1.5 text-xs font-semibold rounded-md transition-all ${
            activeTab === 'apis'
              ? 'bg-cyber-card text-cyan-300 shadow-sm border border-cyber-border'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileCode className="w-3.5 h-3.5" />
          <span>Tested APIs ({allRequests.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 flex items-center justify-center space-x-1.5 py-1.5 text-xs font-semibold rounded-md transition-all ${
            activeTab === 'history'
              ? 'bg-cyber-card text-cyan-300 shadow-sm border border-cyber-border'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>History ({history.length})</span>
        </button>
      </div>

      {/* Action / Search Bar */}
      <div className="p-2 border-b border-cyber-border/60 flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter tested APIs..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="w-full pl-8 pr-2 py-1 text-xs bg-cyber-bg border border-cyber-border rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
          />
        </div>
        <button
          onClick={onNewRequest}
          className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 border border-cyan-500/30 transition-colors"
          title="Add New API to Test"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {activeTab === 'apis' ? (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-1 mb-2">
              <span className="text-[11px] text-slate-400 font-mono">
                Saved Endpoints ({allRequests.length})
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">Auto-saved</span>
            </div>

            {filteredRequests.length === 0 ? (
              <div className="text-center py-10 px-4 text-slate-500 text-xs">
                <FileCode className="w-8 h-8 mx-auto mb-2 opacity-30 text-cyan-400" />
                <p className="font-semibold text-slate-400">No APIs tested yet</p>
                <p className="text-[11px] text-slate-500 mt-1">Enter your API URL and click Send to test & store it here.</p>
              </div>
            ) : (
              filteredRequests.map(req => {
                const isSelected = activeRequestId === req.id;
                const displayUrl = req.url || 'New Endpoint (Empty)';
                const hasCustomName = req.name && req.name !== 'New API Request' && req.name !== req.url && req.name !== 'Untitled Endpoint';

                return (
                  <div
                    key={req.id}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition-all group ${
                      isSelected
                        ? 'bg-cyan-500/15 text-cyan-200 border border-cyan-500/40 shadow-sm'
                        : 'bg-cyber-card/40 text-slate-400 hover:text-slate-200 hover:bg-cyber-card border border-cyber-border/40'
                    }`}
                  >
                    <button
                      onClick={() => onSelectRequest(req)}
                      className="flex items-center space-x-2 truncate flex-1 text-left min-w-0"
                    >
                      {getMethodBadge(req.method)}
                      <div className="truncate flex-1 min-w-0">
                        <div className="truncate font-mono text-[11px] text-slate-200 font-medium">
                          {hasCustomName ? req.name : displayUrl}
                        </div>
                        {hasCustomName && req.url && (
                          <div className="truncate font-mono text-[9px] text-slate-500">{displayUrl}</div>
                        )}
                      </div>
                    </button>
                    {onDeleteRequest && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteRequest(req.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1.5 hover:text-rose-400 text-slate-500 transition-opacity ml-1 rounded-lg hover:bg-rose-500/10"
                        title="Delete this API"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        ) : (
          /* History View */
          <div className="space-y-1">
            <div className="flex items-center justify-between px-1 mb-2">
              <span className="text-[11px] text-slate-400 font-mono">Recent Executions</span>
              {history.length > 0 && (
                <button
                  onClick={onClearHistory}
                  className="text-[10px] text-rose-400 hover:text-rose-300 flex items-center space-x-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                <Clock className="w-6 h-6 mx-auto mb-2 opacity-40" />
                No requests sent yet.
              </div>
            ) : (
              history.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectHistoryItem(item)}
                  className="w-full flex items-center justify-between p-2 rounded-lg bg-cyber-card/40 hover:bg-cyber-card border border-cyber-border/50 text-xs text-left transition-all"
                >
                  <div className="flex items-center space-x-2 truncate flex-1">
                    {getMethodBadge(item.method)}
                    <span className="truncate text-slate-300 font-mono text-[11px]">{item.url}</span>
                  </div>
                  <div className="flex items-center space-x-1.5 ml-2">
                    <span className={`text-[10px] font-mono px-1 rounded ${
                      item.status >= 200 && item.status < 300 
                        ? 'text-emerald-400 bg-emerald-500/10' 
                        : 'text-rose-400 bg-rose-500/10'
                    }`}>
                      {item.status}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">{item.duration}ms</span>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Bottom Quick Tools */}
      <div className="p-2 border-t border-cyber-border bg-cyber-bg/40 flex items-center justify-between">
        <button
          onClick={onClearAll}
          className="w-full flex items-center justify-center space-x-1.5 py-1.5 text-xs text-rose-400/80 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors border border-rose-500/20"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear All Saved APIs</span>
        </button>
      </div>
    </aside>
  );
}
