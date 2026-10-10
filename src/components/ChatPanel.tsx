import React, { useState } from 'react';
import { GameLog } from '../types/game';
import { Send, MessageSquare, AlertCircle, Sparkles, X } from 'lucide-react';

interface ChatPanelProps {
  logs: GameLog[];
  onSendMessage?: (msg: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const QUICK_CHATS = [
  'Pungli nih bos! 😅',
  'Sewa mahal amat!',
  'Bagi cuan dong juragan',
  'OTW bangkrut wkwk',
  'Gaskeun beli properti!',
  'Hati-hati razia polisi 🚓',
];

export const ChatPanel: React.FC<ChatPanelProps> = ({ logs, onSendMessage, isOpen, onClose }) => {
  const [inputMsg, setInputMsg] = useState('');

  if (!isOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;
    if (onSendMessage) {
      onSendMessage(inputMsg);
    }
    setInputMsg('');
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-white shadow-2xl border-l border-amber-200 flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-amber-700 to-orange-700 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-amber-200" />
          <h2 className="text-sm font-black tracking-tight">KABAR WARGA & LOG SISTEM</h2>
        </div>
        <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20 text-white cursor-pointer">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Logs / Chat history */}
      <div className="flex-1 p-4 overflow-y-auto space-y-2.5 bg-slate-50">
        {logs.slice(-25).map((log) => {
          let badgeColor = 'bg-slate-200 text-slate-800';
          if (log.type === 'ALERT') badgeColor = 'bg-rose-100 text-rose-800 border-rose-300';
          if (log.type === 'MONEY') badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-300';
          if (log.type === 'CRIME') badgeColor = 'bg-amber-100 text-amber-900 border-amber-300';
          if (log.type === 'DISASTER') badgeColor = 'bg-red-100 text-red-900 border-red-400 font-bold';

          return (
            <div key={log.id} className={`p-2.5 rounded-xl border text-xs shadow-xs ${badgeColor}`}>
              <div className="flex items-center justify-between text-[10px] opacity-70 mb-0.5">
                <span>{log.type}</span>
                <span>{log.timestamp}</span>
              </div>
              <p className="leading-relaxed font-medium">{log.text}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Sticker Pills */}
      <div className="p-2 bg-slate-100 border-t border-slate-200 overflow-x-auto flex gap-1.5 scrollbar-none">
        {QUICK_CHATS.map((qc, idx) => (
          <button
            key={idx}
            onClick={() => onSendMessage && onSendMessage(qc)}
            className="px-2.5 py-1 bg-white hover:bg-amber-50 text-slate-700 hover:text-amber-800 border border-slate-300 rounded-full text-[10px] font-semibold whitespace-nowrap cursor-pointer transition-all active:scale-95 shadow-xs"
          >
            {qc}
          </button>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
        <input
          type="text"
          value={inputMsg}
          onChange={(e) => setInputMsg(e.target.value)}
          placeholder="Tulis pesan warga..."
          maxLength={150}
          className="flex-1 bg-slate-100 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-amber-500"
        />
        <button
          type="submit"
          className="p-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl cursor-pointer transition-all shadow-sm"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
