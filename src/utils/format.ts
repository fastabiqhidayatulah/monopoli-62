import { BoardSquare, CityGroup, CityStatus } from '../types/game';

export function formatRupiah(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatRupiahShort(value: number): string {
  if (Math.abs(value) >= 1_000_000_000) {
    return `Rp ${(value / 1_000_000_000).toFixed(1)} M`;
  }
  if (Math.abs(value) >= 1_000_000) {
    return `Rp ${(value / 1_000_000).toFixed(1)} Jt`;
  }
  if (Math.abs(value) >= 1_000) {
    return `Rp ${(value / 1_000).toFixed(0)} Rb`;
  }
  return `Rp ${value}`;
}

export function calculateRent(
  square: BoardSquare,
  board: BoardSquare[],
  cityStatuses: Record<CityGroup, CityStatus>,
  diceTotal: number,
  inflationRate: number = 1.0
): number {
  if (square.isMortgaged) return 0;

  let base = square.baseRent;

  // Utilitas (PLN / PDAM)
  if (square.type === 'UTILITY') {
    const utilityCount = board.filter((s) => s.type === 'UTILITY' && s.ownerId === square.ownerId).length;
    const multiplier = utilityCount === 2 ? 100000 : 40000;
    return Math.round(diceTotal * multiplier * inflationRate);
  }

  // Transportasi (KRL, TJ, MRT, Ojol)
  if (square.type === 'TRANSPORT') {
    const transportCount = board.filter((s) => s.type === 'TRANSPORT' && s.ownerId === square.ownerId).length;
    const multipliers = [0, 1, 2, 4, 8];
    const factor = multipliers[transportCount] || 1;
    return Math.round(base * factor * inflationRate);
  }

  if (square.type !== 'PROPERTY' || !square.city) {
    return base;
  }

  // Cek apakah pemilik memonopoli seluruh kota ini
  const citySquares = board.filter((s) => s.city === square.city);
  const ownsWholeCity = citySquares.length > 0 && citySquares.every((s) => s.ownerId === square.ownerId);

  // Efek Level Bangunan
  // 0: Tanah kosong (x2 jika monopoli)
  // 1: Warung (x3)
  // 2: Ruko (x7)
  // 3: Mall/Hotel (x15)
  let levelMultiplier = 1;
  if (square.buildingLevel === 0 && ownsWholeCity) {
    levelMultiplier = 2;
  } else if (square.buildingLevel === 1) {
    levelMultiplier = 3.5;
  } else if (square.buildingLevel === 2) {
    levelMultiplier = 8;
  } else if (square.buildingLevel === 3) {
    levelMultiplier = 18;
  }

  let rent = base * levelMultiplier * inflationRate;

  // Efek Indeks Kesejahteraan Kota
  const cityStatus = cityStatuses[square.city];
  if (cityStatus) {
    const welfare = cityStatus.welfareIndex;
    if (welfare >= 75) {
      rent *= 1.25; // Bonus kota maju +25%
    } else if (welfare <= 40) {
      rent *= 0.7; // Penalti kota kumuh/rusak -30%
    }

    // Penalti bencana banjir
    if (cityStatus.hazard === 'BANJIR') {
      rent *= 0.5; // Potongan 50% karena banjir
    }
  }

  return Math.round(rent);
}
