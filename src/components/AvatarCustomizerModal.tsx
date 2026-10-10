import React, { useState } from 'react';
import { AvatarCustomization, Player } from '../types/game';
import { AvatarRenderer, DEFAULT_AVATAR_CUSTOMIZATION } from './AvatarRenderer';
import { AVATAR_CHARACTERS } from '../data/avatars';
import { sounds } from '../utils/audio';
import { X, Sparkles, Check, RefreshCw, Palette, User, Shirt, Smile, Shield } from 'lucide-react';

interface AvatarCustomizerModalProps {
  currentCustomization?: AvatarCustomization;
  playerName: string;
  isOpen: boolean;
  onClose: () => void;
  onSaveCustomization: (newCustomization: AvatarCustomization) => void;
}

const SKIN_TONES = [
  { name: 'Kuning Langsat', color: '#fed7aa' },
  { name: 'Sawo Matang Alami', color: '#f59e0b' },
  { name: 'Sawo Matang Eksotis', color: '#d97706' },
  { name: 'Cokelat Tropis', color: '#b45309' },
  { name: 'Cerah Berkilau', color: '#ffedd5' },
];

const HAIR_STYLES: Array<{ id: AvatarCustomization['hairStyle']; name: string; desc: string }> = [
  { id: 'helm_ojol', name: 'Helm Ojol Hijau', desc: 'Ikon pejuang jalanan aspal' },
  { id: 'pompadour', name: 'Pompadour Klimis', desc: 'Rambut minyak necis kekinian' },
  { id: 'kuncir', name: 'Sanggul / Kuncir', desc: 'Anggun khas budaya nusantara' },
  { id: 'gondrong', name: 'Gondrong Seniman', desc: 'Karakter bebas idealis' },
  { id: 'hijab', name: 'Hijab Modern', desc: 'Kerudung rapi bersahaja' },
  { id: 'cepak', name: 'Cepak Rapi', desc: 'Potongan tegas praktis' },
];

const HAIR_COLORS = [
  { name: 'Hitam Pekat', color: '#0f172a' },
  { name: 'Cokelat Gelap', color: '#451a03' },
  { name: 'Pirang Bule', color: '#d97706' },
  { name: 'Biru Langit (Hijab)', color: '#0284c7' },
  { name: 'Merah Marun', color: '#991b1b' },
];

const CLOTHING_OPTIONS: Array<{ id: AvatarCustomization['clothing']; name: string; defaultColor: string }> = [
  { id: 'jaket_ojol', name: 'Jaket Ojol Satset', defaultColor: '#16a34a' },
  { id: 'daster_batik', name: 'Daster Batik Rayon', defaultColor: '#be185d' },
  { id: 'rompi_proyek', name: 'Rompi Safety Kontraktor', defaultColor: '#ea580c' },
  { id: 'blazer_jaksel', name: 'Blazer SCBD Jaksel', defaultColor: '#1e293b' },
  { id: 'batik_formal', name: 'Kemeja Batik Kawung', defaultColor: '#78350f' },
  { id: 'kaos_santuy', name: 'Kaos Oblong Santai', defaultColor: '#2563eb' },
];

const ACCESSORY_OPTIONS: Array<{ id: AvatarCustomization['accessory']; name: string; desc: string }> = [
  { id: 'none', name: 'Tanpa Aksesoris', desc: 'Tampilan polos natural' },
  { id: 'kacamata_hitam', name: 'Kacamata Hitam Aviator', desc: 'Gaya bos besar anti silau' },
  { id: 'peci_songkok', name: 'Peci Hitam Beludru', desc: 'Simbol wibawa nasional' },
  { id: 'blangkon', name: 'Blangkon Jawa', desc: 'Keanggunan budaya Mataram' },
  { id: 'masker', name: 'Masker Medis', desc: 'Tertib protokol kesehatan' },
  { id: 'kalung_emas', name: 'Rantai Kalung Emas', desc: 'Gaya sultan tajir melintir' },
  { id: 'walkie_talkie', name: 'Walkie-Talkie Intel', desc: 'Alat komunikasi intel rahasia' },
];

export const AvatarCustomizerModal: React.FC<AvatarCustomizerModalProps> = ({
  currentCustomization = DEFAULT_AVATAR_CUSTOMIZATION,
  playerName,
  isOpen,
  onClose,
  onSaveCustomization,
}) => {
  const [activeTab, setActiveTab] = useState<'base' | 'skin' | 'hair' | 'clothes' | 'acc'>('base');
  const [customAvatar, setCustomAvatar] = useState<AvatarCustomization>(currentCustomization);

  if (!isOpen) return null;

  const handleSelectBase = (baseId: string) => {
    sounds.playBidChime();
    let newHair: AvatarCustomization['hairStyle'] = 'pompadour';
    let newClothes: AvatarCustomization['clothing'] = 'kaos_santuy';
    let newColor = '#2563eb';

    if (baseId === 'ojol') {
      newHair = 'helm_ojol';
      newClothes = 'jaket_ojol';
      newColor = '#16a34a';
    } else if (baseId === 'warung') {
      newHair = 'kuncir';
      newClothes = 'daster_batik';
      newColor = '#be185d';
    } else if (baseId === 'kontraktor') {
      newHair = 'cepak';
      newClothes = 'rompi_proyek';
      newColor = '#ea580c';
    } else if (baseId === 'selebgram') {
      newHair = 'gondrong';
      newClothes = 'blazer_jaksel';
      newColor = '#ec4899';
    }

    setCustomAvatar((prev) => ({
      ...prev,
      baseCharacterId: baseId,
      hairStyle: newHair,
      clothing: newClothes,
      clothingColor: newColor,
    }));
  };

  const handleRandomize = () => {
    sounds.playDiceRoll();
    const randomSkin = SKIN_TONES[Math.floor(Math.random() * SKIN_TONES.length)].color;
    const randomHair = HAIR_STYLES[Math.floor(Math.random() * HAIR_STYLES.length)].id;
    const randomHairColor = HAIR_COLORS[Math.floor(Math.random() * HAIR_COLORS.length)].color;
    const randomCloth = CLOTHING_OPTIONS[Math.floor(Math.random() * CLOTHING_OPTIONS.length)];
    const randomAcc = ACCESSORY_OPTIONS[Math.floor(Math.random() * ACCESSORY_OPTIONS.length)].id;

    setCustomAvatar({
      baseCharacterId: customAvatar.baseCharacterId,
      skinTone: randomSkin,
      hairStyle: randomHair,
      hairColor: randomHairColor,
      clothing: randomCloth.id,
      clothingColor: randomCloth.defaultColor,
      accessory: randomAcc,
    });
  };

  const handleSave = () => {
    sounds.playCash();
    // Persist to localStorage
    try {
      localStorage.setItem('nusantara_avatar_custom', JSON.stringify(customAvatar));
    } catch (e) {
      // Ignored
    }
    onSaveCustomization(customAvatar);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 animate-in fade-in duration-200">
      <div className="bg-slate-900 border-2 border-amber-500/50 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col text-slate-100">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-700 via-orange-700 to-amber-800 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-yellow-300" />
            <div>
              <h2 className="text-lg font-black tracking-tight">KUSTOMISASI AVATAR WARGA +62</h2>
              <p className="text-xs text-amber-100">
                Sesuaikan wajah, rambut, busana daerah, dan aksesoris khas nusantara!
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

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Live Preview Display & Randomizer Button */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <AvatarRenderer customization={customAvatar} size="xl" className="border-4 border-amber-400 shadow-xl" />
                <div className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded-full">
                  PION
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Pratinjau Warga</span>
                <h3 className="text-lg font-black text-white">{playerName}</h3>
                <p className="text-xs text-slate-400">
                  {AVATAR_CHARACTERS.find((c) => c.id === customAvatar.baseCharacterId)?.title || 'Warga Nusantara'}
                </p>
              </div>
            </div>

            <button
              onClick={handleRandomize}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border border-slate-700"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Acak Gaya (Random)</span>
            </button>
          </div>

          {/* Navigation Category Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveTab('base')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'base' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Model Karakter</span>
            </button>

            <button
              onClick={() => setActiveTab('skin')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'skin' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smile className="w-3.5 h-3.5" />
              <span>Warna Kulit</span>
            </button>

            <button
              onClick={() => setActiveTab('hair')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'hair' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Gaya Rambut</span>
            </button>

            <button
              onClick={() => setActiveTab('clothes')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'clothes' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Shirt className="w-3.5 h-3.5" />
              <span>Pakaian</span>
            </button>

            <button
              onClick={() => setActiveTab('acc')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'acc' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Aksesoris</span>
            </button>
          </div>

          {/* Tab 1: Base Character */}
          {activeTab === 'base' && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Pilih Karakter Dasar Indonesia:
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {AVATAR_CHARACTERS.map((char) => {
                  const isSelected = customAvatar.baseCharacterId === char.id;
                  return (
                    <div
                      key={char.id}
                      onClick={() => handleSelectBase(char.id)}
                      className={`p-3 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center text-center ${
                        isSelected
                          ? 'border-amber-400 bg-amber-500/20 shadow-lg ring-1 ring-amber-400'
                          : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-3xl mb-1">{char.avatarIcon}</span>
                      <span className="text-xs font-black text-white">{char.name}</span>
                      <span className="text-[10px] text-amber-300 mt-0.5">{char.role}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 2: Skin Tone */}
          {activeTab === 'skin' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Pilih Warna Kulit Nusantara:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SKIN_TONES.map((tone) => {
                  const isSelected = customAvatar.skinTone === tone.color;
                  return (
                    <div
                      key={tone.color}
                      onClick={() => {
                        sounds.playBidChime();
                        setCustomAvatar((prev) => ({ ...prev, skinTone: tone.color }));
                      }}
                      className={`p-3 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                        isSelected
                          ? 'border-amber-400 bg-amber-500/20 shadow-md'
                          : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-7 h-7 rounded-full border-2 border-white/60 shadow-inner"
                          style={{ backgroundColor: tone.color }}
                        />
                        <span className="text-xs font-bold text-white">{tone.name}</span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-amber-400" />}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 3: Hair Style & Hair Color */}
          {activeTab === 'hair' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Model Rambut & Penutup Kepala:
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {HAIR_STYLES.map((hair) => {
                    const isSelected = customAvatar.hairStyle === hair.id;
                    return (
                      <div
                        key={hair.id}
                        onClick={() => {
                          sounds.playBidChime();
                          setCustomAvatar((prev) => ({ ...prev, hairStyle: hair.id }));
                        }}
                        className={`p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-amber-400 bg-amber-500/20 shadow-md'
                            : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                        }`}
                      >
                        <div className="text-xs font-black text-white">{hair.name}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{hair.desc}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Warna Rambut / Kerudung:
                </h4>
                <div className="flex items-center gap-2">
                  {HAIR_COLORS.map((hc) => (
                    <button
                      key={hc.color}
                      onClick={() => {
                        sounds.playBidChime();
                        setCustomAvatar((prev) => ({ ...prev, hairColor: hc.color }));
                      }}
                      className={`w-9 h-9 rounded-full border-2 transition-transform cursor-pointer flex items-center justify-center ${
                        customAvatar.hairColor === hc.color ? 'scale-110 border-amber-400 ring-2 ring-amber-400' : 'border-white/40'
                      }`}
                      style={{ backgroundColor: hc.color }}
                      title={hc.name}
                    >
                      {customAvatar.hairColor === hc.color && <Check className="w-4 h-4 text-white" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Clothing */}
          {activeTab === 'clothes' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Pakaian / Seragam Khas Warga:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CLOTHING_OPTIONS.map((c) => {
                  const isSelected = customAvatar.clothing === c.id;
                  return (
                    <div
                      key={c.id}
                      onClick={() => {
                        sounds.playBidChime();
                        setCustomAvatar((prev) => ({
                          ...prev,
                          clothing: c.id,
                          clothingColor: c.defaultColor,
                        }));
                      }}
                      className={`p-3.5 rounded-2xl border-2 cursor-pointer flex items-center justify-between transition-all ${
                        isSelected
                          ? 'border-amber-400 bg-amber-500/20 shadow-md'
                          : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-5 h-5 rounded-md border"
                          style={{ backgroundColor: c.defaultColor }}
                        />
                        <span className="text-xs font-black text-white">{c.name}</span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-amber-400" />}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 5: Accessories */}
          {activeTab === 'acc' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Aksesoris Tambahan Warga Indonesia:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ACCESSORY_OPTIONS.map((acc) => {
                  const isSelected = customAvatar.accessory === acc.id;
                  return (
                    <div
                      key={acc.id}
                      onClick={() => {
                        sounds.playBidChime();
                        setCustomAvatar((prev) => ({ ...prev, accessory: acc.id }));
                      }}
                      className={`p-3 rounded-2xl border-2 cursor-pointer flex flex-col justify-between transition-all ${
                        isSelected
                          ? 'border-amber-400 bg-amber-500/20 shadow-md'
                          : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-white">{acc.name}</span>
                        {isSelected && <Check className="w-4 h-4 text-amber-400" />}
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1">{acc.desc}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">Pilihan otomatis tersimpan ke profil pion Anda.</span>
            <button
              onClick={handleSave}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black rounded-xl text-xs transition-all shadow-lg active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Simpan & Terapkan Avatar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
