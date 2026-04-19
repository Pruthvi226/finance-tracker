import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, Sparkles, TrendingUp, PiggyBank, Target, BarChart3 } from 'lucide-react';
import api from '../services/api';

type Message = {
  role: 'ai' | 'user';
  text: string;
};

const SUGGESTIONS = [
  { label: 'Spending patterns', query: 'Show my spending patterns' },
  { label: 'Savings advice', query: 'How can I save more?' },
  { label: 'Budget setup', query: 'What budget should I set?' },
  { label: 'Goal tracker', query: 'How close am I to my goals?' },
];



const AiMoneyAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'ai',
      text: "👋 Hi! I'm your **AI Money Assistant**.\n\nI analyze your real transaction data to provide insights. I need at least **3 transactions** to get started.\n\nHow can I help you today?"
    }
  ]);
  const [dataAvailable, setDataAvailable] = useState<boolean | null>(null);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const dataCheckRef = useRef<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
      if (dataAvailable === null && !dataCheckRef.current) {
        dataCheckRef.current = true;
        checkDataStatus();
      }
    }
  }, [isOpen, dataAvailable]);

  const checkDataStatus = async () => {
    try {
      const res = await api.get('/ai/insights');
      setDataAvailable(res.data.dataAvailable !== false);
      if (res.data.dataAvailable === false || res.data.noData) {
        // Prevent adding multiple warning messages if already present
        setMessages(prev => {
          if (prev.some(m => m.text.includes("Data Required"))) return prev;
          return [...prev, { role: 'ai', text: "⚠️ **Data Required**\n\n" + (res.data.message || "I need at least 3 transactions to provide AI insights. Please add more transactions first!") }];
        });
      }
    } catch (err) {
      setDataAvailable(false);
      setMessages(prev => {
        if (prev.some(m => m.text.includes("Data Required"))) return prev;
        return [...prev, { role: 'ai', text: "⚠️ **Data Required**\n\nI need at least 3 transactions to provide AI insights. Please add more transactions first!" }];
      });
    }
  };

  const handleSend = async (overrideInput?: string) => {
    const text = (overrideInput ?? input).trim();
    if (!text || isTyping) return;

    // 1. Add ONLY ONE user message to state
    const userMessage: Message = { role: 'user', text };
    setMessages(prev => [...prev, userMessage]);
    
    setInput('');
    setIsTyping(true);
    setShowSuggestions(false);

    try {
      const res = await api.post('/ai/chat', { message: text });
      
      // 2. Add ONLY AI message after response
      if (res.data.dataAvailable === false) {
        setDataAvailable(false);
        const aiMessage: Message = { 
          role: 'ai', 
          text: "📊 **Insight:** " + (res.data.message || "I need more transaction data to answer that.") 
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        const aiMessage: Message = { 
          role: 'ai', 
          text: res.data.reply 
        };
        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (err) {
      const errorMessage: Message = { 
        role: 'ai', 
        text: "I'm having a little trouble connecting to my brain right now. Please try again later! 🧠⚡" 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100] font-sans">
      <AnimatePresence>
        {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 40 }}
              transition={{ type: 'spring', damping: 22, stiffness: 280 }}
              className="mb-4 w-[380px] flex flex-col card-premium overflow-hidden !p-0 shadow-xl"
              style={{ maxHeight: '580px' }}
            >
            {/* Header */}
            <div className="p-5 bg-primary-gradient text-white flex items-center justify-between flex-shrink-0 border-b border-white/10 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center border border-white/20">
                  <Bot size={22} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="font-bold text-[15px] leading-none tracking-tight text-white uppercase">AI Assistant</h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400/80">Active</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Quick Stats Bar */}
            <div className="flex gap-0 border-b border-cardBorder bg-gray-50/50 dark:bg-white/[0.02] flex-shrink-0">
              {[
                { icon: <TrendingUp size={12} />, label: 'Stats', color: 'text-rose-500' },
                { icon: <PiggyBank size={12} />, label: 'Save', color: 'text-emerald-500' },
                { icon: <Target size={12} />, label: 'Goals', color: 'text-indigo-500' },
                { icon: <BarChart3 size={12} />, label: 'Budget', color: 'text-amber-500' },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleSend(`Tell me about my ${item.label.toLowerCase()}`)}
                  disabled={dataAvailable === false}
                  className="flex-1 flex flex-col items-center gap-1 py-3 hover:bg-white dark:hover:bg-white/5 transition-colors group disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <span className={`${item.color} group-hover:scale-110 transition-transform`}>{item.icon}</span>
                  <span className="text-[8px] font-bold uppercase tracking-widest text-textSecondary">{item.label}</span>
                </button>
              ))}
            </div>

            {/* Chat Messages */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-hide"
              style={{ minHeight: 0 }}
            >
              {messages.map((msg, idx) => (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  key={idx}
                  className={`flex ${msg.role === 'ai' ? 'justify-start' : 'justify-end'}`}
                >
                  {msg.role === 'ai' && (
                    <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-500/20 dark:to-violet-500/20 flex items-center justify-center mr-2 mt-1 flex-shrink-0 border border-indigo-200/50 dark:border-indigo-500/20">
                      <Bot size={14} className="text-indigo-600 dark:text-indigo-400" />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] px-4 py-3 text-sm leading-relaxed transition-all duration-300 ${
                      msg.role === 'ai' 
                        ? 'rounded-2xl rounded-tl-sm border border-cardBorder'
                        : 'rounded-2xl rounded-tr-sm font-medium shadow-md'
                    }`}
                    style={{ 
                      background: msg.role === 'ai' ? 'var(--ai-bubble-bg)' : 'var(--user-bubble-bg)',
                      color: msg.role === 'ai' ? 'var(--ai-bubble-text)' : 'var(--user-bubble-text)',
                      border: msg.role === 'user' ? 'none' : ''
                    }}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start items-end gap-2"
                >
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-500/20 dark:to-violet-500/20 flex items-center justify-center flex-shrink-0 border border-indigo-200/50 dark:border-indigo-500/20">
                    <Bot size={14} className="text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="bg-gray-100/80 dark:bg-white/5 px-5 py-3.5 rounded-[18px] rounded-tl-[6px] flex gap-1.5 items-center" style={{ background: 'var(--ai-bubble-bg)' }}>
                    {[0, 0.18, 0.36].map((delay, i) => (
                      <motion.span
                        key={i}
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay }}
                        className="w-2 h-2 bg-indigo-400 rounded-full block"
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Suggestion Chips */}
            <AnimatePresence>
              {showSuggestions && dataAvailable !== false && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-4 pb-2 flex flex-wrap gap-1.5 flex-shrink-0"
                >
                  {SUGGESTIONS.map(s => (
                    <button
                      key={s.label}
                      onClick={() => handleSend(s.query)}
                      className="text-[11px] font-bold px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-white/5 text-textSecondary dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-400 border border-gray-200 dark:border-white/8 transition-all"
                    >
                      {s.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input Area */}
            <div className="p-4 border-t border-cardBorder flex-shrink-0" style={{ background: 'var(--card-bg)' }}>
              <div className="flex items-center gap-2.5">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  disabled={dataAvailable === false || isTyping}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={dataAvailable === false ? "Data required..." : "Ask anything..."}
                  className="input-standard !py-3 !px-4"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isTyping || dataAvailable === false}
                  className="btn-primary !p-3 shadow-md disabled:opacity-30 flex-shrink-0"
                >
                  <Send size={18} />
                </button>
              </div>
              <div className="flex items-center justify-center gap-1.5 mt-3">
                <Sparkles size={10} className="text-primary-400" />
                <p className="text-[9px] text-textSecondary uppercase tracking-widest font-bold">Powered by Gemini AI</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-[90px] right-6 w-11 h-11 rounded-xl bg-primary-gradient text-white flex items-center justify-center shadow-lg z-[40]"
        title="Open AI Money Assistant"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={isOpen ? 'close' : 'open'}
            initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.2 }}
          >
            {isOpen ? <X size={20} strokeWidth={2.5} /> : <Bot size={20} strokeWidth={2} />}
          </motion.div>
        </AnimatePresence>

        {!isOpen && (
          <motion.span
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute top-1 right-1 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full z-20"
          />
        )}
      </motion.button>
    </div>
  );
};

export default AiMoneyAssistant;
