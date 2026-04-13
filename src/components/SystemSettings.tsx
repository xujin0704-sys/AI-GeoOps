import React, { useState } from 'react';
import { Settings2, Plus, Trash2, Save, Layers, BrainCircuit } from 'lucide-react';
import { useDictionary } from '../contexts/DictionaryContext';

export default function SystemSettings() {
  const { skillCategories, setSkillCategories, scenarios, setScenarios } = useDictionary();
  
  const [newCategory, setNewCategory] = useState('');
  const [newScenario, setNewScenario] = useState('');

  const handleAddCategory = () => {
    if (newCategory.trim() && !skillCategories.includes(newCategory.trim())) {
      setSkillCategories([...skillCategories, newCategory.trim()]);
      setNewCategory('');
    }
  };

  const handleRemoveCategory = (cat: string) => {
    setSkillCategories(skillCategories.filter(c => c !== cat));
  };

  const handleAddScenario = () => {
    if (newScenario.trim() && !scenarios.includes(newScenario.trim())) {
      setScenarios([...scenarios, newScenario.trim()]);
      setNewScenario('');
    }
  };

  const handleRemoveScenario = (scen: string) => {
    setScenarios(scenarios.filter(s => s !== scen));
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-slate-50 relative">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Settings2 className="w-6 h-6 text-slate-600" />
              系统管理 (System Management)
            </h1>
            <p className="text-slate-500 mt-1">管理系统全局配置、字典数据与基础参数。</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 技能分类管理 */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
              <div className="p-2 bg-red-50 rounded-lg">
                <BrainCircuit className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">技能分类字典</h2>
                <p className="text-xs text-slate-500">配置时空AI技能库的分类标签</p>
              </div>
            </div>
            
            <div className="p-5 flex-1 overflow-y-auto">
              <div className="space-y-3">
                {skillCategories.map(cat => (
                  <div key={cat} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 group hover:border-red-200 hover:bg-red-50/30 transition-colors">
                    <span className="text-sm font-medium text-slate-700">{cat}</span>
                    <button 
                      onClick={() => handleRemoveCategory(cat)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      title="删除分类"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {skillCategories.length === 0 && (
                  <div className="text-center py-8 text-slate-400 text-sm">暂无分类数据</div>
                )}
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 bg-slate-50/50">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                  placeholder="输入新分类名称..."
                  className="flex-1 px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-400 text-sm"
                />
                <button 
                  onClick={handleAddCategory}
                  disabled={!newCategory.trim()}
                  className="bg-slate-800 hover:bg-slate-900 disabled:bg-slate-300 text-white px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  添加
                </button>
              </div>
            </div>
          </div>

          {/* 场景分类管理 */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
              <div className="p-2 bg-indigo-50 rounded-lg">
                <Layers className="w-5 h-5 text-indigo-500" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">场景分类字典</h2>
                <p className="text-xs text-slate-500">配置技能库支持的应用场景维度</p>
              </div>
            </div>
            
            <div className="p-5 flex-1 overflow-y-auto">
              <div className="space-y-3">
                {scenarios.map(scen => (
                  <div key={scen} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 group hover:border-indigo-200 hover:bg-indigo-50/30 transition-colors">
                    <span className="text-sm font-medium text-slate-700">{scen}</span>
                    <button 
                      onClick={() => handleRemoveScenario(scen)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      title="删除场景"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {scenarios.length === 0 && (
                  <div className="text-center py-8 text-slate-400 text-sm">暂无场景数据</div>
                )}
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 bg-slate-50/50">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={newScenario}
                  onChange={(e) => setNewScenario(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddScenario()}
                  placeholder="输入新场景名称..."
                  className="flex-1 px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 text-sm"
                />
                <button 
                  onClick={handleAddScenario}
                  disabled={!newScenario.trim()}
                  className="bg-slate-800 hover:bg-slate-900 disabled:bg-slate-300 text-white px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  添加
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
