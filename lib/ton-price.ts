export async function getTONPrice(): Promise<number> {
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=the-open-network&vs_currencies=usd',
      { next: { revalidate: 60 } }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch TON price');
    }
    
    const data = await response.json();
    return data['the-open-network'].usd;
  } catch (error) {
    console.error('Error fetching TON price:', error);
    return 6.0;
  }
}

export function calculateTONAmount(usd: number, tonPrice: number, slippage = 0.02): number {
  const baseAmount = usd / tonPrice;
  return Number((baseAmount * (1 + slippage)).toFixed(4));
}
