import React, { useState } from 'react';
import { Key, Plus, Search, Shield, Clock, Activity, MoreVertical, RefreshCw, Trash2, Copy, CheckCircle2, XCircle } from 'lucide-react';

const MOCK_TOKENS = [
  { id: 'tk_001', name: '生产环境主API Key', type: 'API Key', status: 'active', created: '2026-01-15', lastUsed: '10分钟前', usage: '1.2M / 5M', scopes: ['所有权限'] },
  { id: 'tk_002', name: '测试环境只读Token', type: 'Bearer Token', status: 'active', created: '2026-02-20', lastUsed: '2小时前', usage: '45K / 100K', scopes: ['只读'] },
  { id: 'tk_003', name: '第三方合作方A授权', type: 'OAuth2', status: 'expired', created: '2025-11-01', lastUsed: '2026-03-01', usage: '0 / 10K', scopes: ['特定接口'] },
  { id: 'tk_004', name: '临时调试Token', type: 'Bearer Token', status: 'active', created: '2026-04-01', lastUsed: '刚刚', usage: '12 / 1000', scopes: ['调试'] },
];

export default function TokenApiManager() {
  const [tokens, setTokens] = useState(MOCK_TOKENS);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string) => {
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredTokens = tokens.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-slate-50 relative">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Key className="w-6 h-6 text-indigo-500" />
              Token&API管理
            </h1>
            <p className="text-slate-500 mt-1">集中管理系统API密钥、OAuth授权及调用额度监控</p>
          </div>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            新建 Token
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div className="text-slate-500 font-medium text-sm">活跃 Token</div>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><CheckCircle2 className="w-5 h-5" /></div>
            </div>
            <div className="text-3xl font-bold text-slate-800">3</div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div className="text-slate-500 font-medium text-sm">今日总调用量</div>
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Activity className="w-5 h-5" /></div>
            </div>
            <div className="text-3xl font-bold text-slate-800">1.24M</div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div className="text-slate-500 font-medium text-sm">异常调用拦截</div>
              <div className="p-2 bg-red-50 text-red-600 rounded-lg"><Shield className="w-5 h-5" /></div>
            </div>
            <div className="text-3xl font-bold text-slate-800">42</div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div className="text-slate-500 font-medium text-sm">即将过期</div>
              <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><Clock className="w-5 h-5" /></div>
            </div>
            <div className="text-3xl font-bold text-slate-800">1</div>
          </div>
        </div>

        {/* List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <div className="relative w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="搜索 Token 名称或类型..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-medium">名称 / ID</th>
                  <th className="px-6 py-4 font-medium">类型</th>
                  <th className="px-6 py-4 font-medium">状态</th>
                  <th className="px-6 py-4 font-medium">权限范围</th>
                  <th className="px-6 py-4 font-medium">调用额度</th>
                  <th className="px-6 py-4 font-medium">最后使用</th>
                  <th className="px-6 py-4 font-medium text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTokens.map((token) => (
                  <tr key={token.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-800">{token.name}</div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">{token.id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-medium">
                        {token.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {token.status === 'active' ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200/50">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          正常
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                          已过期
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1 flex-wrap">
                        {token.scopes.map(scope => (
                          <span key={scope} className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-xs border border-indigo-100">
                            {scope}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-600 font-mono text-xs">{token.usage}</div>
                      <div className="w-24 h-1.5 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                        <div 
                          className="h-full bg-indigo-500 rounded-full" 
                          style={{ width: token.usage.includes('1.2M') ? '24%' : token.usage.includes('45K') ? '45%' : token.usage.includes('12') ? '1%' : '0%' }}
                        ></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {token.lastUsed}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleCopy(token.id)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="复制 Token"
                        >
                          {copiedId === token.id ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                        </button>
                        <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="刷新/重置">
                          <RefreshCw className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="删除">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
