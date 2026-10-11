import React, { useEffect, useState, useRef } from 'react';
import { BoardEventNotification } from '../types/game';
import { AvatarRenderer } from './AvatarRenderer';
import { formatRupiah } from '../utils/format';
import {
  Coins,
  Siren,
  Landmark,
  Building,
  Store,
  Hotel,
  Gift,
  HelpCircle,
  AlertTriangle,
  Gavel,
  RefreshCw,
  X,
  History,
  Sparkles,
  ArrowRight,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';

interface CenterBoardEventPopupProps {
  event: BoardEventNotification | null;
  onClose: () => void;
  recentEvents?: BoardEventNotification[];
  onSelectEvent?: (evt: BoardEventNotification) => void;
}

export const CenterBoardEventPopup: React.FC<CenterBoardEventPopupProps> = ({
  event,
  onClose,
  recentEvents = [],
  onSelectEvent,
}) => {
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(100);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Stable ref for onClose to prevent prop updates (e.g. movement re-renders) from resetting timer
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Stable ref for paused state (hover or reading history)
  const isPausedRef = useRef(false);
  isPausedRef.current = isPaused || showHistory;

  // Auto-dismiss countdown (4s)
  useEffect(() => {
    if (!event?.id) return;

    // Reset progress to 100% ONLY when a new event ID is provided
    setProgress(100);

    const duration = 4000;
    let remaining = duration;
    let lastTick = Date.now();

    const interval = setInterval(() => {
      const now = Date.now();
      const delta = now - lastTick;
      lastTick = now;

      // Only tick down if not paused
      if (!isPausedRef.current) {
        remaining -= delta;
        if (remaining <= 0) {
          clearInterval(interval);
          setProgress(0);
          onCloseRef.current?.();
        } else {
          setProgress(Math.max(0, (remaining / duration) * 100));
        }
      }
    }, 40);

    return () => clearInterval(interval);
  }, [event?.id]);

  // Support ESC key to quickly dismiss
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCloseRef.current?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!event) return null;

  // Visual theming based on event type
  const getTheme = () => {
    switch (event.type) {
      case 'RENT':
        return {
          bgHeader: 'bg-gradient-to-r from-rose-600 via-red-600 to-rose-700',
          border: 'border-rose-300 ring-4 ring-rose-500/20',
          badgeBg: 'bg-rose-100 text-rose-800 border-rose-300',
          icon: <Coins className="w-4 h-4 text-rose-600" />,
          accentGlow: 'from-rose-500/10 to-red-500/5',
          label: 'PEMBAYARAN SEWA',
        };
      case 'SALARY':
        return {
          bgHeader: 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700',
          border: 'border-emerald-300 ring-4 ring-emerald-500/20',
          badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          icon: <Sparkles className="w-4 h-4 text-emerald-600" />,
          accentGlow: 'from-emerald-500/10 to-teal-500/5',
          label: 'GAJI BULANAN START',
        };
      case 'TAX':
        return {
          bgHeader: 'bg-gradient-to-r from-amber-600 via-red-600 to-rose-700',
          border: 'border-amber-300 ring-4 ring-amber-500/20',
          badgeBg: 'bg-amber-100 text-amber-800 border-amber-300',
          icon: <Landmark className="w-4 h-4 text-amber-700" />,
          accentGlow: 'from-amber-500/10 to-orange-500/5',
          label: 'PAJAK NEGARA / SPT',
        };
      case 'BUY':
        return {
          bgHeader: 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700',
          border: 'border-blue-300 ring-4 ring-blue-500/20',
          badgeBg: 'bg-blue-100 text-blue-800 border-blue-300',
          icon: <Building className="w-4 h-4 text-blue-600" />,
          accentGlow: 'from-blue-500/10 to-indigo-500/5',
          label: 'PEMBELIAN PROPERTI',
        };
      case 'UPGRADE':
        return {
          bgHeader: 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600',
          border: 'border-amber-300 ring-4 ring-amber-500/20',
          badgeBg: 'bg-amber-100 text-amber-800 border-amber-300',
          icon: <Store className="w-4 h-4 text-amber-600" />,
          accentGlow: 'from-amber-500/10 to-yellow-500/5',
          label: 'PENGEMBANGAN ASET',
        };
      case 'JAIL':
        return {
          bgHeader: 'bg-gradient-to-r from-red-700 via-rose-800 to-purple-900',
          border: 'border-red-400 ring-4 ring-red-600/30',
          badgeBg: 'bg-red-100 text-red-900 border-red-300',
          icon: <Siren className="w-4 h-4 text-red-600 animate-spin" />,
          accentGlow: 'from-red-600/15 to-purple-600/10',
          label: 'OTT & SEL PENJARA',
        };
      case 'POLICE':
        return {
          bgHeader: 'bg-gradient-to-r from-indigo-700 via-blue-700 to-red-700',
          border: 'border-indigo-300 ring-4 ring-indigo-500/20',
          badgeBg: 'bg-indigo-100 text-indigo-800 border-indigo-300',
          icon: <Siren className="w-4 h-4 text-indigo-600" />,
          accentGlow: 'from-indigo-500/10 to-blue-500/5',
          label: 'RAZIA & SIDAK POLISI',
        };
      case 'CARD':
        return {
          bgHeader: 'bg-gradient-to-r from-purple-600 via-fuchsia-600 to-purple-700',
          border: 'border-purple-300 ring-4 ring-purple-500/20',
          badgeBg: 'bg-purple-100 text-purple-800 border-purple-300',
          icon: <Gift className="w-4 h-4 text-purple-600" />,
          accentGlow: 'from-purple-500/10 to-fuchsia-500/5',
          label: 'KARTU WARGA / BANSOS',
        };
      case 'DISASTER':
        return {
          bgHeader: 'bg-gradient-to-r from-orange-600 via-rose-600 to-red-700',
          border: 'border-orange-300 ring-4 ring-orange-500/20',
          badgeBg: 'bg-orange-100 text-orange-900 border-orange-300',
          icon: <AlertTriangle className="w-4 h-4 text-orange-600 animate-bounce" />,
          accentGlow: 'from-orange-500/10 to-rose-500/5',
          label: 'BENCANA ALAM',
        };
      case 'BLACK_MARKET':
        return {
          bgHeader: 'bg-gradient-to-r from-slate-800 via-zinc-800 to-neutral-900',
          border: 'border-zinc-400 ring-4 ring-zinc-600/20',
          badgeBg: 'bg-zinc-100 text-zinc-900 border-zinc-300',
          icon: <Sparkles className="w-4 h-4 text-amber-500" />,
          accentGlow: 'from-zinc-800/15 to-neutral-900/10',
          label: 'PASAR GELAP',
        };
      case 'AUCTION':
        return {
          bgHeader: 'bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700',
          border: 'border-amber-300 ring-4 ring-amber-500/20',
          badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
          icon: <Gavel className="w-4 h-4 text-amber-600" />,
          accentGlow: 'from-amber-500/10 to-yellow-500/5',
          label: 'LELANG PROPERTI',
        };
      case 'TRADE':
        return {
          bgHeader: 'bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-700',
          border: 'border-teal-300 ring-4 ring-teal-500/20',
          badgeBg: 'bg-teal-100 text-teal-900 border-teal-300',
          icon: <RefreshCw className="w-4 h-4 text-teal-600" />,
          accentGlow: 'from-teal-500/10 to-cyan-500/5',
          label: 'BARTER / TUKAR ASET',
        };
      default:
        return {
          bgHeader: 'bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900',
          border: 'border-slate-300 ring-4 ring-slate-500/20',
          badgeBg: 'bg-slate-100 text-slate-800 border-slate-300',
          icon: <HelpCircle className="w-4 h-4 text-slate-600" />,
          accentGlow: 'from-slate-500/10 to-slate-600/5',
          label: 'KEJADIAN WARGA',
        };
    }
  };

  const theme = getTheme();

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="absolute inset-0 z-40 flex items-center justify-center p-2 pointer-events-auto bg-slate-950/25 backdrop-blur-[2px] transition-all duration-200 animate-in fade-in zoom-in-95 cursor-default"
    >
      <div
        className={`w-full max-w-[290px] sm:max-w-sm md:max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border ${theme.border} transform transition-all duration-300 relative flex flex-col`}
      >
        {/* Top Header Bar */}
        <div className={`${theme.bgHeader} text-white px-3 py-2 flex items-center justify-between shadow-xs`}>
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="p-1 bg-white/20 rounded-md backdrop-blur-xs shrink-0">
              {theme.icon}
            </span>
            <div className="min-w-0">
              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider block truncate">
                {theme.label}
              </span>
              <span className="text-[8px] text-white/80 block -mt-0.5">
                {event.timestamp} • Juara Nusantara
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {recentEvents.length > 1 && (
              <button
                onClick={() => setShowHistory((prev) => !prev)}
                title="Lihat riwayat kejadian"
                className={`p-1 rounded-md text-[9px] font-bold flex items-center gap-1 transition-colors ${
                  showHistory
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                <History className="w-3 h-3" />
                <span className="hidden sm:inline">Riwayat</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/25 rounded-full transition-colors text-white/90 hover:text-white"
              title="Tutup pop-up (Esc/Klik)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* History Dropdown Overlay if active */}
        {showHistory ? (
          <div className="p-2 sm:p-3 bg-slate-50 max-h-56 overflow-y-auto space-y-1.5 text-left text-xs">
            <div className="flex items-center justify-between pb-1 border-b border-slate-200">
              <span className="font-bold text-[10px] text-slate-700 uppercase">
                📜 Riwayat 5 Kejadian Terakhir
              </span>
              <button
                onClick={() => setShowHistory(false)}
                className="text-[10px] text-blue-600 font-semibold hover:underline"
              >
                Kembali
              </button>
            </div>
            {recentEvents.map((item, idx) => (
              <div
                key={item.id || idx}
                onClick={() => {
                  onSelectEvent?.(item);
                  setShowHistory(false);
                }}
                className={`p-1.5 rounded-lg border cursor-pointer transition-colors ${
                  item.id === event.id
                    ? 'bg-amber-100/70 border-amber-300 font-medium'
                    : 'bg-white border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-bold text-slate-800 truncate">{item.title}</span>
                  <span className="text-[8px] text-slate-400 shrink-0 ml-1">{item.timestamp}</span>
                </div>
                <div className="text-[9px] text-slate-600 line-clamp-1">{item.message}</div>
              </div>
            ))}
          </div>
        ) : (
          /* Main Event Body */
          <div
            className={`p-2.5 sm:p-3.5 bg-gradient-to-b ${theme.accentGlow} to-white flex flex-col items-center text-center`}
          >
            {/* Involved Players Row (if payer and receiver exist) */}
            {(event.playerName || event.targetPlayerName) && (
              <div className="flex items-center justify-center gap-2 mb-2 p-1 px-2.5 bg-slate-100/90 rounded-full border border-slate-200 shadow-2xs">
                {event.playerName && (
                  <div className="flex items-center gap-1">
                    <AvatarRenderer
                      customization={event.playerCustomAvatar}
                      fallbackIcon={event.playerAvatarId || 'ojol'}
                      size="xs"
                    />
                    <span className="text-[10px] sm:text-[11px] font-bold text-slate-800 max-w-[80px] sm:max-w-[100px] truncate">
                      {event.playerName}
                    </span>
                  </div>
                )}

                {event.targetPlayerName && (
                  <>
                    <div className="flex items-center text-slate-400">
                      <ArrowRight className="w-3 h-3 text-rose-500" />
                    </div>
                    <div className="flex items-center gap-1">
                      <AvatarRenderer
                        customization={event.targetCustomAvatar}
                        fallbackIcon={event.targetAvatarId || 'warung'}
                        size="xs"
                      />
                      <span className="text-[10px] sm:text-[11px] font-bold text-slate-800 max-w-[80px] sm:max-w-[100px] truncate">
                        {event.targetPlayerName}
                      </span>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Event Title */}
            <h3 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight leading-snug">
              {event.title}
            </h3>

            {/* Event Narrative Message */}
            <p className="text-[10px] sm:text-xs text-slate-700 font-medium mt-1 leading-relaxed px-1">
              {event.message}
            </p>

            {/* Amount Change Pill if applicable */}
            {event.amountChange !== undefined && event.amountChange !== 0 && (
              <div className="mt-2.5">
                {event.amountChange > 0 ? (
                  <div className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 font-black rounded-full border border-emerald-300 shadow-xs text-xs sm:text-sm animate-pulse">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                    <span>+{formatRupiah(event.amountChange)}</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1 px-3 py-1 bg-rose-50 text-rose-700 font-black rounded-full border border-rose-300 shadow-xs text-xs sm:text-sm animate-pulse">
                    <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
                    <span>-{formatRupiah(Math.abs(event.amountChange))}</span>
                  </div>
                )}
              </div>
            )}

            {/* Property Name Tag if provided */}
            {event.propertyName && (
              <div className="mt-1.5 text-[9px] sm:text-[10px] font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-md border border-amber-200">
                📍 Lokasi: {event.propertyName}
              </div>
            )}

            {/* Quick Action Button */}
            <div className="mt-2.5 w-full flex items-center justify-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-1 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white text-[10px] sm:text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-1"
              >
                <span>OK, Lanjut</span>
              </button>
            </div>
          </div>
        )}

        {/* Auto-dismiss progress countdown line */}
        <div className="w-full bg-slate-200 h-1 overflow-hidden relative">
          <div
            className={`h-full transition-all duration-75 ${
              event.amountChange && event.amountChange > 0
                ? 'bg-emerald-500'
                : event.amountChange && event.amountChange < 0
                ? 'bg-rose-500'
                : 'bg-amber-500'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};
