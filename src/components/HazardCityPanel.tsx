import React, { useState } from 'react';
import { CityGroup, CityStatus, Player, BoardSquare } from '../types/game';
import { formatRupiah } from '../utils/format';
import { sounds } from '../utils/audio';
import { X, Building, ShieldCheck, HeartPulse, TreePine, Waves, Car, Check } from 'lucide-react';

interface HazardCityPanelProps {
  cityStatuses: Record<CityGroup, CityStatus>;
  player: Player;
  board: BoardSquare[];
  isOpen: boolean;
  onClose: () => void;
  onBuildFacility: (city: CityGroup, facilityType: 'floodDike' | 'transitLine' | 'healthCenter' | 'cityPark', cost: number) => void;
}

const CITY_NAMES: Record<CityGroup, string> = {
  JAKARTA: 'DKI Jakarta',
  BANDUNG: 'Kota Bandung',
  SEMARANG: 'Kota Semarang',
  SOLO: 'Kota Solo (Surakarta)',
  YOGYAKARTA: 'D.I. Yogyakarta',
  SURABAYA: 'Kota Surabaya',
  PALEMBANG: 'Kota Palembang',
  MEDAN: 'Kota Medan',
  BALI: 'Provinsi Bali',
  MAKASSAR: 'Kota Makassar',
  TRANSPORT: 'Jaringan Transportasi',
  UTILITY: 'Layanan Publik & Utilitas',
  SPECIAL: 'Wilayah Khusus',
};

const FACILITY_COSTS = {
  floodDike: 800000,
  transitLine: 1200000,
  healthCenter: 600000,
  cityPark: 450000,
};

export const HazardCityPanel: React.FC<HazardCityPanelProps> = ({
  cityStatuses,
  player,
  board,
  isOpen,
  onClose,
  onBuildFacility,
}) => {
  const [selectedCity, setSelectedCity] = useState<CityGroup>('JAKARTA');

  if (!isOpen) return null;

  const validCities: CityGroup[] = [
    'JAKARTA',
    'BANDUNG',
    'SEMARANG',
    'SOLO',
    'YOGYAKARTA',
    'SURABAYA',
    'PALEMBANG',
    'MEDAN',
  ];

  const currentCityStatus = cityStatuses[selectedCity];
  const citySquares = board.filter((s) => s.city === selectedCity);
  const mySquaresInCity = citySquares.filter((s) => s.ownerId === player.id);

  const getWelfareBadge = (index: number) => {
    if (index >= 75) {
      return <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-xs font-black">Sangat Sejahtera ({index}/100)</span>;
    }
    if (index >= 50) {
      return <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-xs font-black">Cukup Layak ({index}/100)</span>;
    }
    return <span className="bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full text-xs font-black">Rawan Masalah ({index}/100)</span>;
  };

  const getHazardBadge = (hazard: string) => {
    switch (hazard) {
      case 'BANJIR':
        return <span className="bg-blue-600 text-white px-2 py-0.5 rounded-full text-xs font-bold animate-pulse">🌊 Terendam Banjir</span>;
      case 'MACET':
        return <span className="bg-amber-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">🚗 Macet Total</span>;
      case 'POLUSI':
        return <span className="bg-slate-700 text-white px-2 py-0.5 rounded-full text-xs font-bold">🌫️ Polusi Udara</span>;
      default:
        return <span className="bg-emerald-600 text-white px-2 py-0.5 rounded-full text-xs font-bold">✅ Kondisi Aman</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3">
      <div className="bg-white rounded-3xl shadow-2xl border border-amber-300 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏛️</span>
            <div>
              <h2 className="text-lg font-black tracking-tight">KESEJAHTERAAN KOTA & FASILITAS PUBLIK</h2>
              <p className="text-xs text-blue-100">
                Bangun infrastruktur bersama untuk menaikkan sewa dan cegah bencana
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
          {/* City Selector Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {validCities.map((cityKey) => {
              const isSelected = selectedCity === cityKey;
              const status = cityStatuses[cityKey];
              return (
                <button
                  key={cityKey}
                  onClick={() => setSelectedCity(cityKey)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-300'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span>{CITY_NAMES[cityKey]}</span>
                  {status.hazard === 'BANJIR' && <span>🌊</span>}
                  {status.hazard === 'MACET' && <span>🚗</span>}
                </button>
              );
            })}
          </div>

          {/* City Summary Banner */}
          <div className="bg-gradient-to-br from-slate-50 to-blue-50/50 rounded-2xl p-4 border border-blue-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-black text-slate-800">{CITY_NAMES[selectedCity]}</h3>
                <p className="text-xs text-slate-500">
                  Kepemilikanmu: {mySquaresInCity.length} dari {citySquares.length} petak di kota ini
                </p>
              </div>
              <div className="flex items-center gap-2">
                {getWelfareBadge(currentCityStatus.welfareIndex)}
                {getHazardBadge(currentCityStatus.hazard)}
              </div>
            </div>

            {/* Welfare Meter Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold text-slate-600">
                <span>Indeks Kesejahteraan Warga</span>
                <span>{currentCityStatus.welfareIndex}%</span>
              </div>
              <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    currentCityStatus.welfareIndex >= 70
                      ? 'bg-emerald-500'
                      : currentCityStatus.welfareIndex >= 45
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                  style={{ width: `${currentCityStatus.welfareIndex}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500">
                Indeks tinggi memberi bonus sewa +25% dan mencegah demo/kriminalitas.
              </p>
            </div>
          </div>

          {/* Public Facilities Construction Options */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Infrastruktur & Fasilitas Publik yang Tersedia
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Tanggul Banjir / Pompa */}
              <div className="p-3.5 rounded-2xl border border-slate-200 bg-white shadow-xs flex flex-col justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
                    <Waves className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-slate-800">Tanggul & Pompa Air Canggih</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Mencegah bencana banjir merendam properti di kota ini.
                    </p>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">
                    {formatRupiah(FACILITY_COSTS.floodDike)}
                  </span>
                  {currentCityStatus.publicFacilities.floodDike ? (
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                      <Check className="w-4 h-4" /> Terbangun
                    </span>
                  ) : (
                    <button
                      disabled={player.money < FACILITY_COSTS.floodDike}
                      onClick={() => {
                        sounds.playCash();
                        onBuildFacility(selectedCity, 'floodDike', FACILITY_COSTS.floodDike);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
                    >
                      Bangun Fasilitas
                    </button>
                  )}
                </div>
              </div>

              {/* Jalur MRT / Flyover */}
              <div className="p-3.5 rounded-2xl border border-slate-200 bg-white shadow-xs flex flex-col justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
                    <Car className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-slate-800">Jalur MRT & Flyover Bebas Hambatan</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Menghilangkan hazard macet dan menambah sewa +10%.
                    </p>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">
                    {formatRupiah(FACILITY_COSTS.transitLine)}
                  </span>
                  {currentCityStatus.publicFacilities.transitLine ? (
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                      <Check className="w-4 h-4" /> Terbangun
                    </span>
                  ) : (
                    <button
                      disabled={player.money < FACILITY_COSTS.transitLine}
                      onClick={() => {
                        sounds.playCash();
                        onBuildFacility(selectedCity, 'transitLine', FACILITY_COSTS.transitLine);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
                    >
                      Bangun Fasilitas
                    </button>
                  )}
                </div>
              </div>

              {/* Puskesmas & RSUD */}
              <div className="p-3.5 rounded-2xl border border-slate-200 bg-white shadow-xs flex flex-col justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-rose-100 text-rose-700 rounded-xl">
                    <HeartPulse className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-slate-800">Puskesmas & RSUD Daerah</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Meningkatkan Indeks Kesejahteraan +15 poin seketika.
                    </p>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">
                    {formatRupiah(FACILITY_COSTS.healthCenter)}
                  </span>
                  {currentCityStatus.publicFacilities.healthCenter ? (
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                      <Check className="w-4 h-4" /> Terbangun
                    </span>
                  ) : (
                    <button
                      disabled={player.money < FACILITY_COSTS.healthCenter}
                      onClick={() => {
                        sounds.playCash();
                        onBuildFacility(selectedCity, 'healthCenter', FACILITY_COSTS.healthCenter);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
                    >
                      Bangun Fasilitas
                    </button>
                  )}
                </div>
              </div>

              {/* Taman Kota & RTH */}
              <div className="p-3.5 rounded-2xl border border-slate-200 bg-white shadow-xs flex flex-col justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                    <TreePine className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-slate-800">Taman Kota & Ruang Hijau</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Udara bersih, warga bahagia, reputasi sosial naik +10 poin.
                    </p>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">
                    {formatRupiah(FACILITY_COSTS.cityPark)}
                  </span>
                  {currentCityStatus.publicFacilities.cityPark ? (
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                      <Check className="w-4 h-4" /> Terbangun
                    </span>
                  ) : (
                    <button
                      disabled={player.money < FACILITY_COSTS.cityPark}
                      onClick={() => {
                        sounds.playCash();
                        onBuildFacility(selectedCity, 'cityPark', FACILITY_COSTS.cityPark);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
                    >
                      Bangun Fasilitas
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
