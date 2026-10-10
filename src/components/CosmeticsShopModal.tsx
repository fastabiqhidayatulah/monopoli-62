import React from 'react';
import { CosmeticSkin } from '../types/game';
import { AVATAR_CHARACTERS } from '../data/avatars';
import { sounds } from '../utils/audio';
import { X, Sparkles, Coins, Check, Award, CheckCircle2 } from 'lucide-react';

interface CosmeticsShopModalProps {
  userCoins: number;
  unlockedSkins: string[];
  activeAvatarId: string;
  isOpen: boolean;
  onClose: () => void;
  onBuySkin: (skinId: string, price: number) => void;
  onSelectSkin: (skinId: string) => void;
  onClaimDailyReward: () => void;
  hasClaimedDaily: boolean;
}

export const CosmeticsShopModal: React.FC<CosmeticsShopModalProps> = ({
  userCoins,
  unlockedSkins,
  activeAvatarId,
  isOpen,
  onClose,
  onBuySkin,
  onSelectSkin,
  onClaimDailyReward,
  hasClaimedDaily,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3">
      <div className="bg-white rounded-3xl shadow-2xl border border-purple-300 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-300" />
            <div>
              <h2 className="text-lg font-black tracking-tight">TOKO KOSMETIK & KOIN NUSANTARA</h2>
              <p className="text-xs text-purple-200">
                100% Kosmetik & Penampilan Saja — Tanpa Pay-To-Win!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 transition-all text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Daily Quest Banner */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Award className="w-8 h-8 text-amber-600 shrink-0" />
              <div>
                <h3 className="text-xs font-black text-amber-950">Misi Absen Harian Warga Teladan</h3>
                <p className="text-[11px] text-amber-800">
                  Login & aktif bermain untuk dapatkan +50 Koin Nusantara gratis tiap hari!
                </p>
              </div>
            </div>

            <button
              disabled={hasClaimedDaily}
              onClick={() => {
                sounds.playCash();
                onClaimDailyReward();
              }}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer shadow-sm ${
                hasClaimedDaily
                  ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                  : 'bg-amber-500 hover:bg-amber-600 text-white active:scale-95'
              }`}
            >
              {hasClaimedDaily ? 'Sudah Diklaim' : 'Klaim +50 Koin'}
            </button>
          </div>

          {/* User Coins Status */}
          <div className="flex items-center justify-between bg-purple-50 p-3 rounded-2xl border border-purple-200">
            <span className="text-xs font-bold text-purple-900">Saldo Koin Nusantara Anda:</span>
            <div className="flex items-center gap-1.5 font-black text-purple-950 text-base">
              <Coins className="w-5 h-5 text-amber-500 fill-amber-400" />
              <span>{userCoins} Koin</span>
            </div>
          </div>

          {/* Skins Grid */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Koleksi Skin Avatar Karakter Warga:
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {AVATAR_CHARACTERS.map((char) => {
                const isUnlocked = unlockedSkins.includes(char.id) || char.priceCoins === 0;
                const isEquipped = activeAvatarId === char.id;
                const canBuy = userCoins >= char.priceCoins;

                return (
                  <div
                    key={char.id}
                    className={`p-3.5 rounded-2xl border-2 flex flex-col justify-between transition-all ${
                      isEquipped
                        ? 'border-purple-600 bg-purple-50/60 shadow-md ring-2 ring-purple-300'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner border border-white"
                        style={{ backgroundColor: `${char.accentColor}20` }}
                      >
                        {char.avatarIcon}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-black text-slate-800">{char.name}</h4>
                          {isEquipped && (
                            <span className="text-[10px] bg-purple-600 text-white px-2 py-0.5 rounded-full font-bold">
                              Dipakai
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-purple-700 font-semibold">{char.title}</p>
                        <p className="text-[10px] text-slate-500 mt-1">{char.perkDescription}</p>
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs font-bold text-amber-600">
                        {char.priceCoins > 0 ? (
                          <>
                            <Coins className="w-3.5 h-3.5 text-amber-500" />
                            <span>{char.priceCoins} Koin</span>
                          </>
                        ) : (
                          <span className="text-emerald-600 font-black">Gratis Default</span>
                        )}
                      </div>

                      {isUnlocked ? (
                        <button
                          disabled={isEquipped}
                          onClick={() => {
                            sounds.playCash();
                            onSelectSkin(char.id);
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            isEquipped
                              ? 'bg-slate-100 text-slate-400 cursor-default'
                              : 'bg-purple-600 hover:bg-purple-700 text-white active:scale-95'
                          }`}
                        >
                          {isEquipped ? 'Digunakan' : 'Gunakan'}
                        </button>
                      ) : (
                        <button
                          disabled={!canBuy}
                          onClick={() => {
                            sounds.playCash();
                            onBuySkin(char.id, char.priceCoins);
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            canBuy
                              ? 'bg-amber-500 hover:bg-amber-600 text-white active:scale-95'
                              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                          }`}
                        >
                          Buka Kunci
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
