import React from 'react';
import { NaturalDisasterEvent, GameEventCard } from '../types/game';
import { formatRupiah } from '../utils/format';
import { Siren, HelpCircle, Gift, Check, Waves, Flame } from 'lucide-react';

interface DisasterPopupProps {
  disaster: NaturalDisasterEvent | null;
  cardEvent: GameEventCard | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DisasterPopup: React.FC<DisasterPopupProps> = ({
  disaster,
  cardEvent,
  isOpen,
  onClose,
}) => {
  if (!isOpen || (!disaster && !cardEvent)) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border-2 border-amber-300 w-full max-w-md overflow-hidden text-center p-6 space-y-4">
        {disaster ? (
          <>
            <div className="inline-flex p-3.5 bg-rose-100 rounded-full text-rose-600 animate-pulse">
              <Siren className="w-10 h-10" />
            </div>

            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded-full">
                PERINGATAN DINI BENCANA ALAM
              </span>
              <h2 className="text-xl font-black text-slate-900 mt-2">{disaster.title}</h2>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed bg-rose-50 p-3 rounded-xl border border-rose-200">
                {disaster.impactDescription}
              </p>
            </div>

            <div className="text-xs bg-slate-50 p-3 rounded-xl space-y-1 text-slate-700 text-left border border-slate-200">
              <div className="flex justify-between">
                <span>Wilayah Terdampak:</span>
                <span className="font-bold text-slate-900">{disaster.cityName}</span>
              </div>
              <div className="flex justify-between">
                <span>Penalti Sewa:</span>
                <span className="font-bold text-rose-600">Turun {disaster.rentPenaltyPercent}%</span>
              </div>
              <div className="flex justify-between">
                <span>Biaya Perbaikan per Bangunan:</span>
                <span className="font-bold text-amber-700">{formatRupiah(disaster.repairCostPerBuilding)}</span>
              </div>
            </div>
          </>
        ) : cardEvent ? (
          <>
            <div className="inline-flex p-3.5 bg-purple-100 rounded-full text-purple-600">
              {cardEvent.type === 'MONEY' ? (
                <Gift className="w-10 h-10" />
              ) : (
                <HelpCircle className="w-10 h-10" />
              )}
            </div>

            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-full">
                KARTU KEJADIAN WARGA
              </span>
              <h2 className="text-xl font-black text-slate-900 mt-2">{cardEvent.title}</h2>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed bg-purple-50 p-3 rounded-xl border border-purple-200">
                {cardEvent.description}
              </p>
            </div>

            <p className="text-[11px] text-amber-800 italic bg-amber-50/70 p-2 rounded-lg">
              "{cardEvent.flairText}"
            </p>
          </>
        ) : null}

        <button
          onClick={onClose}
          className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5"
        >
          <Check className="w-4 h-4" />
          <span>Mengerti & Lanjutkan</span>
        </button>
      </div>
    </div>
  );
};
