import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Filter,
  RefreshCw,
  Users,
  Search,
  Sparkles,
  Trash2,
  Check,
  Shield,
  Briefcase,
  Leaf,
  FileCheck,
  Clock,
  ChevronRight,
  Info
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const CHANNELS = [
  { id: 'general-regulatory', name: 'General Regulatory', desc: 'MoEFCC, CPCB/SPCB guidelines & state environmental acts', icon: BookOpen },
  { id: 'environmental-clearances', name: 'Environmental Clearances', desc: 'Category A/B clearance queries, EC conditions & MoEFCC filings', icon: Leaf },
  { id: 'site-inspections', name: 'Site Inspections & Audits', desc: 'On-site monitoring, air/water testing non-compliances, corrective actions', icon: AlertTriangle },
  { id: 'project-coordination', name: 'Project Coordination', desc: 'Inter-departmental milestone deadlines & permit submissions', icon: Briefcase },
];

const CATEGORIES = [
  { id: 'all', label: 'All Categories' },
  { id: 'Doubt & Question', label: 'Doubts & Questions', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-300 dark:border-amber-700' },
  { id: 'Regulatory Guidance', label: 'Regulatory Guidance', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-blue-300 dark:border-blue-700' },
  { id: 'Urgent Inquiry', label: 'Urgent Inquiries', color: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 border-rose-300 dark:border-rose-700' },
  { id: 'General Discussion', label: 'General Discussion', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700' },
];

const QUICK_DOUBTS = [
  {
    category: 'Doubt & Question',
    channel: 'environmental-clearances',
    text: 'What are the specific parameters required for the six-monthly EC compliance report submission to Regional MoEFCC Office?',
  },
  {
    category: 'Regulatory Guidance',
    channel: 'general-regulatory',
    text: 'Does our construction phase require real-time continuous ambient air quality monitoring (CAAQMS) linkage with the CPCB portal?',
  },
  {
    category: 'Urgent Inquiry',
    channel: 'site-inspections',
    text: 'Inspection scheduled for next Tuesday. Do we need hazardous waste manifest copies verified on-site beforehand?',
  },
  {
    category: 'Doubt & Question',
    channel: 'project-coordination',
    text: 'Which authority oversees tree felling compensatory afforestation verification in this project radius?',
  },
];

const ROLE_INFO = {
  ADMIN: {
    label: 'Admin',
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 border-purple-300 dark:border-purple-700',
    icon: Shield,
    border: 'border-purple-500/30',
  },
  PROJECT_MANAGER: {
    label: 'Project Manager',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-blue-300 dark:border-blue-700',
    icon: Briefcase,
    border: 'border-blue-500/30',
  },
  ENVIRONMENTAL_OFFICER: {
    label: 'Environmental Officer',
    color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700',
    icon: Leaf,
    border: 'border-emerald-500/30',
  },
  COMPLIANCE_STAFF: {
    label: 'Compliance Staff',
    color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-300 dark:border-amber-700',
    icon: FileCheck,
    border: 'border-amber-500/30',
  },
};

export const ChatPage = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [activeChannel, setActiveChannel] = useState('general-regulatory');
  const [selectedCategory, setSelectedCategory] = useState('Doubt & Question');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterResolved, setFilterResolved] = useState('all'); // 'all', 'unresolved', 'resolved'
  const [searchTerm, setSearchTerm] = useState('');
  const [inputText, setInputText] = useState('');
  const [autoPoll, setAutoPoll] = useState(true);
  const messagesEndRef = useRef(null);

  const fetchMessages = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await api.getMessages({ channel: activeChannel });
      if (res && res.success) {
        setMessages(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [activeChannel]);

  // Polling for live updates
  useEffect(() => {
    if (!autoPoll) return;
    const interval = setInterval(() => {
      fetchMessages(true);
    }, 3500);
    return () => clearInterval(interval);
  }, [activeChannel, autoPoll]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || sending) return;

    setSending(true);
    try {
      const res = await api.sendMessage({
        content: inputText.trim(),
        channel: activeChannel,
        category: selectedCategory,
      });

      if (res && res.success) {
        setMessages((prev) => [...prev, res.data]);
        setInputText('');
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  const handleToggleResolve = async (messageId) => {
    try {
      const res = await api.toggleResolveMessage(messageId);
      if (res && res.success) {
        setMessages((prev) =>
          prev.map((msg) => (msg._id === messageId ? res.data : msg))
        );
      }
    } catch (err) {
      console.error('Failed to toggle resolve:', err);
    }
  };

  const handleDelete = async (messageId) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    try {
      const res = await api.deleteMessage(messageId);
      if (res && res.success) {
        setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
      }
    } catch (err) {
      console.error('Failed to delete message:', err);
    }
  };

  const handleUsePrompt = (prompt) => {
    setActiveChannel(prompt.channel);
    setSelectedCategory(prompt.category);
    setInputText(prompt.text);
  };

  // Filter messages
  const filteredMessages = messages.filter((msg) => {
    if (filterCategory !== 'all' && msg.category !== filterCategory) return false;
    if (filterResolved === 'unresolved' && msg.isResolved) return false;
    if (filterResolved === 'resolved' && !msg.isResolved) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchContent = msg.content?.toLowerCase().includes(term);
      const matchSender = msg.sender?.name?.toLowerCase().includes(term);
      if (!matchContent && !matchSender) return false;
    }
    return true;
  });

  const totalDoubts = messages.filter((m) => m.category === 'Doubt & Question' || m.category === 'Urgent Inquiry').length;
  const resolvedDoubts = messages.filter((m) => (m.category === 'Doubt & Question' || m.category === 'Urgent Inquiry') && m.isResolved).length;
  const pendingDoubts = totalDoubts - resolvedDoubts;

  return (
    <div className="space-y-6">
      {/* Top Header & Overview */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-800/80 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm backdrop-blur-sm">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 flex-shrink-0">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
                Team Discussion & Regulatory Doubts
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                All 4 Roles Active
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Collaborative workspace for Dr. Sengupta, Sarah, Arunabh & Elena to resolve environmental compliances, clearances, and audit doubts.
            </p>
          </div>
        </div>

        {/* Quick Stats Pill */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/60 text-xs">
            <span className="text-slate-500 dark:text-slate-400">Total in #{activeChannel}:</span>
            <span className="font-bold text-slate-900 dark:text-white">{messages.length}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-xs">
            <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-amber-700 dark:text-amber-300 font-semibold">{pendingDoubts} Open</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 text-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-emerald-700 dark:text-emerald-300 font-semibold">{resolvedDoubts} Resolved</span>
          </div>
          <button
            onClick={() => fetchMessages()}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors"
            title="Refresh messages"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Grid: Channels + Chat + Team Persona Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Channels & Common Doubt Starters (3 Cols) */}
        <div className="lg:col-span-3 space-y-5">
          {/* Channel selector */}
          <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-4 shadow-sm">
            <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 px-1">
              Discussion Channels
            </h2>
            <div className="space-y-1.5">
              {CHANNELS.map((ch) => {
                const Icon = ch.icon;
                const isActive = activeChannel === ch.id;
                return (
                  <button
                    key={ch.id}
                    onClick={() => setActiveChannel(ch.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl transition-all flex items-start gap-2.5 ${
                      isActive
                        ? 'bg-emerald-600 text-white font-semibold shadow-md shadow-emerald-600/20'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                    }`}
                  >
                    <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                    <div className="min-w-0">
                      <div className="text-xs font-semibold leading-tight truncate">
                        #{ch.name}
                      </div>
                      <div className={`text-[10px] truncate mt-0.5 ${isActive ? 'text-emerald-100' : 'text-slate-400 dark:text-slate-500'}`}>
                        {ch.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Regulatory Doubt Prompts */}
          <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-4 shadow-sm">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 mb-2.5 px-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Quick Regulatory Starters</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 px-1 mb-3">
              Click any question below to prefill your doubt:
            </p>
            <div className="space-y-2">
              {QUICK_DOUBTS.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleUsePrompt(prompt)}
                  className="w-full text-left p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/80 hover:border-emerald-400 dark:hover:border-emerald-600 bg-slate-50/50 dark:bg-slate-900/30 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 text-slate-700 dark:text-slate-300 text-xs transition-all group flex items-start gap-2"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all mt-0.5 flex-shrink-0" />
                  <span className="line-clamp-2 leading-relaxed text-[11px]">{prompt.text}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Auto-Poll Controls */}
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Live Auto-Sync (3.5s)</span>
            <button
              onClick={() => setAutoPoll(!autoPoll)}
              className={`px-2 py-0.5 rounded-full font-semibold text-[10px] transition-colors ${
                autoPoll ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
              }`}
            >
              {autoPoll ? 'Enabled' : 'Paused'}
            </button>
          </div>
        </div>

        {/* Center Column: Live Chat Message Board (6 Cols) */}
        <div className="lg:col-span-6 flex flex-col bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm overflow-hidden h-[720px]">
          
          {/* Chat Header & Filters */}
          <div className="p-3.5 border-b border-slate-200 dark:border-slate-700/80 bg-slate-50/60 dark:bg-slate-900/40 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 dark:text-white text-sm">
                  #{CHANNELS.find((c) => c.id === activeChannel)?.name}
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  ({filteredMessages.length} messages)
                </span>
              </div>

              {/* Status filter: All / Unresolved / Resolved */}
              <div className="flex items-center gap-1 bg-slate-200/70 dark:bg-slate-800 p-0.5 rounded-lg text-xs">
                <button
                  onClick={() => setFilterResolved('all')}
                  className={`px-2 py-1 rounded-md transition-all ${filterResolved === 'all' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterResolved('unresolved')}
                  className={`px-2 py-1 rounded-md transition-all ${filterResolved === 'unresolved' ? 'bg-amber-500 text-white shadow-xs font-semibold' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  Open Doubts
                </button>
                <button
                  onClick={() => setFilterResolved('resolved')}
                  className={`px-2 py-1 rounded-md transition-all ${filterResolved === 'resolved' ? 'bg-emerald-600 text-white shadow-xs font-semibold' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  Resolved
                </button>
              </div>
            </div>

            {/* Search & Category Filter */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search in this topic or by sender..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="text-xs px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {loading && messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <RefreshCw className="w-6 h-6 animate-spin mb-2" />
                <span className="text-xs">Loading channel discussions...</span>
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-6 text-slate-400 dark:text-slate-500">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                  <MessageSquare className="w-6 h-6 text-slate-400" />
                </div>
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  No discussions found
                </h3>
                <p className="text-xs max-w-sm mt-1">
                  Be the first to post a regulatory doubt or compliance inquiry in #{CHANNELS.find((c) => c.id === activeChannel)?.name}.
                </p>
              </div>
            ) : (
              filteredMessages.map((msg) => {
                const isCurrentUser = msg.sender?._id === user?._id || msg.sender?.email === user?.email;
                const senderRole = msg.sender?.role || 'COMPLIANCE_STAFF';
                const roleConfig = ROLE_INFO[senderRole] || ROLE_INFO.COMPLIANCE_STAFF;
                const RoleIcon = roleConfig.icon;
                const isDoubt = msg.category === 'Doubt & Question' || msg.category === 'Urgent Inquiry';

                return (
                  <div
                    key={msg._id}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      msg.isResolved
                        ? 'bg-emerald-50/40 dark:bg-emerald-950/15 border-emerald-300/60 dark:border-emerald-800/60'
                        : isDoubt
                        ? 'bg-amber-50/30 dark:bg-amber-950/10 border-amber-300/60 dark:border-amber-800/60'
                        : 'bg-slate-50/70 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/60'
                    }`}
                  >
                    {/* Header: Sender details, Role badge, Category badge, Timestamp */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Avatar */}
                        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-slate-700 to-slate-900 text-white text-xs font-bold flex items-center justify-center uppercase">
                          {msg.sender?.name ? msg.sender.name.charAt(0) : 'U'}
                        </div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {msg.sender?.name || 'Authorized Member'}
                        </span>

                        {/* Role Badge */}
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${roleConfig.color}`}>
                          <RoleIcon className="w-2.5 h-2.5" />
                          {roleConfig.label}
                        </span>

                        {/* Category Badge */}
                        <span className="text-[10px] px-2 py-0.2 rounded-full font-medium bg-slate-200/70 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                          {msg.category}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-[10px] text-slate-400 dark:text-slate-500">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>

                    {/* Message Body */}
                    <div className="text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed pl-9">
                      {msg.content}
                    </div>

                    {/* Footer: Resolved Status & Actions */}
                    <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between text-xs pl-9">
                      <div className="flex items-center gap-2">
                        {isDoubt && (
                          <button
                            onClick={() => handleToggleResolve(msg._id)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                              msg.isResolved
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-200'
                                : 'bg-slate-200/80 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 dark:bg-slate-800 dark:hover:bg-emerald-950/50 dark:text-slate-300 dark:hover:text-emerald-300'
                            }`}
                            title="Toggle resolution status"
                          >
                            <Check className="w-3 h-3" />
                            {msg.isResolved ? 'Resolved' : 'Mark Resolved'}
                          </button>
                        )}

                        {msg.isResolved && msg.resolvedBy && (
                          <span className="text-[10px] text-emerald-700 dark:text-emerald-400 italic">
                            Resolved by {msg.resolvedBy.name || 'Team Lead'}
                          </span>
                        )}
                      </div>

                      {(isCurrentUser || user?.role === 'ADMIN') && (
                        <button
                          onClick={() => handleDelete(msg._id)}
                          className="p-1 text-slate-400 hover:text-rose-500 dark:text-slate-500 dark:hover:text-rose-400 transition-colors"
                          title="Delete message"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <form onSubmit={handleSendMessage} className="p-3 bg-slate-50/80 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-700/80 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                <Info className="w-3 h-3 text-emerald-500" />
                Posting to <span className="font-semibold text-slate-700 dark:text-slate-300">#{CHANNELS.find((c) => c.id === activeChannel)?.name}</span> as <span className="font-semibold text-emerald-600 dark:text-emerald-400">{user?.name}</span>
              </span>

              {/* Tag Selector */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Category:</span>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="text-xs px-2 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-hidden"
                >
                  <option value="Doubt & Question">Doubt & Question</option>
                  <option value="Regulatory Guidance">Regulatory Guidance</option>
                  <option value="Urgent Inquiry">Urgent Inquiry</option>
                  <option value="General Discussion">General Discussion</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Ask a doubt or share compliance guidance in #${CHANNELS.find((c) => c.id === activeChannel)?.name}...`}
                className="flex-1 px-3.5 py-2.5 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || sending}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 flex-shrink-0"
              >
                <span>{sending ? 'Sending...' : 'Send'}</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Active Team Personas & Direct Mentions (3 Cols) */}
        <div className="lg:col-span-3 space-y-5">
          <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3 px-1">
              <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-emerald-500" />
                Team Personas (4 Roles)
              </h2>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="System Online" />
            </div>
            
            <p className="text-[11px] text-slate-500 dark:text-slate-400 px-1 mb-3">
              All 4 roles have real-time access to review doubts and provide regulatory clarity:
            </p>

            <div className="space-y-2.5">
              {[
                {
                  name: 'Dr. Vikram Sengupta',
                  role: 'ADMIN',
                  roleTitle: 'Admin & Directorate',
                  email: 'admin@ecoinfracompliance.io',
                  badge: 'Full Oversight',
                },
                {
                  name: 'Sarah Jenkins, PMP',
                  role: 'PROJECT_MANAGER',
                  roleTitle: 'Project Manager',
                  email: 'pm@ecoinfracompliance.io',
                  badge: 'Project Planning',
                },
                {
                  name: 'Arunabh Sharma',
                  role: 'ENVIRONMENTAL_OFFICER',
                  roleTitle: 'Environmental Officer',
                  email: 'officer@ecoinfracompliance.io',
                  badge: 'Field Inspections',
                },
                {
                  name: 'Elena Rodriguez',
                  role: 'COMPLIANCE_STAFF',
                  roleTitle: 'Compliance Staff',
                  email: 'staff@ecoinfracompliance.io',
                  badge: 'Documentation',
                },
              ].map((p) => {
                const config = ROLE_INFO[p.role];
                const Icon = config.icon;
                const isYou = user?.email === p.email;

                return (
                  <div
                    key={p.role}
                    className={`p-3 rounded-xl border transition-all ${
                      isYou
                        ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-700/60'
                        : 'bg-slate-50/50 dark:bg-slate-900/30 border-slate-200/80 dark:border-slate-700/60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-700 to-slate-900 text-white font-bold text-xs flex items-center justify-center uppercase">
                            {p.name.charAt(0)}
                          </div>
                          <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-800" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <span>{p.name}</span>
                            {isYou && (
                              <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-md bg-emerald-600 text-white">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                            {p.roleTitle}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[10px]">
                      <span className={`px-2 py-0.5 rounded-full border ${config.color} font-medium`}>
                        {config.label}
                      </span>
                      <button
                        onClick={() => {
                          setInputText((prev) => `@${p.name.split(' ')[0]} ${prev}`);
                        }}
                        className="text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 font-medium hover:underline"
                      >
                        Mention
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Compliance Guidelines Card */}
          <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-2xl p-4">
            <h3 className="text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5 mb-2">
              <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Audit-Ready Governance
            </h3>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              All compliance doubts, resolution stamps, and guidance exchanged in this room are timestamped and preserved for environmental audits and statutory reviews.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
