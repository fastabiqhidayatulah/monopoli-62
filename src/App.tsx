import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Player,
  BoardSquare,
  CityGroup,
  CityStatus,
  Commodity,
  GameLog,
  NaturalDisasterEvent,
  GameEventCard,
  BlackMarketItem,
  AvatarCustomization,
  AuctionSession,
  AuctionBid,
} from './types/game';
import { INITIAL_BOARD, INITIAL_CITY_STATUS } from './data/boardData';
import { INITIAL_COMMODITIES } from './data/commodities';
import { CHANCE_CARDS, COMMUNITY_CHEST_CARDS, DISASTER_EVENTS } from './data/chanceCards';
import { AVATAR_CHARACTERS } from './data/avatars';
import { sounds } from './utils/audio';
import { formatRupiah, calculateRent } from './utils/format';
import { makeAiTurnDecision, makeAiPoliceDecision } from './utils/aiLogic';

import { GameBoard } from './components/GameBoard';
import { DiceController } from './components/DiceController';
import { PlayerDashboard } from './components/PlayerDashboard';
import { MarketPanel } from './components/MarketPanel';
import { HazardCityPanel } from './components/HazardCityPanel';
import { BlackMarketModal } from './components/BlackMarketModal';
import { PoliceModal } from './components/PoliceModal';
import { SquareActionModal } from './components/SquareActionModal';
import { TradeModal } from './components/TradeModal';
import { CosmeticsShopModal } from './components/CosmeticsShopModal';
import { ChatPanel } from './components/ChatPanel';
import { GameOverModal } from './components/GameOverModal';
import { DisasterPopup } from './components/DisasterPopup';
import { RoomLobby } from './components/RoomLobby';
import { AvatarCustomizerModal } from './components/AvatarCustomizerModal';
import { PropertyAuctionModal } from './components/PropertyAuctionModal';
import { DEFAULT_AVATAR_CUSTOMIZATION } from './components/AvatarRenderer';

import { auth, db, handleFirestoreError, OperationType, testConnection } from './firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, setDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { Volume2, VolumeX, MessageSquare, Trophy, AlertTriangle, ShieldCheck, Palette, Gavel, Maximize, Minimize } from 'lucide-react';

const PLAYER_COLORS = ['#dc2626', '#2563eb', '#16a34a', '#d97706'];

export default function App() {
  // Auth state
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [gameStateMode, setGameStateMode] = useState<'LOBBY' | 'PLAYING'>('LOBBY');
  const [multiplayerRoomCode, setMultiplayerRoomCode] = useState<string | null>(null);
  const [isLoadingRoom, setIsLoadingRoom] = useState<boolean>(false);

  // Audio mute
  const [isSoundMuted, setIsSoundMuted] = useState<boolean>(false);

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [mobileActiveTab, setMobileActiveTab] = useState<'BOARD' | 'DASHBOARD'>('BOARD');

  useEffect(() => {
    const handleFullscreenChange = () => {
      const doc = document as any;
      const isFull = !!(
        doc.fullscreenElement ||
        doc.webkitFullscreenElement ||
        doc.mozFullScreenElement ||
        doc.msFullscreenElement
      );
      setIsFullscreen(isFull);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement)?.isContentEditable
      ) {
        return;
      }
      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const toggleFullscreen = () => {
    const doc = document as any;
    const docEl = document.documentElement as any;

    const isCurrentlyFullscreen = !!(
      doc.fullscreenElement ||
      doc.webkitFullscreenElement ||
      doc.mozFullScreenElement ||
      doc.msFullscreenElement
    );

    if (!isCurrentlyFullscreen) {
      const requestMethod =
        docEl.requestFullscreen ||
        docEl.webkitRequestFullscreen ||
        docEl.mozRequestFullScreen ||
        docEl.msRequestFullscreen;

      if (requestMethod) {
        requestMethod.call(docEl).catch(() => {
          setIsFullscreen((prev) => !prev);
        });
      } else {
        setIsFullscreen((prev) => !prev);
      }
    } else {
      const exitMethod =
        doc.exitFullscreen ||
        doc.webkitExitFullscreen ||
        doc.mozCancelFullScreen ||
        doc.msExitFullscreen;

      if (exitMethod) {
        exitMethod.call(doc).catch(() => {
          setIsFullscreen(false);
        });
      } else {
        setIsFullscreen(false);
      }
    }
  };

  // Game Engine State
  const [board, setBoard] = useState<BoardSquare[]>(INITIAL_BOARD);
  const [cityStatuses, setCityStatuses] = useState<Record<CityGroup, CityStatus>>(INITIAL_CITY_STATUS);
  const [commodities, setCommodities] = useState<Commodity[]>(INITIAL_COMMODITIES);
  const [players, setPlayers] = useState<Player[]>([]);
  const [activePlayerIndex, setActivePlayerIndex] = useState<number>(0);
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [inflationRate, setInflationRate] = useState<number>(1.0);
  const [dice, setDice] = useState<[number, number]>([1, 1]);
  const [isDiceRolled, setIsDiceRolled] = useState<boolean>(false);
  const [canEndTurn, setCanEndTurn] = useState<boolean>(false);

  // Player Step-by-Step Movement Animation State
  const [isMovingPlayer, setIsMovingPlayer] = useState<boolean>(false);
  const [movingPlayerId, setMovingPlayerId] = useState<string | null>(null);
  const [targetSquareId, setTargetSquareId] = useState<number | null>(null);
  const [stepProgress, setStepProgress] = useState<{ current: number; total: number } | null>(null);
  const movementIntervalRef = useRef<any>(null);

  // Clear movement interval on unmount
  useEffect(() => {
    return () => {
      if (movementIntervalRef.current) {
        clearInterval(movementIntervalRef.current);
      }
    };
  }, []);

  // Disasters & Cards
  const [activeDisaster, setActiveDisaster] = useState<NaturalDisasterEvent | null>(null);
  const [activePopupDisaster, setActivePopupDisaster] = useState<NaturalDisasterEvent | null>(null);
  const [activeCardEvent, setActiveCardEvent] = useState<GameEventCard | null>(null);
  const [isEventPopupOpen, setIsEventPopupOpen] = useState<boolean>(false);

  // Activity Logs
  const [logs, setLogs] = useState<GameLog[]>([
    {
      id: 'log_0',
      timestamp: '00:00',
      text: 'Selamat datang di JUARA NUSANTARA: Monopoli Warga +62!',
      type: 'INFO',
    },
  ]);

  // Modal Dialogs
  const [isMarketOpen, setIsMarketOpen] = useState<boolean>(false);
  const [isCityHazardOpen, setIsCityHazardOpen] = useState<boolean>(false);
  const [isBlackMarketOpen, setIsBlackMarketOpen] = useState<boolean>(false);
  const [isCosmeticsOpen, setIsCosmeticsOpen] = useState<boolean>(false);
  const [isTradeOpen, setIsTradeOpen] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [selectedSquare, setSelectedSquare] = useState<BoardSquare | null>(null);
  const [isSquareModalOpen, setIsSquareModalOpen] = useState<boolean>(false);
  const [isPoliceModalOpen, setIsPoliceModalOpen] = useState<boolean>(false);

  // Cosmetics & Quests
  const [userCoins, setUserCoins] = useState<number>(100);
  const [unlockedSkins, setUnlockedSkins] = useState<string[]>(['ojol', 'warung', 'kontraktor', 'selebgram']);
  const [activeAvatarSkin, setActiveAvatarSkin] = useState<string>('ojol');
  const [hasClaimedDaily, setHasClaimedDaily] = useState<boolean>(false);

  // Avatar Customization & Auction State
  const [isAvatarCustomizerOpen, setIsAvatarCustomizerOpen] = useState<boolean>(false);
  const [currentAuction, setCurrentAuction] = useState<AuctionSession | null>(null);
  const [isAuctionModalOpen, setIsAuctionModalOpen] = useState<boolean>(false);
  const [customAvatar, setCustomAvatar] = useState<AvatarCustomization>(() => {
    try {
      const saved = localStorage.getItem('nusantara_avatar_custom');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // Ignored
    }
    return DEFAULT_AVATAR_CUSTOMIZATION;
  });

  // Game Over
  const [winner, setWinner] = useState<Player | null>(null);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);

  // Ref to avoid stale closures in timeouts
  const playersRef = useRef(players);
  playersRef.current = players;
  const boardRef = useRef(board);
  boardRef.current = board;

  // Initialize Firebase test & auth listener
  useEffect(() => {
    testConnection();
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsub();
  }, []);

  const addLog = useCallback((text: string, type: GameLog['type'] = 'INFO') => {
    const time = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    setLogs((prev) => [...prev, { id: 'log_' + Date.now() + Math.random(), timestamp: time, text, type }]);
  }, []);

  // Update Net Worth of all players
  const recalculateNetWorth = useCallback(() => {
    setPlayers((prev) =>
      prev.map((player) => {
        let propertyValue = 0;
        boardRef.current.forEach((sq) => {
          if (sq.ownerId === player.id) {
            propertyValue += sq.isMortgaged ? sq.price * 0.5 : sq.price + (sq.buildingLevel * (sq.housePrice || 500000));
          }
        });

        let commodityValue = 0;
        Object.entries(player.commodities).forEach(([commId, qty]) => {
          const c = INITIAL_COMMODITIES.find((x) => x.id === commId);
          if (c) commodityValue += c.currentPrice * qty;
        });

        return {
          ...player,
          netWorth: player.money + propertyValue + commodityValue,
        };
      })
    );
  }, []);

  // Dynamic Market ticker: changes commodity prices every 4.5 seconds
  useEffect(() => {
    if (gameStateMode !== 'PLAYING') return;

    const interval = setInterval(() => {
      setCommodities((prev) =>
        prev.map((item) => {
          const delta = (Math.random() - 0.48) * item.volatility;
          const newPrice = Math.max(1000, Math.round(item.currentPrice * (1 + delta)));
          const changePercent = ((newPrice - item.basePrice) / item.basePrice) * 100;
          const newHistory = [...item.priceHistory.slice(-8), newPrice];

          return {
            ...item,
            currentPrice: newPrice,
            changePercent,
            priceHistory: newHistory,
          };
        })
      );
    }, 4500);

    return () => clearInterval(interval);
  }, [gameStateMode]);

  // Check Game Over
  useEffect(() => {
    if (gameStateMode !== 'PLAYING') return;

    const activeLivingPlayers = players.filter((p) => !p.isBankrupt);
    if (activeLivingPlayers.length === 1 && players.length > 1) {
      setWinner(activeLivingPlayers[0]);
      setIsGameOver(true);
      addLog(`Permainan selesai! ${activeLivingPlayers[0].name} dinobatkan sebagai JUARA NUSANTARA!`, 'MONEY');
    }
  }, [players, gameStateMode, addLog]);

  // Start Single Player against Bots
  const handleStartSinglePlayer = (humanName: string, avatarId: string, botCount: number) => {
    const newPlayers: Player[] = [
      {
        id: 'p_human',
        name: humanName || 'Warga Santuy',
        avatarId,
        customAvatar: customAvatar,
        isAi: false,
        color: PLAYER_COLORS[0],
        money: 10000000,
        netWorth: 10000000,
        position: 0,
        inJail: false,
        jailTurns: 0,
        reputation: 60,
        legalRisk: 10,
        blackMarketHeat: 0,
        hasGetOutOfJailCard: false,
        hasInsurance: false,
        commodities: { rice: 5, chili: 2 },
        isBankrupt: false,
        roundsSurvived: 1,
      },
    ];

    const botPersonalities: Array<Player['aiPersonality']> = ['JURAGAN', 'SPEKULAN', 'HEMAT'];
    const botNames = ['Pak Haji Juragan', 'Bang Jago Spekulan', 'Mbak Rini Hemat'];
    const botAvatars = ['kontraktor', 'sultan', 'warung'];
    const botCustomAvatars: AvatarCustomization[] = [
      {
        baseCharacterId: 'kontraktor',
        skinTone: '#fed7aa',
        hairStyle: 'cepak',
        hairColor: '#0f172a',
        clothing: 'rompi_proyek',
        clothingColor: '#ea580c',
        accessory: 'peci_songkok',
      },
      {
        baseCharacterId: 'sultan',
        skinTone: '#d97706',
        hairStyle: 'pompadour',
        hairColor: '#451a03',
        clothing: 'blazer_jaksel',
        clothingColor: '#1e293b',
        accessory: 'kacamata_hitam',
      },
      {
        baseCharacterId: 'warung',
        skinTone: '#f59e0b',
        hairStyle: 'kuncir',
        hairColor: '#0f172a',
        clothing: 'daster_batik',
        clothingColor: '#be185d',
        accessory: 'none',
      },
    ];

    for (let i = 0; i < botCount; i++) {
      newPlayers.push({
        id: `p_bot_${i + 1}`,
        name: botNames[i % botNames.length],
        avatarId: botAvatars[i % botAvatars.length],
        customAvatar: botCustomAvatars[i % botCustomAvatars.length],
        isAi: true,
        aiPersonality: botPersonalities[i % botPersonalities.length],
        color: PLAYER_COLORS[(i + 1) % PLAYER_COLORS.length],
        money: 10000000,
        netWorth: 10000000,
        position: 0,
        inJail: false,
        jailTurns: 0,
        reputation: 50,
        legalRisk: 10,
        blackMarketHeat: 0,
        hasGetOutOfJailCard: false,
        hasInsurance: false,
        commodities: { rice: 3 },
        isBankrupt: false,
        roundsSurvived: 1,
      });
    }

    setPlayers(newPlayers);
    setActivePlayerIndex(0);
    setBoard(INITIAL_BOARD);
    setCityStatuses(INITIAL_CITY_STATUS);
    setCurrentRound(1);
    setGameStateMode('PLAYING');
    sounds.playGongWin();
    addLog(`Permainan dimulai dengan ${newPlayers.length} warga nusantara!`, 'INFO');
  };

  // Create Firebase Multiplayer Room
  const handleCreateMultiplayerRoom = async (roomName: string, avatarId: string, maxPlayers: number) => {
    try {
      setIsLoadingRoom(true);
      const code = 'NUS' + Math.floor(100 + Math.random() * 900);
      const hostId = currentUser?.uid || 'host_' + Date.now();
      const hostName = currentUser?.displayName || 'Host Warga';

      const initialPlayer: Player = {
        id: hostId,
        name: hostName,
        avatarId,
        isAi: false,
        color: PLAYER_COLORS[0],
        money: 10000000,
        netWorth: 10000000,
        position: 0,
        inJail: false,
        jailTurns: 0,
        reputation: 60,
        legalRisk: 10,
        blackMarketHeat: 0,
        hasGetOutOfJailCard: false,
        hasInsurance: false,
        commodities: { rice: 5 },
        isBankrupt: false,
        roundsSurvived: 1,
      };

      const path = 'rooms';
      await setDoc(doc(db, path, code), {
        code,
        name: roomName,
        hostId,
        hostName,
        status: 'playing',
        maxPlayers,
        currentTurn: 0,
        round: 1,
        players: [initialPlayer],
        boardState: JSON.stringify(INITIAL_BOARD),
        marketState: JSON.stringify(INITIAL_COMMODITIES),
        logs: [{ id: 'init', timestamp: '00:00', text: `Room ${roomName} dibuat.`, type: 'INFO' }],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      setMultiplayerRoomCode(code);
      setPlayers([initialPlayer]);
      setGameStateMode('PLAYING');
      addLog(`Room online [${code}] berhasil dibuat.`, 'INFO');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'rooms');
    } finally {
      setIsLoadingRoom(false);
    }
  };

  // Join Firebase Multiplayer Room
  const handleJoinMultiplayerRoom = async (roomCode: string, avatarId: string) => {
    try {
      setIsLoadingRoom(true);
      const path = `rooms/${roomCode}`;
      const unsub = onSnapshot(
        doc(db, 'rooms', roomCode),
        (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            if (data.players) {
              setPlayers(data.players);
            }
            setMultiplayerRoomCode(roomCode);
            setGameStateMode('PLAYING');
          } else {
            alert('Room tidak ditemukan!');
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, path);
        }
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `rooms/${roomCode}`);
    } finally {
      setIsLoadingRoom(false);
    }
  };

  // Turn management: Roll Dice & Move
  const handleRollDice = () => {
    if (isMovingPlayer) return;
    const activePlayer = players[activePlayerIndex];
    if (!activePlayer || activePlayer.isBankrupt) return;

    // Roll two dice (1-6)
    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    const total = d1 + d2;
    setDice([d1, d2]);
    setIsDiceRolled(true);

    // If player is in jail
    if (activePlayer.inJail) {
      if (d1 === d2) {
        sounds.playCash();
        addLog(`${activePlayer.name} melempar dadu kembar (${d1}-${d2}) dan bebas dari penjara!`, 'INFO');
        setPlayers((prev) =>
          prev.map((p, idx) => (idx === activePlayerIndex ? { ...p, inJail: false, jailTurns: 0 } : p))
        );
      } else {
        const remaining = activePlayer.jailTurns - 1;
        sounds.playFail();
        if (remaining <= 0) {
          addLog(`${activePlayer.name} telah menyelesaikan masa tahanan dan bebas!`, 'INFO');
          setPlayers((prev) =>
            prev.map((p, idx) => (idx === activePlayerIndex ? { ...p, inJail: false, jailTurns: 0 } : p))
          );
        } else {
          addLog(`${activePlayer.name} gagal lempar kembar, sisa tahanan: ${remaining} ronde.`, 'CRIME');
          setPlayers((prev) =>
            prev.map((p, idx) => (idx === activePlayerIndex ? { ...p, jailTurns: remaining } : p))
          );
          setCanEndTurn(true);
          return;
        }
      }
    }

    // Step-by-step movement animation forward
    const startPos = activePlayer.position;
    const finalPos = (startPos + total) % 40;

    setIsMovingPlayer(true);
    setMovingPlayerId(activePlayer.id);
    setTargetSquareId(finalPos);
    setStepProgress({ current: 0, total });

    let currentStep = 0;

    if (movementIntervalRef.current) {
      clearInterval(movementIntervalRef.current);
    }

    movementIntervalRef.current = setInterval(() => {
      currentStep++;
      const currentPos = (startPos + currentStep) % 40;

      // Passing START check
      let salaryEarned = 0;
      if (currentPos === 0) {
        salaryEarned = 2000000;
        sounds.playCash();
        addLog(`${activePlayer.name} melewati START dan menerima gaji bulanan Rp 2.000.000!`, 'MONEY');
      } else {
        sounds.playStepHop(currentStep);
      }

      setPlayers((prev) =>
        prev.map((p, idx) =>
          idx === activePlayerIndex
            ? {
                ...p,
                position: currentPos,
                money: p.money + salaryEarned,
              }
            : p
        )
      );

      setStepProgress({ current: currentStep, total });

      // Destination reached
      if (currentStep >= total) {
        clearInterval(movementIntervalRef.current);
        movementIntervalRef.current = null;
        sounds.playLand();

        setTimeout(() => {
          setIsMovingPlayer(false);
          setMovingPlayerId(null);
          setTargetSquareId(null);
          setStepProgress(null);

          const landedSquare = boardRef.current[finalPos];
          addLog(`${activePlayer.name} melangkah ${total} petak ke [${landedSquare.name}].`, 'INFO');

          // Trigger Square Landing Actions
          handleSquareLanding(landedSquare, activePlayerIndex, total);

          // Sync room if multiplayer
          if (multiplayerRoomCode) {
            updateDoc(doc(db, 'rooms', multiplayerRoomCode), {
              players: playersRef.current,
              boardState: JSON.stringify(boardRef.current),
              updatedAt: new Date().toISOString(),
            }).catch((e) => console.error(e));
          }
        }, 320);
      }
    }, 220);
  };

  // Square Landing Resolution
  const handleSquareLanding = (square: BoardSquare, playerIdx: number, diceTotal: number) => {
    const activePlayer = playersRef.current[playerIdx];

    switch (square.type) {
      case 'PROPERTY':
      case 'TRANSPORT':
      case 'UTILITY': {
        if (!square.ownerId) {
          // Open square modal for human, or AI decides
          if (!activePlayer.isAi) {
            setSelectedSquare(square);
            setIsSquareModalOpen(true);
          } else {
            const decision = makeAiTurnDecision(activePlayer, square, boardRef.current, commodities);
            if (decision.action === 'BUY') {
              executeBuyProperty(square.id, playerIdx);
            }
          }
        } else if (square.ownerId !== activePlayer.id) {
          // Pay Rent!
          const owner = playersRef.current.find((p) => p.id === square.ownerId);
          if (owner && !square.isMortgaged && !owner.inJail) {
            const rent = calculateRent(square, boardRef.current, cityStatuses, diceTotal, inflationRate);
            sounds.playCash();
            addLog(`${activePlayer.name} membayar sewa ${formatRupiah(rent)} kepada ${owner.name} di ${square.name}.`, 'MONEY');

            setPlayers((prev) =>
              prev.map((p) => {
                if (p.id === activePlayer.id) {
                  const newMoney = p.money - rent;
                  return { ...p, money: newMoney, isBankrupt: newMoney <= 0 };
                }
                if (p.id === owner.id) {
                  return { ...p, money: p.money + rent };
                }
                return p;
              })
            );
          }
        }
        setCanEndTurn(true);
        break;
      }

      case 'TAX': {
        sounds.playFail();
        const taxAmount = square.baseRent;
        addLog(`${activePlayer.name} membayar pajak SPT / PBB sebesar ${formatRupiah(taxAmount)}.`, 'MONEY');
        setPlayers((prev) =>
          prev.map((p, idx) =>
            idx === playerIdx ? { ...p, money: p.money - taxAmount, isBankrupt: p.money - taxAmount <= 0 } : p
          )
        );
        setCanEndTurn(true);
        break;
      }

      case 'POLICE_RAID': {
        sounds.playPoliceSiren();
        if (!activePlayer.isAi) {
          setIsPoliceModalOpen(true);
        } else {
          const choice = makeAiPoliceDecision(activePlayer);
          if (choice === 'PAY_FINE') {
            handlePayOfficialFine();
          } else {
            handleAttemptBribe();
          }
        }
        break;
      }

      case 'GO_TO_JAIL': {
        sounds.playPoliceSiren();
        addLog(`${activePlayer.name} terkena OTT KPK / Sidak Polisi! Langsung dijebloskan ke Penjara Polda!`, 'CRIME');
        setPlayers((prev) =>
          prev.map((p, idx) =>
            idx === playerIdx
              ? {
                  ...p,
                  position: 10,
                  inJail: true,
                  jailTurns: 3,
                  legalRisk: Math.min(100, p.legalRisk + 25),
                }
              : p
          )
        );
        setCanEndTurn(true);
        break;
      }

      case 'CHANCE': {
        const randomCard = CHANCE_CARDS[Math.floor(Math.random() * CHANCE_CARDS.length)];
        setActiveCardEvent(randomCard);
        setActivePopupDisaster(null);
        setIsEventPopupOpen(true);
        applyEventCard(randomCard, playerIdx);
        setCanEndTurn(true);
        break;
      }

      case 'COMMUNITY_CHEST': {
        const randomCard = COMMUNITY_CHEST_CARDS[Math.floor(Math.random() * COMMUNITY_CHEST_CARDS.length)];
        setActiveCardEvent(randomCard);
        setActivePopupDisaster(null);
        setIsEventPopupOpen(true);
        applyEventCard(randomCard, playerIdx);
        setCanEndTurn(true);
        break;
      }

      case 'BLACK_MARKET': {
        if (!activePlayer.isAi) {
          setIsBlackMarketOpen(true);
        }
        setCanEndTurn(true);
        break;
      }

      default:
        setCanEndTurn(true);
        break;
    }

    recalculateNetWorth();
  };

  // Event Card Execution
  const applyEventCard = (card: GameEventCard, playerIdx: number) => {
    addLog(`[${card.title}] ${card.description}`, 'ALERT');
    if (card.amount) {
      if (card.amount > 0) sounds.playCash();
      else sounds.playFail();
      setPlayers((prev) =>
        prev.map((p, idx) => (idx === playerIdx ? { ...p, money: p.money + (card.amount || 0) } : p))
      );
    }
    if (card.type === 'JAIL') {
      sounds.playPoliceSiren();
      setPlayers((prev) =>
        prev.map((p, idx) => (idx === playerIdx ? { ...p, position: 10, inJail: true, jailTurns: 3 } : p))
      );
    }
    if (card.type === 'MOVE' && card.targetPosition !== undefined) {
      setPlayers((prev) =>
        prev.map((p, idx) => (idx === playerIdx ? { ...p, position: card.targetPosition! } : p))
      );
    }
    if (card.type === 'REPUTATION') {
      setPlayers((prev) =>
        prev.map((p, idx) => (idx === playerIdx ? { ...p, hasGetOutOfJailCard: true, reputation: p.reputation + 15 } : p))
      );
    }
  };

  // Police Modal Handlers
  const handlePayOfficialFine = () => {
    const fine = 500000;
    sounds.playCash();
    const activePlayer = players[activePlayerIndex];
    addLog(`${activePlayer.name} membayar tilang resmi BRI sebesar ${formatRupiah(fine)}.`, 'INFO');
    setPlayers((prev) =>
      prev.map((p, idx) =>
        idx === activePlayerIndex ? { ...p, money: p.money - fine, legalRisk: Math.max(0, p.legalRisk - 10) } : p
      )
    );
    setIsPoliceModalOpen(false);
    setCanEndTurn(true);
  };

  const handleGoToCourt = () => {
    const courtCost = 200000;
    sounds.playCash();
    const activePlayer = players[activePlayerIndex];
    addLog(`${activePlayer.name} menjalani sidang tipiring pengadilan negeri (Denda ${formatRupiah(courtCost)}).`, 'INFO');
    setPlayers((prev) =>
      prev.map((p, idx) => (idx === activePlayerIndex ? { ...p, money: p.money - courtCost } : p))
    );
    setIsPoliceModalOpen(false);
    setCanEndTurn(true);
  };

  const handleAttemptBribe = () => {
    const bribeAmount = 150000;
    const activePlayer = players[activePlayerIndex];
    // Probability based on legal risk and reputation
    const successProb = 0.55 + (activePlayer.reputation > 70 ? 0.15 : 0) - (activePlayer.legalRisk > 40 ? 0.2 : 0);
    const isSuccess = Math.random() < successProb;

    if (isSuccess) {
      sounds.playCash();
      addLog(`${activePlayer.name} berhasil menyelipkan uang rokok dan lolos razia!`, 'CRIME');
      setPlayers((prev) =>
        prev.map((p, idx) =>
          idx === activePlayerIndex ? { ...p, money: p.money - bribeAmount, legalRisk: p.legalRisk + 5 } : p
        )
      );
    } else {
      sounds.playPoliceSiren();
      addLog(`SUAP GAGAL! ${activePlayer.name} kena OTT petugas dan dijebloskan ke sel Polda!`, 'CRIME');
      setPlayers((prev) =>
        prev.map((p, idx) =>
          idx === activePlayerIndex
            ? {
                ...p,
                money: p.money - bribeAmount * 2,
                position: 10,
                inJail: true,
                jailTurns: 3,
                legalRisk: p.legalRisk + 30,
              }
            : p
        )
      );
    }
    setIsPoliceModalOpen(false);
    setCanEndTurn(true);
  };

  const handlePayBail = () => {
    const bail = 1000000;
    sounds.playCash();
    const activePlayer = players[activePlayerIndex];
    addLog(`${activePlayer.name} membayar jaminan bebas Rp 1.000.000 dan keluar dari tahanan.`, 'INFO');
    setPlayers((prev) =>
      prev.map((p, idx) => (idx === activePlayerIndex ? { ...p, money: p.money - bail, inJail: false, jailTurns: 0 } : p))
    );
    setIsPoliceModalOpen(false);
    setCanEndTurn(true);
  };

  const handleUseGetOutOfJailCard = () => {
    sounds.playCash();
    const activePlayer = players[activePlayerIndex];
    addLog(`${activePlayer.name} memakai surat sakti orang dalem dan bebas tanpa biaya!`, 'INFO');
    setPlayers((prev) =>
      prev.map((p, idx) =>
        idx === activePlayerIndex ? { ...p, hasGetOutOfJailCard: false, inJail: false, jailTurns: 0 } : p
      )
    );
    setIsPoliceModalOpen(false);
    setCanEndTurn(true);
  };

  const handleTryRollDouble = () => {
    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    setDice([d1, d2]);
    const activePlayer = players[activePlayerIndex];

    if (d1 === d2) {
      sounds.playCash();
      addLog(`${activePlayer.name} melempar dadu kembar (${d1}-${d2}) dan bebas dari penjara!`, 'INFO');
      setPlayers((prev) =>
        prev.map((p, idx) => (idx === activePlayerIndex ? { ...p, inJail: false, jailTurns: 0 } : p))
      );
    } else {
      sounds.playFail();
      addLog(`${activePlayer.name} gagal melempar dadu kembar (${d1}-${d2}). Masih ditahan!`, 'CRIME');
    }
    setIsPoliceModalOpen(false);
    setCanEndTurn(true);
  };

  // Property Actions: Buy, Upgrade, Mortgage, Unmortgage
  const executeBuyProperty = (squareId: number, playerIdx: number) => {
    const sq = board[squareId];
    const buyer = players[playerIdx];
    if (!sq || buyer.money < sq.price) return;

    sounds.playCash();
    addLog(`${buyer.name} resmi membeli aset [${sq.name}] seharga ${formatRupiah(sq.price)}!`, 'MONEY');

    setBoard((prev) =>
      prev.map((s) => (s.id === squareId ? { ...s, ownerId: buyer.id } : s))
    );

    setPlayers((prev) =>
      prev.map((p, idx) => (idx === playerIdx ? { ...p, money: p.money - sq.price } : p))
    );

    recalculateNetWorth();
  };

  const handleUpgradeBuilding = (squareId: number) => {
    const sq = board[squareId];
    const cost = sq.housePrice || 500000;
    const activePlayer = players[activePlayerIndex];
    if (activePlayer.money < cost || sq.buildingLevel >= 3) return;

    sounds.playCash();
    const newLevel = sq.buildingLevel + 1;
    addLog(`${activePlayer.name} meng-upgrade [${sq.name}] ke level ${newLevel}! Sewa meningkat drastis.`, 'MONEY');

    setBoard((prev) =>
      prev.map((s) => (s.id === squareId ? { ...s, buildingLevel: newLevel } : s))
    );

    setPlayers((prev) =>
      prev.map((p, idx) => (idx === activePlayerIndex ? { ...p, money: p.money - cost } : p))
    );

    recalculateNetWorth();
  };

  const handleMortgageProperty = (squareId: number) => {
    const sq = board[squareId];
    const mortgageCash = Math.round(sq.price * 0.5);
    const activePlayer = players[activePlayerIndex];

    sounds.playCash();
    addLog(`${activePlayer.name} menggadaikan [${sq.name}] dan menerima dana darurat ${formatRupiah(mortgageCash)}.`, 'MONEY');

    setBoard((prev) =>
      prev.map((s) => (s.id === squareId ? { ...s, isMortgaged: true } : s))
    );

    setPlayers((prev) =>
      prev.map((p, idx) => (idx === activePlayerIndex ? { ...p, money: p.money + mortgageCash } : p))
    );

    recalculateNetWorth();
  };

  const handleUnmortgageProperty = (squareId: number) => {
    const sq = board[squareId];
    const cost = Math.round(sq.price * 0.5 * 1.1);
    const activePlayer = players[activePlayerIndex];
    if (activePlayer.money < cost) return;

    sounds.playCash();
    addLog(`${activePlayer.name} menebus gadai [${sq.name}] seharga ${formatRupiah(cost)}.`, 'MONEY');

    setBoard((prev) =>
      prev.map((s) => (s.id === squareId ? { ...s, isMortgaged: false } : s))
    );

    setPlayers((prev) =>
      prev.map((p, idx) => (idx === activePlayerIndex ? { ...p, money: p.money - cost } : p))
    );

    recalculateNetWorth();
  };

  // Black Market Transaction
  const handleExecuteBlackMarket = (item: BlackMarketItem) => {
    const activePlayer = players[activePlayerIndex];
    if (activePlayer.money < item.buyPrice) return;

    // Check police bust based on risk and heat
    const bustChance = (item.riskPercent + activePlayer.blackMarketHeat) / 100;
    const isBusted = Math.random() < bustChance;

    if (!isBusted) {
      sounds.playCash();
      const profit = item.sellPricePotential - item.buyPrice;
      addLog(`Transaksi Pasar Gelap Berhasil! ${activePlayer.name} meraup untung +${formatRupiah(profit)} dari ${item.name}!`, 'MONEY');
      setPlayers((prev) =>
        prev.map((p, idx) =>
          idx === activePlayerIndex
            ? {
                ...p,
                money: p.money + profit,
                blackMarketHeat: Math.min(100, p.blackMarketHeat + 15),
              }
            : p
        )
      );
    } else {
      sounds.playPoliceSiren();
      addLog(`DIGEREBEK INTEL! Barang ${item.name} milik ${activePlayer.name} disita dan dikenakan denda!`, 'CRIME');
      setPlayers((prev) =>
        prev.map((p, idx) =>
          idx === activePlayerIndex
            ? {
                ...p,
                money: p.money - item.buyPrice,
                position: 10,
                inJail: true,
                jailTurns: 3,
                blackMarketHeat: Math.min(100, p.blackMarketHeat + 25),
              }
            : p
        )
      );
    }

    setIsBlackMarketOpen(false);
    recalculateNetWorth();
  };

  // Build Public Facility in City
  const handleBuildPublicFacility = (
    city: CityGroup,
    facilityType: 'floodDike' | 'transitLine' | 'healthCenter' | 'cityPark',
    cost: number
  ) => {
    const activePlayer = players[activePlayerIndex];
    if (activePlayer.money < cost) return;

    sounds.playCash();
    addLog(`${activePlayer.name} mendanai pembangunan fasilitas publik di ${city}! Indeks kesejahteraan naik.`, 'INFO');

    setCityStatuses((prev) => {
      const current = prev[city];
      const welfareBoost = facilityType === 'healthCenter' ? 15 : facilityType === 'cityPark' ? 10 : 8;
      const newWelfare = Math.min(100, current.welfareIndex + welfareBoost);
      const newHazard = facilityType === 'floodDike' && current.hazard === 'BANJIR' ? 'AMAN' : facilityType === 'transitLine' && current.hazard === 'MACET' ? 'AMAN' : current.hazard;

      return {
        ...prev,
        [city]: {
          ...current,
          welfareIndex: newWelfare,
          hazard: newHazard,
          publicFacilities: {
            ...current.publicFacilities,
            [facilityType]: true,
          },
        },
      };
    });

    setPlayers((prev) =>
      prev.map((p, idx) =>
        idx === activePlayerIndex
          ? { ...p, money: p.money - cost, reputation: Math.min(100, p.reputation + 10) }
          : p
      )
    );

    recalculateNetWorth();
  };

  // Commodity Buy & Sell
  const handleBuyCommodity = (commId: string, quantity: number) => {
    const comm = commodities.find((c) => c.id === commId);
    if (!comm) return;
    const totalCost = comm.currentPrice * quantity;
    const activePlayer = players[activePlayerIndex];
    if (activePlayer.money < totalCost) return;

    sounds.playCash();
    addLog(`${activePlayer.name} memborong ${quantity} ${comm.unit} ${comm.name} seharga ${formatRupiah(totalCost)}.`, 'MONEY');

    setPlayers((prev) =>
      prev.map((p, idx) => {
        if (idx === activePlayerIndex) {
          const currentOwned = p.commodities[commId] || 0;
          return {
            ...p,
            money: p.money - totalCost,
            commodities: { ...p.commodities, [commId]: currentOwned + quantity },
          };
        }
        return p;
      })
    );

    recalculateNetWorth();
  };

  const handleSellCommodity = (commId: string, quantity: number) => {
    const comm = commodities.find((c) => c.id === commId);
    const activePlayer = players[activePlayerIndex];
    const currentOwned = activePlayer.commodities[commId] || 0;
    if (!comm || currentOwned < quantity) return;

    const revenue = comm.currentPrice * quantity;
    sounds.playCash();
    addLog(`${activePlayer.name} melepas ${quantity} ${comm.unit} ${comm.name} ke pasar (${formatRupiah(revenue)}).`, 'MONEY');

    setPlayers((prev) =>
      prev.map((p, idx) => {
        if (idx === activePlayerIndex) {
          return {
            ...p,
            money: p.money + revenue,
            commodities: { ...p.commodities, [commId]: currentOwned - quantity },
          };
        }
        return p;
      })
    );

    recalculateNetWorth();
  };

  // Trade Negotiation Execution
  const handleExecuteTrade = (
    targetPlayerId: string,
    myOfferedSquareIds: number[],
    myCash: number,
    theirRequestedSquareIds: number[],
    theirCash: number
  ) => {
    const me = players[activePlayerIndex];
    const target = players.find((p) => p.id === targetPlayerId);
    if (!target) return;

    addLog(`Kesepakatan dagang berhasil antara ${me.name} dan ${target.name}!`, 'MONEY');

    // Transfer properties
    setBoard((prev) =>
      prev.map((sq) => {
        if (myOfferedSquareIds.includes(sq.id)) return { ...sq, ownerId: target.id };
        if (theirRequestedSquareIds.includes(sq.id)) return { ...sq, ownerId: me.id };
        return sq;
      })
    );

    // Transfer cash
    setPlayers((prev) =>
      prev.map((p) => {
        if (p.id === me.id) return { ...p, money: p.money - myCash + theirCash };
        if (p.id === target.id) return { ...p, money: p.money + myCash - theirCash };
        return p;
      })
    );

    recalculateNetWorth();
  };

  // Property Auction Handlers
  const handleStartAuction = (squareId: number) => {
    const sq = board.find((s) => s.id === squareId);
    if (!sq) return;

    const seller = sq.ownerId ? players.find((p) => p.id === sq.ownerId) : null;
    const startPrice = Math.round(sq.price * 0.5);

    const session: AuctionSession = {
      squareId: sq.id,
      squareName: sq.name,
      cityName: sq.cityName || 'Nusantara',
      squareColor: sq.color,
      basePrice: sq.price,
      startingPrice: startPrice,
      currentHighestBid: startPrice,
      highestBidderId: null,
      highestBidderName: null,
      sellerId: seller ? seller.id : null,
      sellerName: seller ? seller.name : 'Kas Negara',
      timeRemaining: 15,
      totalBids: 0,
      bidsHistory: [],
      status: 'ACTIVE',
    };

    setCurrentAuction(session);
    setIsAuctionModalOpen(true);
    sounds.playGavel();
    addLog(`LELANG DIBUKA! [${sq.name}] dilelang mulai dari ${formatRupiah(startPrice)}!`, 'ALERT');

    if (multiplayerRoomCode) {
      updateDoc(doc(db, 'rooms', multiplayerRoomCode), {
        auctionState: JSON.stringify(session),
        updatedAt: new Date().toISOString(),
      }).catch((e) => console.error(e));
    }
  };

  const handlePlaceBid = (bidAmount: number) => {
    if (!currentAuction || currentAuction.status !== 'ACTIVE') return;
    const activePlayer = players[activePlayerIndex];
    if (bidAmount <= currentAuction.currentHighestBid || activePlayer.money < bidAmount) return;

    const newBid: AuctionBid = {
      playerId: activePlayer.id,
      playerName: activePlayer.name,
      amount: bidAmount,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };

    const updatedSession: AuctionSession = {
      ...currentAuction,
      currentHighestBid: bidAmount,
      highestBidderId: activePlayer.id,
      highestBidderName: activePlayer.name,
      totalBids: currentAuction.totalBids + 1,
      bidsHistory: [newBid, ...currentAuction.bidsHistory],
      timeRemaining: 10,
    };

    setCurrentAuction(updatedSession);
    sounds.playBidChime();
    addLog(`Tawaran Baru! ${activePlayer.name} menawar ${formatRupiah(bidAmount)} untuk ${currentAuction.squareName}.`, 'MONEY');

    if (multiplayerRoomCode) {
      updateDoc(doc(db, 'rooms', multiplayerRoomCode), {
        auctionState: JSON.stringify(updatedSession),
        updatedAt: new Date().toISOString(),
      }).catch((e) => console.error(e));
    }
  };

  const handleAuctionEnd = (winnerId: string | null, finalAmount: number) => {
    if (!currentAuction) return;
    sounds.playGavel();

    if (winnerId) {
      const winnerPlayer = players.find((p) => p.id === winnerId);
      const sellerPlayer = currentAuction.sellerId ? players.find((p) => p.id === currentAuction.sellerId) : null;
      sounds.playCash();

      addLog(`LELANG SELESAI! [${currentAuction.squareName}] resmi TERJUAL kepada ${winnerPlayer?.name || 'Pemenang'} seharga ${formatRupiah(finalAmount)}!`, 'MONEY');

      setBoard((prev) =>
        prev.map((s) => (s.id === currentAuction.squareId ? { ...s, ownerId: winnerId, isMortgaged: false } : s))
      );

      setPlayers((prev) =>
        prev.map((p) => {
          if (p.id === winnerId) return { ...p, money: p.money - finalAmount };
          if (sellerPlayer && p.id === sellerPlayer.id) return { ...p, money: p.money + finalAmount };
          return p;
        })
      );
    } else {
      sounds.playFail();
      addLog(`Lelang [${currentAuction.squareName}] berakhir tanpa ada yang menawar.`, 'INFO');
    }

    setCurrentAuction((prev) => (prev ? { ...prev, status: winnerId ? 'SOLD' : 'PASSED' } : null));
    setIsAuctionModalOpen(false);
    recalculateNetWorth();

    if (multiplayerRoomCode) {
      updateDoc(doc(db, 'rooms', multiplayerRoomCode), {
        auctionState: null,
        boardState: JSON.stringify(boardRef.current),
        updatedAt: new Date().toISOString(),
      }).catch((e) => console.error(e));
    }
  };

  // End Turn & Pass to Next Player
  const handleEndTurn = useCallback(() => {
    if (isMovingPlayer) return;
    setIsDiceRolled(false);
    setCanEndTurn(false);

    // Find next non-bankrupt player
    let nextIdx = (activePlayerIndex + 1) % players.length;
    let loopCount = 0;
    while (players[nextIdx]?.isBankrupt && loopCount < players.length) {
      nextIdx = (nextIdx + 1) % players.length;
      loopCount++;
    }

    // Check if new round started
    if (nextIdx === 0) {
      const nextRound = currentRound + 1;
      setCurrentRound(nextRound);
      setInflationRate((prev) => Number((prev + 0.02).toFixed(2))); // +2% inflation per round

      // Random Disaster check every 4 rounds
      if (nextRound % 4 === 0) {
        const dis = DISASTER_EVENTS[Math.floor(Math.random() * DISASTER_EVENTS.length)];
        setActiveDisaster(dis);
        setActivePopupDisaster(dis);
        setActiveCardEvent(null);
        setIsEventPopupOpen(true);
        sounds.playDisasterRumble();
        addLog(`BENCANA ALAM: ${dis.title}! Sewa di ${dis.cityName} terdampak.`, 'DISASTER');
      }
    }

    setActivePlayerIndex(nextIdx);
  }, [activePlayerIndex, currentRound, players, addLog, isMovingPlayer]);

  // AI Automatic Turn Runner
  useEffect(() => {
    if (gameStateMode !== 'PLAYING' || isGameOver) return;

    const activePlayer = players[activePlayerIndex];
    if (!activePlayer || !activePlayer.isAi || activePlayer.isBankrupt) return;

    // AI thinking delay
    const rollTimer = setTimeout(() => {
      if (!isDiceRolled && !isMovingPlayer) {
        handleRollDice();
      }
    }, 1200);

    return () => clearTimeout(rollTimer);
  }, [activePlayerIndex, isDiceRolled, isMovingPlayer, gameStateMode, isGameOver, players]);

  // AI End Turn delay
  useEffect(() => {
    if (gameStateMode !== 'PLAYING' || isGameOver) return;
    const activePlayer = players[activePlayerIndex];
    if (!activePlayer || !activePlayer.isAi || !canEndTurn || isMovingPlayer) return;

    const endTimer = setTimeout(() => {
      handleEndTurn();
    }, 1400);

    return () => clearTimeout(endTimer);
  }, [canEndTurn, activePlayerIndex, isMovingPlayer, gameStateMode, isGameOver, players, handleEndTurn]);

  // Toggle Sound
  const toggleMute = () => {
    const next = !isSoundMuted;
    setIsSoundMuted(next);
    sounds.enabled = !next;
  };

  const activePlayer = players[activePlayerIndex] || players[0];
  const isHumanTurn = activePlayer && !activePlayer.isAi;

  return (
    <div className="h-[100dvh] max-h-[100dvh] h-screen max-h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {gameStateMode === 'LOBBY' ? (
        <div className="flex-1 overflow-y-auto">
          <RoomLobby
            currentUser={currentUser}
            onStartSinglePlayer={handleStartSinglePlayer}
            onCreateMultiplayerRoom={handleCreateMultiplayerRoom}
            onJoinMultiplayerRoom={handleJoinMultiplayerRoom}
            isLoadingRoom={isLoadingRoom}
            onOpenCustomizer={() => setIsAvatarCustomizerOpen(true)}
            isFullscreen={isFullscreen}
            onToggleFullscreen={toggleFullscreen}
          />
        </div>
      ) : (
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          {/* Top Navigation Bar */}
          <header className="h-10 sm:h-11 shrink-0 px-2 sm:px-3 py-1 bg-slate-900/95 border-b border-amber-900/40 backdrop-blur-md flex items-center justify-between z-30 shadow-md">
            <div className="flex items-center gap-1.5 sm:gap-2.5">
              <span className="text-base sm:text-lg">🇲🇨</span>
              <div>
                <h1 className="text-xs sm:text-sm font-black text-amber-400 tracking-tight leading-none">
                  JUARA NUSANTARA
                </h1>
                <span className="text-[8px] sm:text-[9px] text-amber-600/90 font-medium">
                  Ronde {currentRound} | Inflasi: {((inflationRate - 1) * 100).toFixed(0)}%
                </span>
              </div>
            </div>

            {/* Mobile View Toggle Switch (under lg screen) */}
            <div className="flex lg:hidden items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800">
              <button
                onClick={() => setMobileActiveTab('BOARD')}
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${
                  mobileActiveTab === 'BOARD'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🗺️ Papan
              </button>
              <button
                onClick={() => setMobileActiveTab('DASHBOARD')}
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${
                  mobileActiveTab === 'DASHBOARD'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🏆 Klasemen
              </button>
            </div>

            {/* Middle Quick Ticker (Desktop) */}
            <div className="hidden xl:flex items-center gap-2.5 text-xs font-medium text-slate-300">
              <div className="flex items-center gap-1 bg-slate-950 px-2.5 py-0.5 rounded-full border border-slate-800 text-[11px]">
                <span>🌾 Beras:</span>
                <span className="font-bold text-amber-400">
                  {formatRupiah(commodities[0]?.currentPrice || 15000)}
                </span>
              </div>
              <div className="flex items-center gap-1 bg-slate-950 px-2.5 py-0.5 rounded-full border border-slate-800 text-[11px]">
                <span>🌶️ Cabai:</span>
                <span className="font-bold text-rose-400">
                  {formatRupiah(commodities[1]?.currentPrice || 75000)}
                </span>
              </div>
              <div className="flex items-center gap-1 bg-slate-950 px-2.5 py-0.5 rounded-full border border-slate-800 text-[11px]">
                <span>⛽ BBM:</span>
                <span className="font-bold text-blue-400">
                  {formatRupiah(commodities[2]?.currentPrice || 13500)}
                </span>
              </div>
            </div>

            {/* Right Action Icons */}
            <div className="flex items-center gap-1 sm:gap-1.5">
              {/* Fullscreen Button */}
              <button
                onClick={toggleFullscreen}
                title={isFullscreen ? 'Keluar Layar Penuh (Shortcut: F)' : 'Mode Layar Penuh (Shortcut: F)'}
                className={`p-1.5 sm:p-2 rounded-xl text-amber-300 cursor-pointer transition-all flex items-center gap-1 shadow-xs border ${
                  isFullscreen
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                    : 'bg-slate-800 hover:bg-slate-700 border-amber-500/30'
                }`}
              >
                {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
                <span className="text-[11px] font-bold hidden sm:inline">
                  {isFullscreen ? 'Normal' : 'Layar Penuh'}
                </span>
              </button>

              <button
                onClick={toggleMute}
                title={isSoundMuted ? 'Nyalakan Suara' : 'Bisukan Suara'}
                className="p-1.5 sm:p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer transition-all"
              >
                {isSoundMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => setIsAvatarCustomizerOpen(true)}
                title="Kustomisasi Avatar Warga"
                className="p-1.5 sm:p-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white cursor-pointer transition-all flex items-center gap-1 shadow-xs"
              >
                <Palette className="w-3.5 h-3.5" />
                <span className="text-[11px] font-bold hidden md:inline">Avatar</span>
              </button>

              <button
                onClick={() => setIsChatOpen(true)}
                title="Buka Chat & Log Kejadian"
                className="p-1.5 sm:p-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white cursor-pointer transition-all flex items-center gap-1 shadow-xs"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span className="text-[11px] font-bold hidden md:inline">Kabar</span>
              </button>

              <button
                onClick={() => setGameStateMode('LOBBY')}
                className="px-2 sm:px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold cursor-pointer transition-all"
              >
                Lobi
              </button>
            </div>
          </header>

          {/* Main Gameplay Screen: Fits in single viewport without scrolling */}
          <main className="flex-1 min-h-0 p-1 sm:p-1.5 md:p-2 w-full max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-1.5 sm:gap-2 overflow-hidden items-stretch">
            {/* Left: Interactive 40-Square Board & Dice Bar */}
            <div
              className={`lg:col-span-8 h-full flex flex-col justify-between items-center min-h-0 overflow-hidden gap-1 sm:gap-1.5 ${
                mobileActiveTab === 'DASHBOARD' ? 'hidden lg:flex' : 'flex'
              }`}
            >
              <div className="flex-1 min-h-0 w-full flex items-center justify-center overflow-hidden">
                <GameBoard
                  board={board}
                  players={players}
                  activePlayerIndex={activePlayerIndex}
                  cityStatuses={cityStatuses}
                  activeDisaster={activeDisaster}
                  selectedSquareId={selectedSquare?.id}
                  movingPlayerId={movingPlayerId}
                  targetSquareId={targetSquareId}
                  stepProgress={stepProgress}
                  onSquareClick={(sq) => {
                    setSelectedSquare(sq);
                    setIsSquareModalOpen(true);
                  }}
                />
              </div>

              {/* Dice & Turn Controller Bar */}
              <DiceController
                activePlayer={activePlayer}
                isMyTurn={isHumanTurn}
                dice={dice}
                isDiceRolled={isDiceRolled}
                canEndTurn={canEndTurn}
                isMovingPlayer={isMovingPlayer}
                stepProgress={stepProgress}
                onRollDice={handleRollDice}
                onEndTurn={handleEndTurn}
                onOpenMarket={() => setIsMarketOpen(true)}
                onOpenCityHazard={() => setIsCityHazardOpen(true)}
                onOpenBlackMarket={() => setIsBlackMarketOpen(true)}
                onOpenCosmetics={() => setIsCosmeticsOpen(true)}
                onOpenTrade={() => setIsTradeOpen(true)}
                onOpenAvatarCustomizer={() => setIsAvatarCustomizerOpen(true)}
                onOpenAuction={() => {
                  const targetSq =
                    board[activePlayer.position]?.price > 0
                      ? board[activePlayer.position]
                      : board.find((s) => s.price > 0 && !s.ownerId) || board[1];
                  handleStartAuction(targetSq.id);
                }}
              />
            </div>

            {/* Right: Player Standings Dashboard & Mini Status */}
            <div
              className={`lg:col-span-4 h-full flex flex-col justify-between min-h-0 gap-1 sm:gap-1.5 overflow-hidden ${
                mobileActiveTab === 'BOARD' ? 'hidden lg:flex' : 'flex'
              }`}
            >
              <PlayerDashboard
                players={players}
                activePlayerIndex={activePlayerIndex}
                board={board}
              />

              {/* Recent Activity Ticker */}
              <div className="bg-slate-900/90 rounded-xl sm:rounded-2xl p-2 border border-slate-800 text-xs space-y-1 shrink-0">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Warta Nusantara Terkini</span>
                  <span className="text-emerald-400">● LIVE</span>
                </div>
                <div className="text-slate-200 line-clamp-1 font-medium text-[11px]">
                  {logs[logs.length - 1]?.text || 'Semua aman terkendali.'}
                </div>
              </div>
            </div>
          </main>
        </div>
      )}

      {/* Modals */}
      <MarketPanel
        commodities={commodities}
        player={activePlayer}
        inflationRate={inflationRate}
        isOpen={isMarketOpen}
        onClose={() => setIsMarketOpen(false)}
        onBuyCommodity={handleBuyCommodity}
        onSellCommodity={handleSellCommodity}
      />

      <HazardCityPanel
        cityStatuses={cityStatuses}
        player={activePlayer}
        board={board}
        isOpen={isCityHazardOpen}
        onClose={() => setIsCityHazardOpen(false)}
        onBuildFacility={handleBuildPublicFacility}
      />

      <BlackMarketModal
        player={activePlayer}
        isOpen={isBlackMarketOpen}
        onClose={() => setIsBlackMarketOpen(false)}
        onExecuteTransaction={handleExecuteBlackMarket}
      />

      <PoliceModal
        player={activePlayer}
        isOpen={isPoliceModalOpen}
        isJailCell={activePlayer?.inJail}
        onClose={() => setIsPoliceModalOpen(false)}
        onPayOfficialFine={handlePayOfficialFine}
        onGoToCourt={handleGoToCourt}
        onAttemptBribe={handleAttemptBribe}
        onPayBail={handlePayBail}
        onUseGetOutOfJailCard={handleUseGetOutOfJailCard}
        onTryRollDouble={handleTryRollDouble}
      />

      <SquareActionModal
        square={selectedSquare}
        activePlayer={activePlayer}
        allPlayers={players}
        allBoard={board}
        cityStatuses={cityStatuses}
        isOpen={isSquareModalOpen}
        isCurrentLanding={selectedSquare?.id === activePlayer?.position}
        onClose={() => setIsSquareModalOpen(false)}
        onBuyProperty={(sqId) => executeBuyProperty(sqId, activePlayerIndex)}
        onUpgradeBuilding={handleUpgradeBuilding}
        onMortgageProperty={handleMortgageProperty}
        onUnmortgageProperty={handleUnmortgageProperty}
        onStartAuction={handleStartAuction}
      />

      <TradeModal
        activePlayer={activePlayer}
        players={players}
        board={board}
        isOpen={isTradeOpen}
        onClose={() => setIsTradeOpen(false)}
        onExecuteTrade={handleExecuteTrade}
      />

      <AvatarCustomizerModal
        currentCustomization={customAvatar}
        playerName={activePlayer?.name || 'Warga'}
        isOpen={isAvatarCustomizerOpen}
        onClose={() => setIsAvatarCustomizerOpen(false)}
        onSaveCustomization={(newCust) => {
          setCustomAvatar(newCust);
          setPlayers((prev) =>
            prev.map((p) => (!p.isAi ? { ...p, customAvatar: newCust } : p))
          );
          addLog(`Avatar profil ${activePlayer.name} berhasil diperbarui!`, 'INFO');
        }}
      />

      <PropertyAuctionModal
        auction={currentAuction}
        activePlayer={activePlayer}
        players={players}
        isOpen={isAuctionModalOpen}
        onPlaceBid={handlePlaceBid}
        onAuctionEnd={handleAuctionEnd}
        onPassBid={() => {
          addLog(`${activePlayer.name} memilih tidak menawar saat ini.`, 'INFO');
        }}
      />

      <CosmeticsShopModal
        userCoins={userCoins}
        unlockedSkins={unlockedSkins}
        activeAvatarId={activeAvatarSkin}
        isOpen={isCosmeticsOpen}
        onClose={() => setIsCosmeticsOpen(false)}
        onBuySkin={(skinId, price) => {
          setUserCoins((prev) => prev - price);
          setUnlockedSkins((prev) => [...prev, skinId]);
          setActiveAvatarSkin(skinId);
        }}
        onSelectSkin={(skinId) => setActiveAvatarSkin(skinId)}
        onClaimDailyReward={() => {
          setUserCoins((prev) => prev + 50);
          setHasClaimedDaily(true);
        }}
        hasClaimedDaily={hasClaimedDaily}
      />

      <ChatPanel
        logs={logs}
        onSendMessage={(msg) => addLog(`[${currentUser?.displayName || 'Anda'}]: ${msg}`, 'INFO')}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />

      <DisasterPopup
        disaster={activePopupDisaster}
        cardEvent={activeCardEvent}
        isOpen={isEventPopupOpen}
        onClose={() => setIsEventPopupOpen(false)}
      />

      <GameOverModal
        winner={winner}
        players={players}
        isOpen={isGameOver}
        onPlayAgain={() => {
          setIsGameOver(false);
          setWinner(null);
          handleStartSinglePlayer(activePlayer.name, activeAvatarSkin, 3);
        }}
        onReturnToLobby={() => {
          setIsGameOver(false);
          setWinner(null);
          setGameStateMode('LOBBY');
        }}
      />
    </div>
  );
}
