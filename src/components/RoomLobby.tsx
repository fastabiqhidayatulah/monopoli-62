import React, { useState } from 'react';
import { AVATAR_CHARACTERS } from '../data/avatars';
import { loginWithGoogle, logoutUser, auth } from '../firebase';
import { User as FirebaseUser } from 'firebase/auth';
import { Play, Users, Bot, Key, Sparkles, LogIn, LogOut, Check, Palette, Maximize, Minimize } from 'lucide-react';

interface RoomLobbyProps {
  currentUser: FirebaseUser | null;
  onStartSinglePlayer: (playerName: string, avatarId: string, botCount: number) => void;
  onCreateMultiplayerRoom: (roomName: string, avatarId: string, maxPlayers: number) => void;
  onJoinMultiplayerRoom: (roomCode: string, avatarId: string) => void;
  isLoadingRoom: boolean;
  onOpenCustomizer?: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

export const RoomLobby: React.FC<RoomLobbyProps> = ({
  currentUser,
  onStartSinglePlayer,
  onCreateMultiplayerRoom,
  onJoinMultiplayerRoom,
  isLoadingRoom,
  onOpenCustomizer,
  isFullscreen,
  onToggleFullscreen,
}) => {
  const [mode, setMode] = useState<'single' | 'multiplayer'>('single');
  const [playerName, setPlayerName] = useState<string>(currentUser?.displayName || 'Warga Santuy');
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>('ojol');
  const [botCount, setBotCount] = useState<number>(3);
  const [roomCodeInput, setRoomCodeInput] = useState<string>('');
  const [roomNameInput, setRoomNameInput] = useState<string>('Room Mabar Senopati');
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  const handleGoogleLogin = async () => {
    try {
      setIsLoggingIn(true);
      const user = await loginWithGoogle();
      if (user?.displayName) {
        setPlayerName(user.displayName);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-900 via-red-950 to-slate-950 p-4 flex items-center justify-center text-slate-100">
      {/* Background Decor */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px]" />

      <div className="w-full max-w-xl bg-slate-900/90 backdrop-blur-xl border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative z-10 animate-in fade-in zoom-in-95 duration-300">
        {/* Fullscreen Button */}
        {onToggleFullscreen && (
          <button
            onClick={onToggleFullscreen}
            title={isFullscreen ? 'Keluar Layar Penuh' : 'Mode Layar Penuh (Full Screen)'}
            className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-amber-300 cursor-pointer transition-all flex items-center gap-1.5 border border-amber-500/30 shadow-md text-xs font-bold"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            <span className="hidden sm:inline">{isFullscreen ? 'Normal' : 'Layar Penuh'}</span>
          </button>
        )}

        {/* Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-600/90 text-white rounded-full text-xs font-black uppercase tracking-wider shadow-sm">
            <span>🇲🇨</span>
            <span>Game Papan Monopoli Warga +62</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-amber-400 tracking-tight">
            JUARA NUSANTARA
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Taklukkan kota-kota Indonesia, kelola risiko banjir & razia, dan jadilah konglomerat terkaya!
          </p>
        </div>

        {/* Auth status bar */}
        <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {currentUser?.photoURL ? (
              <img src={currentUser.photoURL} alt="User" className="w-8 h-8 rounded-full border border-amber-400" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                👤
              </div>
            )}
            <div>
              <div className="text-xs font-bold text-white">
                {currentUser?.displayName || 'Tamu Anonim'}
              </div>
              <div className="text-[10px] text-slate-400">
                {currentUser?.email ? currentUser.email : 'Login Google untuk sinkronisasi room online'}
              </div>
            </div>
          </div>

          {currentUser ? (
            <button
              onClick={() => logoutUser()}
              className="px-2.5 py-1 text-xs text-rose-400 hover:text-rose-300 font-semibold cursor-pointer flex items-center gap-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          ) : (
            <button
              disabled={isLoggingIn}
              onClick={handleGoogleLogin}
              className="px-3 py-1.5 bg-white text-slate-800 hover:bg-slate-100 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{isLoggingIn ? 'Masuk...' : 'Google Login'}</span>
            </button>
          )}
        </div>

        {/* Mode Selector */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-2xl border border-slate-800">
          <button
            onClick={() => setMode('single')}
            className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              mode === 'single'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>Latihan vs Bot AI</span>
          </button>

          <button
            onClick={() => setMode('multiplayer')}
            className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              mode === 'multiplayer'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Multiplayer Real-time</span>
          </button>
        </div>

        {/* Player Name Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300">Nama Pemain:</label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            maxLength={25}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-hidden focus:border-amber-400"
            placeholder="Masukkan nama alias..."
          />
        </div>

        {/* Avatar Selection */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300">Pilih Karakter Warga:</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {AVATAR_CHARACTERS.slice(0, 4).map((char) => {
              const isSelected = selectedAvatarId === char.id;
              return (
                <div
                  key={char.id}
                  onClick={() => setSelectedAvatarId(char.id)}
                  className={`p-2.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center text-center ${
                    isSelected
                      ? 'border-amber-400 bg-amber-500/20 shadow-md'
                      : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
                  }`}
                >
                  <span className="text-3xl mb-1">{char.avatarIcon}</span>
                  <span className="text-xs font-bold text-white truncate max-w-[100px]">{char.name}</span>
                  <span className="text-[9px] text-amber-300">{char.role}</span>
                </div>
              );
            })}
          </div>

          {onOpenCustomizer && (
            <button
              onClick={onOpenCustomizer}
              className="w-full py-2.5 px-3 bg-gradient-to-r from-orange-600/30 to-amber-600/30 hover:from-orange-600/50 hover:to-amber-600/50 border border-amber-500/40 rounded-xl text-xs font-bold text-amber-300 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-98"
            >
              <Palette className="w-4 h-4 text-amber-400" />
              <span>Kustomisasi Detail Avatar (Kulit, Rambut, Busana & Aksesoris)</span>
            </button>
          )}
        </div>

        {/* Single Player Configuration */}
        {mode === 'single' ? (
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-2">
                Jumlah Lawan Bot AI:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((num) => (
                  <button
                    key={num}
                    onClick={() => setBotCount(num)}
                    className={`py-2 rounded-xl text-xs font-bold cursor-pointer border transition-all ${
                      botCount === num
                        ? 'bg-amber-500/30 border-amber-400 text-amber-300'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                    }`}
                  >
                    {num} Lawan Bot
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => onStartSinglePlayer(playerName, selectedAvatarId, botCount)}
              className="w-full py-4 bg-gradient-to-r from-red-600 via-amber-600 to-yellow-600 hover:from-red-500 hover:to-yellow-500 text-white font-black rounded-2xl shadow-xl text-base transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>Mulai Petualangan Monopoli</span>
            </button>
          </div>
        ) : (
          /* Multiplayer Room Options */
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Create Room */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                <h3 className="text-xs font-black text-amber-400 uppercase">Buat Room Baru</h3>
                <input
                  type="text"
                  value={roomNameInput}
                  onChange={(e) => setRoomNameInput(e.target.value)}
                  placeholder="Nama Room..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
                <button
                  disabled={isLoadingRoom}
                  onClick={() => onCreateMultiplayerRoom(roomNameInput, selectedAvatarId, 4)}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                >
                  <Users className="w-4 h-4" />
                  <span>{isLoadingRoom ? 'Membuat...' : 'Bikin Room Baru'}</span>
                </button>
              </div>

              {/* Join Room */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                <h3 className="text-xs font-black text-blue-400 uppercase">Gabung Room Kode</h3>
                <input
                  type="text"
                  value={roomCodeInput}
                  onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                  placeholder="Kode (misal: NUSANT)"
                  maxLength={6}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white uppercase font-mono tracking-wider"
                />
                <button
                  disabled={isLoadingRoom || !roomCodeInput}
                  onClick={() => onJoinMultiplayerRoom(roomCodeInput, selectedAvatarId)}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <Key className="w-4 h-4" />
                  <span>{isLoadingRoom ? 'Menghubungkan...' : 'Gabung Room'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
