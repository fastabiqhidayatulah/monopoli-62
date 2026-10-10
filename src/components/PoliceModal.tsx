import React from 'react';
import { Player } from '../types/game';
import { formatRupiah } from '../utils/format';
import { Shield, AlertCircle, FileText, Coffee, Scale, Lock, Key } from 'lucide-react';

interface PoliceModalProps {
  player: Player;
  isOpen: boolean;
  isJailCell: boolean; // True jika saat ini sedang mendekam di penjara
  onClose: () => void;
  onPayOfficialFine: () => void;
  onGoToCourt: () => void;
  onAttemptBribe: () => void;
  onPayBail: () => void;
  onUseGetOutOfJailCard: () => void;
  onTryRollDouble: () => void;
}

export const PoliceModal: React.FC<PoliceModalProps> = ({
  player,
  isOpen,
  isJailCell,
  onClose,
  onPayOfficialFine,
  onGoToCourt,
  onAttemptBribe,
  onPayBail,
  onUseGetOutOfJailCard,
  onTryRollDouble,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3">
      <div className="bg-white border-2 border-blue-600 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-800 via-indigo-900 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Shield className="w-6 h-6 text-yellow-400" />
            <div>
              <h2 className="text-lg font-black tracking-tight">
                {isJailCell ? 'SEL TAHANAN POLDA' : 'POS PEMERIKSAAN & RAZIA POLISI'}
              </h2>
              <p className="text-xs text-blue-200">
                {isJailCell ? 'Status: Menjalani Masa Tahanan' : 'Operasi Tertib Warga Nusantara'}
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {!isJailCell ? (
            /* Razia Tilang Mode */
            <>
              <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900 leading-relaxed">
                  <span className="font-bold">Pelanggaran Terdeteksi!</span> Anda terkena razia surat kendaraan /
                  pelanggaran aturan jalan raya. Silakan pilih jalur penyelesaian hukum:
                </div>
              </div>

              {/* Player Legal Risk Status */}
              <div className="flex justify-between items-center text-xs bg-slate-100 p-2.5 rounded-xl font-semibold">
                <span className="text-slate-600">Risiko Hukum Anda:</span>
                <span className="text-rose-600 font-bold">{player.legalRisk}%</span>
              </div>

              <div className="space-y-2.5">
                {/* 1. Bayar Resmi */}
                <button
                  onClick={onPayOfficialFine}
                  disabled={player.money < 500000}
                  className="w-full p-3.5 rounded-2xl border-2 border-emerald-500 bg-emerald-50/60 hover:bg-emerald-100 text-left transition-all cursor-pointer flex items-center justify-between shadow-xs disabled:opacity-50"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-emerald-700" />
                    <div>
                      <div className="text-xs font-black text-emerald-950">Bayar Denda Tilang Resmi (Bank BRI)</div>
                      <div className="text-[11px] text-emerald-700">Aman 100%, reputasi bersih, masuk kas negara.</div>
                    </div>
                  </div>
                  <span className="text-xs font-black text-emerald-800">{formatRupiah(500000)}</span>
                </button>

                {/* 2. Sidang Pengadilan */}
                <button
                  onClick={onGoToCourt}
                  disabled={player.money < 200000}
                  className="w-full p-3.5 rounded-2xl border-2 border-blue-400 bg-blue-50/60 hover:bg-blue-100 text-left transition-all cursor-pointer flex items-center justify-between shadow-xs disabled:opacity-50"
                >
                  <div className="flex items-center gap-3">
                    <Scale className="w-5 h-5 text-blue-700" />
                    <div>
                      <div className="text-xs font-black text-blue-950">Sidang Tipiring Pengadilan Negeri</div>
                      <div className="text-[11px] text-blue-700">Denda murah, tapi proses antre lama.</div>
                    </div>
                  </div>
                  <span className="text-xs font-black text-blue-800">{formatRupiah(200000)}</span>
                </button>

                {/* 3. Opsi Suap 'Uang Rokok' */}
                <button
                  onClick={onAttemptBribe}
                  disabled={player.money < 150000}
                  className="w-full p-3.5 rounded-2xl border-2 border-amber-500 bg-amber-50/60 hover:bg-amber-100 text-left transition-all cursor-pointer flex items-center justify-between shadow-xs disabled:opacity-50"
                >
                  <div className="flex items-center gap-3">
                    <Coffee className="w-5 h-5 text-amber-700" />
                    <div>
                      <div className="text-xs font-black text-amber-950">Coba "Uang Rokok" & Salam Tempel</div>
                      <div className="text-[11px] text-amber-700">
                        Probabilitas sukses 55%. Jika gagal: OTT & Masuk Penjara!
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-black text-amber-800">{formatRupiah(150000)}</span>
                </button>
              </div>
            </>
          ) : (
            /* Jail Tahanan Mode */
            <>
              <div className="bg-rose-50 rounded-2xl p-4 border border-rose-200 flex items-start gap-3">
                <Lock className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="text-xs text-rose-900 leading-relaxed">
                  <span className="font-bold">Masa Tahanan:</span> Tersisa {player.jailTurns} giliran lagi di sel Polda.
                  Pilih cara untuk bebas:
                </div>
              </div>

              <div className="space-y-2.5">
                {/* Jaminan Bail */}
                <button
                  onClick={onPayBail}
                  disabled={player.money < 1000000}
                  className="w-full p-3.5 rounded-2xl border-2 border-emerald-500 bg-emerald-50 hover:bg-emerald-100 text-left transition-all cursor-pointer flex items-center justify-between disabled:opacity-50"
                >
                  <div>
                    <div className="text-xs font-black text-emerald-950">Bayar Uang Jaminan Penangguhan (Bail)</div>
                    <div className="text-[11px] text-emerald-700">Langsung bebas seketika dan dapat melangkah lagi.</div>
                  </div>
                  <span className="text-xs font-black text-emerald-800">{formatRupiah(1000000)}</span>
                </button>

                {/* Surat Sakti / Orang Dalem */}
                {player.hasGetOutOfJailCard && (
                  <button
                    onClick={onUseGetOutOfJailCard}
                    className="w-full p-3.5 rounded-2xl border-2 border-purple-500 bg-purple-50 hover:bg-purple-100 text-left transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Key className="w-5 h-5 text-purple-700" />
                      <div>
                        <div className="text-xs font-black text-purple-950">Gunakan Surat Sakti "Kenalan Pejabat"</div>
                        <div className="text-[11px] text-purple-700">Bebas tanpa bayar sepeser pun!</div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-purple-800">GRATIS</span>
                  </button>
                )}

                {/* Lempar Dadu Kembar */}
                <button
                  onClick={onTryRollDouble}
                  className="w-full p-3.5 rounded-2xl border-2 border-slate-300 bg-slate-50 hover:bg-slate-100 text-left transition-all cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-black text-slate-900">Coba Lempar Dadu Kembar</div>
                    <div className="text-[11px] text-slate-600">Jika dapat dadu kembar (misal 3-3), Anda bebas!</div>
                  </div>
                  <span className="text-xs font-bold text-slate-700">🎲🎲</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
