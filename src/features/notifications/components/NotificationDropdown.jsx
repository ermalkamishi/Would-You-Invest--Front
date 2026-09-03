import { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Bell, TrendingUp, Check, Trash2, Rocket, MessageSquare, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { markAsRead, markAllAsRead, clearNotifications } from '../notificationsSlice';
import { setHighlightPitchId } from '../../pitches/pitchesSlice';
import { formatCurrency } from '../../../utils/formatCurrency';

export default function NotificationDropdown() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, unreadCount } = useSelector((s) => s.notifications);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleNotificationClick = (item) => {
    dispatch(markAsRead(item.id));
    setIsOpen(false);
    if (item.pitchId) {
      dispatch(setHighlightPitchId(item.pitchId));
      navigate('/');
    } else if (item.isPortfolioAlert) {
      navigate('/portfolio');
    }
  };

  const getEmojiIcon = (type) => {
    switch (type) {
      case 'PORTFOLIO_GAIN':
        return <TrendingUp className="w-4 h-4 text-[#00FF66]" />;
      case 'FUNDING':
        return <Rocket className="w-4 h-4 text-[#FF9900]" />;
      case 'COMMENT':
        return <MessageSquare className="w-4 h-4 text-[#FF3366]" />;
      default:
        return <TrendingUp className="w-4 h-4 text-[#00BFFF]" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all flex items-center justify-center"
        aria-label="Open notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#00FF66] text-black text-[10px] font-black flex items-center justify-center shadow-[0_0_10px_rgba(0,255,102,0.8)] animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-white/10 bg-[hsl(240,12%,7%)] backdrop-blur-xl shadow-2xl z-[150] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white">Investment Activity</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#00FF66]/20 text-[#00FF66] border border-[#00FF66]/30">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={() => dispatch(markAllAsRead())}
                  className="p-1 rounded hover:bg-white/10 text-white/40 hover:text-white transition-colors text-xs flex items-center gap-1 px-2"
                  title="Mark all as read"
                >
                  <Check className="w-3 h-3 text-[#00FF66]" />
                  <span className="text-[10px]">Read all</span>
                </button>
              )}
              {items.length > 0 && (
                <button
                  onClick={() => dispatch(clearNotifications())}
                  className="p-1 rounded hover:bg-white/10 text-white/40 hover:text-[#FF3366] transition-colors"
                  title="Clear all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Notification List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-white/5">
            {items.length === 0 ? (
              <div className="py-12 px-4 text-center">
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-3 text-white/30">
                  <Bell className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-white/60">No activity yet</p>
                <p className="text-[11px] text-white/30 mt-1 max-w-[200px] mx-auto">
                  Invest in startups to get live updates on price surges, funding, and discussions!
                </p>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleNotificationClick(item)}
                  className={`p-3.5 flex items-start gap-3 transition-colors cursor-pointer group ${
                    !item.isRead
                      ? 'bg-[#00FF66]/[0.04] hover:bg-[#00FF66]/[0.08]'
                      : 'hover:bg-white/[0.04]'
                  }`}
                >
                  {/* Icon */}
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                      item.isPortfolioAlert
                        ? 'bg-[#00FF66]/10 border-[#00FF66]/30 text-[#00FF66]'
                        : 'bg-white/5 border-white/10 text-white/50'
                    }`}
                  >
                    {item.emoji ? (
                      <span className="text-sm">{item.emoji}</span>
                    ) : (
                      getEmojiIcon(item.type)
                    )}
                  </div>

                  {/* Body */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      {item.isPortfolioAlert ? (
                        <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-[#00FF66] bg-[#00FF66]/15 border border-[#00FF66]/30 px-1.5 py-0.2 rounded">
                          <span className="w-1 h-1 rounded-full bg-[#00FF66] animate-ping" />
                          YOUR HOLDING
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold uppercase tracking-wider text-white/40">
                          {item.type?.replace('_', ' ') || 'MARKET UPDATE'}
                        </span>
                      )}
                      {!item.isRead && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00FF66] shrink-0" />
                      )}
                    </div>

                    <p className="text-xs font-semibold text-white/90 group-hover:text-white leading-snug line-clamp-2">
                      {item.title || item.msg || item.message}
                    </p>

                    {item.details && (
                      <p className="text-[11px] text-white/50 mt-1 font-mono">
                        {item.details}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-white/5 text-[9px] font-mono text-white/40">
                      <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span className="text-[#00FF66]/80 group-hover:text-[#00FF66] transition-colors">
                        View details →
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="p-2 border-t border-white/10 bg-white/[0.01] text-center">
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/portfolio');
                }}
                className="text-[11px] font-bold text-[#00FF66] hover:underline"
              >
                Go to Investment Portfolio →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
