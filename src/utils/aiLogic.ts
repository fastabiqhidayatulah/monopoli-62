import { Player, BoardSquare, Commodity } from '../types/game';

export interface AiDecisionResult {
  action: 'BUY' | 'PASS' | 'UPGRADE' | 'MORTGAGE' | 'BRIBE' | 'PAY_FINE' | 'TRADE' | 'NONE';
  targetId?: number | string;
  notes?: string;
}

export function makeAiTurnDecision(
  player: Player,
  currentSquare: BoardSquare,
  allSquares: BoardSquare[],
  commodities: Commodity[]
): AiDecisionResult {
  // Keputusan jika mendarat di properti yang belum dimiliki
  if (
    (currentSquare.type === 'PROPERTY' || currentSquare.type === 'TRANSPORT' || currentSquare.type === 'UTILITY') &&
    !currentSquare.ownerId
  ) {
    const cost = currentSquare.price;
    const safetyBuffer = player.aiPersonality === 'HEMAT' ? 1200000 : 500000;

    if (player.money >= cost + safetyBuffer) {
      return { action: 'BUY', targetId: currentSquare.id, notes: 'Membeli aset properti' };
    }
  }

  // Keputusan upgrade properti jika punya cukup uang
  const myProperties = allSquares.filter((s) => s.ownerId === player.id && s.buildingLevel < 3 && s.housePrice);
  for (const prop of myProperties) {
    const upgradeCost = prop.housePrice || 500000;
    if (player.money >= upgradeCost + 1500000) {
      return { action: 'UPGRADE', targetId: prop.id, notes: 'Upgrade bangunan' };
    }
  }

  // Keputusan gadai properti jika uang menipis
  if (player.money < 300000) {
    const unmortgagedProps = allSquares.filter((s) => s.ownerId === player.id && !s.isMortgaged);
    if (unmortgagedProps.length > 0) {
      // Gadai properti dengan harga terendah dulu
      const cheapest = unmortgagedProps.sort((a, b) => a.price - b.price)[0];
      return { action: 'MORTGAGE', targetId: cheapest.id, notes: 'Gadai properti darurat' };
    }
  }

  return { action: 'NONE' };
}

export function makeAiPoliceDecision(player: Player): 'PAY_FINE' | 'BRIBE' | 'COURT' {
  if (player.aiPersonality === 'SPEKULAN') {
    // Bang Jago berani coba suap jika reputasi atau uang cocok
    return Math.random() < 0.7 ? 'BRIBE' : 'PAY_FINE';
  }
  if (player.aiPersonality === 'HEMAT') {
    // Mbak Rini pilih bayar tilang resmi aman
    return 'PAY_FINE';
  }
  // Pak Haji: 50% suap, 50% bayar resmi
  return Math.random() < 0.5 ? 'BRIBE' : 'PAY_FINE';
}
