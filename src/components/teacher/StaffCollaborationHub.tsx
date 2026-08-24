import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { erpDb } from '../../services/db';
import {
  MessageSquare,
  Send,
  Users,
  Building,
  FileText,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: string;
  role: string;
  time: string;
  text: string;
}

export const StaffCollaborationHub: React.FC = () => {
  const { currentSchool, currentUser } = useAuth();

  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', sender: 'Dr. Vinodbhai C. Pandya', role: 'Principal', time: '08:15 AM', text: 'Good morning faculty. Please ensure all Grade 10 midterm marks and Ekam Kasoti tests are committed to the Gradebook before Friday 4:00 PM.' },
    { id: '2', sender: 'Shri Bhaveshbhai Trivedi', role: 'Science Dept', time: '08:22 AM', text: 'GSEB Science lab practical kits for Grade 10 & 11 have been fully stocked in Physics Lab B-2.' },
    { id: '3', sender: 'Smt. Neetaben R. Patel', role: 'Mathematics', time: '08:45 AM', text: 'Class 10-A attendance marked and saved. 28 students present today.' },
  ]);

  const [inputText, setInputText] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: currentUser?.full_name || 'Smt. Neetaben R. Patel',
      role: currentUser?.role || 'Teacher',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: inputText.trim(),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
          <MessageSquare className="w-5 h-5 text-indigo-600" />
          <span>Faculty Lounge &amp; Collaboration Hub</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Real-time departmental communication, lesson plan sharing, and faculty announcements for {currentSchool.name}.
        </p>
      </div>

      {/* Chat Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col h-[500px]">
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h3 className="text-xs font-bold uppercase tracking-wider">Faculty General Channel</h3>
          </div>
          <span className="text-[11px] text-slate-400">Encrypted Department Network</span>
        </div>

        {/* Message Feed */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/50">
          {messages.map((m) => {
            const isMe = m.sender === currentUser?.full_name;
            return (
              <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div className="flex items-center space-x-2 mb-1 text-[11px]">
                  <span className="font-bold text-slate-800">{m.sender}</span>
                  <span className="text-slate-400">({m.role})</span>
                  <span className="text-[10px] text-slate-400">• {m.time}</span>
                </div>
                <div
                  className={`p-3 rounded-2xl max-w-lg text-xs leading-relaxed ${
                    isMe
                      ? 'bg-blue-600 text-white rounded-tr-xs shadow-xs'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-tl-xs shadow-xs'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            );
          })}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex items-center space-x-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type message to faculty lounge..."
            className="flex-1 px-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
