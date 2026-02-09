// Orderly API utilities

const ORDERLY_API = 'https://api.orderly.org'

export interface MarketStats {
  totalVolume: number
  volume24h: number
  openInterest: number
  totalTraders: number
  tvl: number
  totalBuilders: number
}

export interface MarketInfo {
  symbol: string
  index_price: number
  mark_price: number
  sum_unitary_funding: number
  est_funding_rate: number
  last_funding_rate: number
  next_funding_time: number
  open_interest: number
  "24h_open": number
  "24h_close": number
  "24h_high": number
  "24h_low": number
  "24h_volume": number  // quantity in base currency
  "24h_amount": number  // USD volume (this is what we want to display)
}

export interface FundingRate {
  symbol: string
  est_funding_rate: number
  last_funding_rate: number
  next_funding_time: number
}

// Fetch all available markets
export async function getMarkets(): Promise<MarketInfo[]> {
  try {
    const res = await fetch(`${ORDERLY_API}/v1/public/futures`, {
      next: { revalidate: 30 }
    })
    const data = await res.json()
    return data.data?.rows || []
  } catch (error) {
    console.error('Failed to fetch markets:', error)
    return []
  }
}

// Fetch market info for a specific symbol
export async function getMarketInfo(symbol: string): Promise<MarketInfo | null> {
  try {
    const res = await fetch(`${ORDERLY_API}/v1/public/futures/${symbol}`, {
      next: { revalidate: 10 }
    })
    const data = await res.json()
    return data.data || null
  } catch (error) {
    console.error('Failed to fetch market info:', error)
    return null
  }
}

// Fetch funding rates
export async function getFundingRates(): Promise<FundingRate[]> {
  try {
    const res = await fetch(`${ORDERLY_API}/v1/public/funding_rates`, {
      next: { revalidate: 60 }
    })
    const data = await res.json()
    return data.data?.rows || []
  } catch (error) {
    console.error('Failed to fetch funding rates:', error)
    return []
  }
}

// Calculate aggregate stats from markets
export function calculateStats(markets: MarketInfo[]): Partial<MarketStats> {
  // 24h_amount is the USD volume, not 24h_volume (which is quantity)
  const volume24h = markets.reduce((acc, m) => acc + (m['24h_amount'] || 0), 0)
  
  // Open interest is in base currency, need to multiply by mark_price for USD value
  const openInterest = markets.reduce((acc, m) => {
    const oi = m.open_interest || 0
    const price = m.mark_price || m.index_price || 0
    return acc + (oi * price)
  }, 0)
  
  return {
    volume24h,
    openInterest,
  }
}

// Format large numbers
export function formatNumber(num: number, decimals = 2): string {
  if (num >= 1_000_000_000) {
    return `$${(num / 1_000_000_000).toFixed(decimals)}B`
  }
  if (num >= 1_000_000) {
    return `$${(num / 1_000_000).toFixed(decimals)}M`
  }
  if (num >= 1_000) {
    return `$${(num / 1_000).toFixed(decimals)}K`
  }
  return `$${num.toFixed(decimals)}`
}

export function formatPercent(num: number): string {
  const sign = num >= 0 ? '+' : ''
  return `${sign}${(num * 100).toFixed(2)}%`
}

export function formatPrice(num: number): string {
  if (num >= 1000) {
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }
  if (num >= 1) {
    return num.toFixed(4)
  }
  return num.toFixed(6)
}
