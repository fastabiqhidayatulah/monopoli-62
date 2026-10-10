import React from 'react';
import { AvatarCustomization } from '../types/game';

interface AvatarRendererProps {
  customization?: AvatarCustomization;
  fallbackIcon?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const DEFAULT_AVATAR_CUSTOMIZATION: AvatarCustomization = {
  baseCharacterId: 'ojol',
  skinTone: '#fed7aa', // Kuning langsat / Sawo cerah
  hairStyle: 'helm_ojol',
  hairColor: '#1e1b4b',
  clothing: 'jaket_ojol',
  clothingColor: '#16a34a',
  accessory: 'kacamata_hitam',
};

export const AvatarRenderer: React.FC<AvatarRendererProps> = ({
  customization = DEFAULT_AVATAR_CUSTOMIZATION,
  fallbackIcon = '🛵',
  size = 'md',
  className = '',
}) => {
  const sizeMap = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-11 h-11',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  const { skinTone, hairStyle, hairColor, clothing, clothingColor, accessory } = customization;

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full overflow-hidden bg-slate-900 border-2 border-amber-300 shadow-sm ${sizeMap[size]} ${className}`}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Background gradient halo */}
        <defs>
          <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fef08a" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0.1" />
          </radialGradient>
        </defs>
        <rect width="100" height="100" fill="url(#bgGlow)" />

        {/* Clothing / Torso (bottom) */}
        <g id="clothing">
          {clothing === 'jaket_ojol' && (
            <>
              {/* Green Ojol Jacket */}
              <path d="M 20 85 Q 50 72 80 85 L 88 100 L 12 100 Z" fill={clothingColor || '#16a34a'} />
              {/* Black inner collar */}
              <path d="M 40 76 L 50 92 L 60 76 Z" fill="#0f172a" />
              {/* Reflective silver stripes */}
              <path d="M 24 87 L 76 87" stroke="#e2e8f0" strokeWidth="3" strokeDasharray="6 3" />
            </>
          )}

          {clothing === 'daster_batik' && (
            <>
              <path d="M 20 85 Q 50 75 80 85 L 90 100 L 10 100 Z" fill={clothingColor || '#be185d'} />
              {/* Batik dots pattern */}
              <circle cx="35" cy="90" r="2" fill="#fdf2f8" opacity="0.8" />
              <circle cx="65" cy="90" r="2" fill="#fdf2f8" opacity="0.8" />
              <circle cx="50" cy="95" r="2.5" fill="#fdf2f8" opacity="0.8" />
              <path d="M 45 77 Q 50 83 55 77 Z" fill="#9d174d" />
            </>
          )}

          {clothing === 'rompi_proyek' && (
            <>
              {/* Safety Vest */}
              <path d="M 20 85 Q 50 72 80 85 L 90 100 L 10 100 Z" fill={clothingColor || '#ea580c'} />
              {/* Neon reflective tape */}
              <rect x="30" y="80" width="8" height="20" fill="#facc15" />
              <rect x="62" y="80" width="8" height="20" fill="#facc15" />
              <line x1="20" y1="92" x2="80" y2="92" stroke="#facc15" strokeWidth="4" />
            </>
          )}

          {clothing === 'blazer_jaksel' && (
            <>
              {/* Dark smart blazer */}
              <path d="M 18 84 Q 50 72 82 84 L 92 100 L 8 100 Z" fill={clothingColor || '#1e293b'} />
              {/* Inner white shirt */}
              <polygon points="50,75 42,90 58,90" fill="#ffffff" />
              {/* Tie */}
              <polygon points="50,82 48,97 50,100 52,97" fill="#dc2626" />
            </>
          )}

          {clothing === 'batik_formal' && (
            <>
              {/* Batik Kawung print shirt */}
              <path d="M 20 84 Q 50 72 80 84 L 90 100 L 10 100 Z" fill={clothingColor || '#78350f'} />
              <circle cx="50" cy="88" r="4" fill="#fbbf24" opacity="0.6" />
              <circle cx="34" cy="92" r="3" fill="#fbbf24" opacity="0.6" />
              <circle cx="66" cy="92" r="3" fill="#fbbf24" opacity="0.6" />
            </>
          )}

          {clothing === 'kaos_santuy' && (
            <>
              <path d="M 22 84 Q 50 74 78 84 L 88 100 L 12 100 Z" fill={clothingColor || '#3b82f6'} />
              {/* Crew neck */}
              <path d="M 42 75 Q 50 82 58 75 Z" fill="#1e293b" />
            </>
          )}
        </g>

        {/* Neck */}
        <rect x="44" y="65" width="12" height="15" fill={skinTone} rx="2" />

        {/* Head / Face */}
        <ellipse cx="50" cy="50" rx="23" ry="26" fill={skinTone} />

        {/* Ears */}
        <circle cx="26" cy="51" r="5" fill={skinTone} />
        <circle cx="74" cy="51" r="5" fill={skinTone} />

        {/* Eyes */}
        <ellipse cx="42" cy="49" rx="3" ry="3.5" fill="#0f172a" />
        <ellipse cx="58" cy="49" rx="3" ry="3.5" fill="#0f172a" />
        {/* Eye highlights */}
        <circle cx="43" cy="48" r="1" fill="#ffffff" />
        <circle cx="59" cy="48" r="1" fill="#ffffff" />

        {/* Eyebrows */}
        <path d="M 37 43 Q 42 41 46 43" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M 54 43 Q 58 41 63 43" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" fill="none" />

        {/* Nose */}
        <path d="M 50 49 Q 52 54 49 55" stroke="#92400e" strokeWidth="1.5" strokeLinecap="round" fill="none" />

        {/* Friendly Smile */}
        <path d="M 44 60 Q 50 66 56 60" stroke="#991b1b" strokeWidth="2.2" strokeLinecap="round" fill="none" />

        {/* Blush cheeks */}
        <circle cx="36" cy="56" r="3.5" fill="#f43f5e" opacity="0.25" />
        <circle cx="64" cy="56" r="3.5" fill="#f43f5e" opacity="0.25" />

        {/* Hair Styles & Headgear */}
        <g id="hair">
          {hairStyle === 'pompadour' && (
            <path
              d="M 28 44 C 25 32 35 22 50 20 C 65 18 76 28 72 44 C 70 34 60 28 50 30 C 40 32 32 38 28 44 Z"
              fill={hairColor}
            />
          )}

          {hairStyle === 'kuncir' && (
            <>
              {/* Bun / Sanggul */}
              <circle cx="50" cy="19" r="10" fill={hairColor} />
              <path
                d="M 27 46 C 26 33 34 26 50 26 C 66 26 74 33 73 46 C 68 37 60 32 50 32 C 40 32 32 37 27 46 Z"
                fill={hairColor}
              />
              <line x1="42" y1="18" x2="58" y2="18" stroke="#fbbf24" strokeWidth="2" />
            </>
          )}

          {hairStyle === 'gondrong' && (
            <path
              d="M 25 58 C 22 45 25 24 50 22 C 75 24 78 45 75 58 C 72 42 70 32 50 32 C 30 32 28 42 25 58 Z"
              fill={hairColor}
            />
          )}

          {hairStyle === 'cepak' && (
            <path
              d="M 29 42 C 32 30 40 25 50 25 C 60 25 68 30 71 42 C 67 36 60 33 50 33 C 40 33 33 36 29 42 Z"
              fill={hairColor}
            />
          )}

          {hairStyle === 'hijab' && (
            <>
              {/* Modern draped hijab */}
              <path
                d="M 22 55 C 20 30 32 18 50 18 C 68 18 80 30 78 55 C 78 72 68 84 50 84 C 32 84 22 72 22 55 Z"
                fill={hairColor || '#0284c7'}
              />
              {/* Inner face cutout */}
              <ellipse cx="50" cy="51" rx="19" ry="22" fill={skinTone} />
              {/* Re-draw face features inside hijab */}
              <ellipse cx="43" cy="50" rx="2.5" ry="3" fill="#0f172a" />
              <ellipse cx="57" cy="50" rx="2.5" ry="3" fill="#0f172a" />
              <path d="M 45 61 Q 50 66 55 61" stroke="#991b1b" strokeWidth="2" strokeLinecap="round" fill="none" />
            </>
          )}

          {hairStyle === 'helm_ojol' && (
            <>
              {/* Green Ojol Motorcycle Helmet */}
              <path d="M 23 48 C 21 24 33 16 50 16 C 67 16 79 24 77 48 L 74 52 C 65 38 35 38 26 52 Z" fill="#15803d" />
              {/* Helmet visor / kaca helm */}
              <path d="M 27 46 C 36 36 64 36 73 46 C 71 52 65 54 50 54 C 35 54 29 52 27 46 Z" fill="#0f172a" opacity="0.65" />
              {/* Yellow safety logo on helmet */}
              <polygon points="50,22 46,30 54,30" fill="#facc15" />
            </>
          )}
        </g>

        {/* Accessories Layer */}
        <g id="accessory">
          {accessory === 'kacamata_hitam' && (
            <>
              {/* Cool Aviator Sunglasses */}
              <rect x="34" y="44" width="13" height="10" rx="3" fill="#0f172a" stroke="#d97706" strokeWidth="1.5" />
              <rect x="53" y="44" width="13" height="10" rx="3" fill="#0f172a" stroke="#d97706" strokeWidth="1.5" />
              <line x1="47" y1="48" x2="53" y2="48" stroke="#d97706" strokeWidth="2" />
              <line x1="28" y1="46" x2="34" y2="47" stroke="#d97706" strokeWidth="1.5" />
              <line x1="66" y1="47" x2="72" y2="46" stroke="#d97706" strokeWidth="1.5" />
            </>
          )}

          {accessory === 'peci_songkok' && (
            <path d="M 28 35 L 31 22 L 69 22 L 72 35 Z" fill="#0f172a" stroke="#334155" strokeWidth="1" />
          )}

          {accessory === 'blangkon' && (
            <>
              <path d="M 26 38 C 30 24 45 22 50 22 C 55 22 70 24 74 38 Z" fill="#78350f" />
              {/* Batik pattern on blangkon */}
              <path d="M 26 38 C 38 34 62 34 74 38 L 74 41 C 62 37 38 37 26 41 Z" fill="#b45309" />
              {/* Mondolan (bulatan di belakang) */}
              <circle cx="76" cy="40" r="4" fill="#78350f" />
            </>
          )}

          {accessory === 'masker' && (
            <path d="M 33 55 Q 50 50 67 55 L 63 69 Q 50 74 37 69 Z" fill="#0284c7" stroke="#38bdf8" strokeWidth="1" />
          )}

          {accessory === 'kalung_emas' && (
            <path d="M 38 73 Q 50 86 62 73" stroke="#f59e0b" strokeWidth="3" fill="none" strokeDasharray="3 2" />
          )}

          {accessory === 'walkie_talkie' && (
            <>
              {/* Intel Walkie Talkie on shoulder */}
              <rect x="74" y="78" width="10" height="16" rx="2" fill="#1e293b" />
              <line x1="77" y1="78" x2="77" y2="70" stroke="#475569" strokeWidth="2" />
              <circle cx="79" cy="85" r="2" fill="#ef4444" />
            </>
          )}
        </g>
      </svg>
    </div>
  );
};
