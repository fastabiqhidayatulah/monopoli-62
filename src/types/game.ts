export type CityGroup = 
  | 'JAKARTA'
  | 'BANDUNG'
  | 'SEMARANG'
  | 'SOLO'
  | 'YOGYAKARTA'
  | 'SURABAYA'
  | 'BALI'
  | 'MEDAN'
  | 'MAKASSAR'
  | 'PALEMBANG'
  | 'TRANSPORT'
  | 'UTILITY'
  | 'SPECIAL';

export type SquareType = 
  | 'START'
  | 'PROPERTY'
  | 'TRANSPORT'
  | 'UTILITY'
  | 'CHANCE' // Surat Sakti Warga
  | 'COMMUNITY_CHEST' // Dana Bansos RT
  | 'TAX' // Pajak PBB / Penghasilan
  | 'POLICE_RAID' // Pos Razia Tilang
  | 'BUREAUCRACY' // Kantor Birokrasi
  | 'JAIL' // Penjara Polda (Hanya singgah atau tahanan)
  | 'GO_TO_JAIL' // Ketangkap OTT / Sidak
  | 'BLACK_MARKET' // Pasar Gelap
  | 'REST_AREA'; // Alun-alun / Bebas Parkir

export interface BoardSquare {
  id: number; // 0 to 39
  name: string;
  type: SquareType;
  city?: CityGroup;
  cityName?: string;
  price: number;
  baseRent: number;
  housePrice?: number;
  ownerId?: string | null;
  buildingLevel: number; // 0: tanah kosong, 1: warung, 2: ruko, 3: mall/hotel
  isMortgaged: boolean;
  hazardRisk: 'RENDAH' | 'SEDANG' | 'TINGGI'; // Banjir/macet
  color: string;
  description: string;
  icon?: string;
}

export interface CityStatus {
  welfareIndex: number; // 0 - 100
  hazard: 'AMAN' | 'BANJIR' | 'MACET' | 'POLUSI';
  publicFacilities: {
    floodDike: boolean; // Tanggul banjir / pompa
    transitLine: boolean; // Jalur MRT / flyover
    healthCenter: boolean; // Puskesmas / RS
    cityPark: boolean; // RTH / Taman
  };
}

export interface AvatarCustomization {
  baseCharacterId: string;
  skinTone: string; // Hex color
  hairStyle: 'pompadour' | 'kuncir' | 'gondrong' | 'hijab' | 'cepak' | 'helm_ojol';
  hairColor: string; // Hex color
  clothing: 'jaket_ojol' | 'daster_batik' | 'rompi_proyek' | 'blazer_jaksel' | 'batik_formal' | 'kaos_santuy';
  clothingColor: string; // Hex color
  accessory: 'none' | 'kacamata_hitam' | 'peci_songkok' | 'blangkon' | 'masker' | 'kalung_emas' | 'walkie_talkie';
}

export interface AuctionBid {
  playerId: string;
  playerName: string;
  amount: number;
  timestamp: string;
}

export interface AuctionSession {
  squareId: number;
  squareName: string;
  cityName: string;
  squareColor: string;
  basePrice: number;
  startingPrice: number;
  currentHighestBid: number;
  highestBidderId: string | null;
  highestBidderName: string | null;
  sellerId: string | null; // null if bank/public auction
  sellerName: string | null;
  timeRemaining: number; // in seconds
  totalBids: number;
  bidsHistory: AuctionBid[];
  status: 'ACTIVE' | 'SOLD' | 'PASSED';
}

export interface Player {
  id: string;
  name: string;
  avatarId: string;
  customAvatar?: AvatarCustomization;
  isAi: boolean;
  aiPersonality?: 'JURAGAN' | 'SPEKULAN' | 'HEMAT';
  color: string;
  money: number;
  netWorth: number;
  position: number;
  inJail: boolean;
  jailTurns: number;
  reputation: number; // 0 - 100
  legalRisk: number; // 0 - 100
  blackMarketHeat: number; // 0 - 100
  hasGetOutOfJailCard: boolean;
  hasInsurance: boolean;
  commodities: { [key: string]: number };
  isBankrupt: boolean;
  roundsSurvived: number;
}

export interface Commodity {
  id: string;
  name: string;
  code: string;
  icon: string;
  currentPrice: number;
  basePrice: number;
  priceHistory: number[];
  changePercent: number;
  unit: string;
  volatility: number;
  description: string;
}

export interface GameEventCard {
  id: string;
  title: string;
  description: string;
  type: 'MONEY' | 'MOVE' | 'REPUTATION' | 'HAZARD' | 'JAIL';
  amount?: number;
  targetPosition?: number;
  cityTarget?: CityGroup;
  flairText: string;
}

export interface NaturalDisasterEvent {
  id: string;
  title: string;
  city: CityGroup;
  cityName: string;
  severity: 'RINGAN' | 'SEDANG' | 'PARAH';
  impactDescription: string;
  repairCostPerBuilding: number;
  rentPenaltyPercent: number;
  durationRounds: number;
}

export interface BlackMarketItem {
  id: string;
  name: string;
  buyPrice: number;
  sellPricePotential: number; // 2x-4x
  riskPercent: number; // Peluang razia
  description: string;
}

export interface GameRoomState {
  code: string;
  name: string;
  hostId: string;
  hostName: string;
  status: 'waiting' | 'playing' | 'finished';
  maxPlayers: number;
  currentTurn: number;
  round: number;
  maxRounds: number;
  dice: [number, number];
  isDiceRolled: boolean;
  lastDiceRollTime: number;
  activeDisaster?: NaturalDisasterEvent | null;
  inflationRate: number; // e.g. 1.05 = +5%
  winnerId?: string | null;
  logs: GameLog[];
  turnDeadline: number;
}

export interface GameLog {
  id: string;
  timestamp: string;
  text: string;
  type: 'INFO' | 'ALERT' | 'MONEY' | 'CRIME' | 'DISASTER';
}

export interface CosmeticSkin {
  id: string;
  name: string;
  title: string;
  role: string;
  priceCoins: number;
  avatarIcon: string;
  perkDescription: string;
  accentColor: string;
  isUnlockedDefault?: boolean;
}

export type BoardEventType = 
  | 'RENT' 
  | 'SALARY' 
  | 'BUY' 
  | 'UPGRADE' 
  | 'TAX' 
  | 'JAIL' 
  | 'POLICE' 
  | 'CARD' 
  | 'DISASTER' 
  | 'BLACK_MARKET' 
  | 'AUCTION' 
  | 'TRADE' 
  | 'INFO';

export interface BoardEventNotification {
  id: string;
  type: BoardEventType;
  title: string;
  message: string;
  amountChange?: number;
  playerName?: string;
  playerAvatarId?: string;
  playerCustomAvatar?: AvatarCustomization;
  targetPlayerName?: string;
  targetAvatarId?: string;
  targetCustomAvatar?: AvatarCustomization;
  propertyName?: string;
  timestamp: string;
}
