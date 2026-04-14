import React, { useState } from 'react';
import { Network, MessageSquare, Mail, Database, Server, Plus, CircleCheck, MapPin, CloudRain, Radio, Car, X, Settings2, Activity, Key } from 'lucide-react';

const CATEGORIES = [
  { id: 'data-access', name: '资料接入管理', badge: '接入' },
  { id: 'data-exploration', name: '资料探查管理', badge: '探查' }
];

const CONNECTORS = [
  // 资料接入管理
  { id: 101, category: 'data-access', name: '物流回流数据流', desc: '接入物流回流实时数据，支持高频轨迹打点与偏航预警。', icon: <Car className="w-6 h-6 text-indigo-500" />, status: 'connected' },
  { id: 102, category: 'data-access', name: '丰行数据接入', desc: '连接丰行数据网络，实时回传空间状态数据。', icon: <Radio className="w-6 h-6 text-emerald-500" />, status: 'disconnected' },
  { id: 103, category: 'data-access', name: '其他来源 API', desc: '接入第三方补充数据源。', icon: <CloudRain className="w-6 h-6 text-sky-500" />, status: 'connected' },
  { id: 104, category: 'data-access', name: '交通路况 API', desc: '实时获取道路拥堵、封路、施工等动态路况事件。', icon: <MapPin className="w-6 h-6 text-amber-500" />, status: 'disconnected' },
  { id: 105, category: 'data-access', name: 'MySQL 数据库', desc: '直连企业内部数据库，让智能体基于私域数据进行空间分析。', icon: <Database className="w-6 h-6 text-orange-500" />, status: 'connected' },
  
  // 资料探查管理
  { id: 201, category: 'data-exploration', name: '数据质量评估', desc: '对接入的资料进行完整性、准确性、一致性等多维度质量探查。', icon: <Activity className="w-6 h-6 text-blue-500" />, status: 'connected' },
  { id: 202, category: 'data-exploration', name: '产线贡献价值配置', desc: '配置不同数据源对各产线（如地址、POI、道路）的贡献度权重与价值评估模型。', icon: <Settings2 className="w-6 h-6 text-purple-500" />, status: 'connected' },
  { id: 203, category: 'data-exploration', name: '资料分布探查', desc: '基于空间维度的资料热力分布与覆盖盲区分析。', icon: <MapPin className="w-6 h-6 text-red-500" />, status: 'disconnected' },
];

export default function Connectors() {
  const [activeTab, setActiveTab] = useState('data-access');
  const [selectedConnector, setSelectedConnector] = useState<any>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const filteredConnectors = CONNECTORS.filter(c => c.category === activeTab);

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-slate-50 relative">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Network className="w-6 h-6 text-red-500" />
              资料分析中心 (Data Analysis Center)
            </h1>
            <p className="text-slate-500 mt-1">主要解决所有产线的资料分析挖掘，包括资料的接入管理与资料探查管理（数据质量、产线贡献价值配置）。</p>
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            添加资料源
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-px">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === cat.id
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              {cat.name}
              {cat.badge && (
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  activeTab === cat.id ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'
                }`}>
                  {cat.badge}
                </span>
              )}
            </button>
          ))}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredConnectors.map(connector => (
            <div 
              key={connector.id} 
              onClick={() => setSelectedConnector(connector)}
              className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-red-300 hover:shadow-md transition-all group flex flex-col cursor-pointer"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform ${
                  connector.category === 'data-access' ? 'bg-indigo-50/50' : 'bg-slate-50'
                }`}>
                  {connector.icon}
                </div>
                {connector.status === 'connected' && (
                  <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
                    <CircleCheck className="w-3 h-3" />
                    已配置
                  </span>
                )}
              </div>
              <h3 className="font-bold text-slate-800 mb-2">{connector.name}</h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-6 flex-1">{connector.desc}</p>
              <button className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${
                connector.status === 'connected' 
                  ? 'bg-slate-50 text-slate-600 hover:bg-slate-100' 
                  : 'bg-red-50 text-red-600 hover:bg-red-100'
              }`}>
                {connector.status === 'connected' ? '配置' : '去连接'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Connector Detail Modal */}
      {selectedConnector && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-end z-50 animate-in fade-in duration-200" onClick={() => setSelectedConnector(null)}>
          <div className="bg-white w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-300" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm bg-white border border-slate-100`}>
                  {selectedConnector.icon}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    {selectedConnector.name}
                    {selectedConnector.status === 'connected' && (
                      <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                        <CircleCheck className="w-3 h-3" /> 已配置
                      </span>
                    )}
                  </h2>
                  <p className="text-sm text-slate-500 mt-0.5">{selectedConnector.desc}</p>
                </div>
              </div>
              <button onClick={() => setSelectedConnector(null)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-white">
              <div className="space-y-8">
                {/* Config Section */}
                <div>
                  <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Settings2 className="w-4 h-4 text-slate-400" /> 
                    {selectedConnector.category === 'data-access' ? '接入配置' : '探查配置'}
                  </h3>
                  <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1.5">API Endpoint / 数据地址</label>
                      <input 
                        type="text" 
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-red-300 focus:ring-1 focus:ring-red-300" 
                        defaultValue={`https://api.ai-geoops.com/v1/data/${selectedConnector.id}`} 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1.5">认证密钥 (Auth Token)</label>
                      <div className="relative">
                        <input 
                          type="password" 
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-red-300 focus:ring-1 focus:ring-red-300" 
                          defaultValue="sk-geo-xxxxxxxxxxxxxxxx" 
                        />
                        <Key className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Activity Section */}
                {selectedConnector.status === 'connected' && (
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-slate-400" /> 
                      近期活动
                    </h3>
                    <div className="border border-slate-100 rounded-xl overflow-hidden">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                          <tr>
                            <th className="px-4 py-3 font-medium">时间</th>
                            <th className="px-4 py-3 font-medium">事件</th>
                            <th className="px-4 py-3 font-medium">状态</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          <tr className="bg-white">
                            <td className="px-4 py-3 text-slate-500 font-mono text-xs">10 分钟前</td>
                            <td className="px-4 py-3 text-slate-700">同步数据流 (1,240 条记录)</td>
                            <td className="px-4 py-3"><span className="text-emerald-500 font-medium text-xs">成功</span></td>
                          </tr>
                          <tr className="bg-white">
                            <td className="px-4 py-3 text-slate-500 font-mono text-xs">1 小时前</td>
                            <td className="px-4 py-3 text-slate-700">健康检查 (Ping)</td>
                            <td className="px-4 py-3"><span className="text-emerald-500 font-medium text-xs">成功</span></td>
                          </tr>
                          <tr className="bg-white">
                            <td className="px-4 py-3 text-slate-500 font-mono text-xs">昨天 14:30</td>
                            <td className="px-4 py-3 text-slate-700">连接建立</td>
                            <td className="px-4 py-3"><span className="text-emerald-500 font-medium text-xs">成功</span></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button 
                onClick={() => setSelectedConnector(null)} 
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
              >
                取消
              </button>
              <button 
                onClick={() => setSelectedConnector(null)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors shadow-sm"
              >
                保存配置
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Connector Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-end z-50 animate-in fade-in duration-200" onClick={() => setIsAddModalOpen(false)}>
          <div className="bg-white w-full max-w-xl overflow-hidden shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-300" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Plus className="w-5 h-5 text-red-500" />
                添加新连接器
              </h2>
              <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">连接器类型</label>
                <select className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none bg-white text-slate-700">
                  <optgroup label="数据接入层">
                    <option>物流回流数据流</option>
                    <option>丰行数据接入</option>
                    <option>其他来源 API</option>
                    <option>交通路况 API</option>
                  </optgroup>
                  <optgroup label="企业系统">
                    <option>MySQL 数据库</option>
                    <option>PostgreSQL 空间数据库</option>
                    <option>SAP ERP</option>
                  </optgroup>
                  <optgroup label="通讯协同">
                    <option>企业微信</option>
                    <option>钉钉</option>
                    <option>自定义 Webhook</option>
                  </optgroup>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">连接名称</label>
                <input 
                  type="text" 
                  placeholder="例如：华东区冷链车队GPS" 
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">接入地址 (Endpoint)</label>
                <input 
                  type="text" 
                  placeholder="https://api.your-company.com/v1/stream" 
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">认证方式</label>
                <select className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none bg-white text-slate-700">
                  <option>Bearer Token</option>
                  <option>Basic Auth</option>
                  <option>API Key (Header)</option>
                  <option>OAuth 2.0</option>
                </select>
              </div>
            </div>
            
            <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button 
                onClick={() => setIsAddModalOpen(false)} 
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
              >
                取消
              </button>
              <button 
                onClick={() => setIsAddModalOpen(false)} 
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors shadow-sm"
              >
                测试并保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
