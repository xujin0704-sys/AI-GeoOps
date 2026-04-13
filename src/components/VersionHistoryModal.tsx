import React from 'react';
import { X, History, Clock, User, FileText } from 'lucide-react';

export interface VersionLog {
  version: string;
  date: string;
  author: string;
  changes: string[];
}

interface VersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  history: VersionLog[];
}

export default function VersionHistoryModal({ isOpen, onClose, title, history }: VersionHistoryModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">{title}</h2>
              <p className="text-sm text-slate-500">版本变更日志</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {history && history.length > 0 ? (
            <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
              {history.map((log, idx) => (
                <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  {/* Icon */}
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-blue-100 text-blue-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    <FileText className="w-4 h-4" />
                  </div>
                  
                  {/* Card */}
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md hover:border-blue-200 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-slate-800 text-lg">{log.version}</span>
                      <div className="flex items-center gap-1 text-xs text-slate-500 font-medium bg-slate-50 px-2 py-1 rounded-md">
                        <Clock className="w-3 h-3" />
                        {log.date}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-500 mb-3">
                      <User className="w-3 h-3" />
                      <span>{log.author}</span>
                    </div>
                    <ul className="space-y-1.5">
                      {log.changes.map((change, cIdx) => (
                        <li key={cIdx} className="text-sm text-slate-600 flex items-start gap-2">
                          <span className="text-blue-500 mt-1">•</span>
                          <span className="leading-relaxed">{change}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <History className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-800 mb-1">暂无版本记录</h3>
              <p className="text-slate-500">该对象尚未产生任何版本变更日志。</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
