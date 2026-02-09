import { NextResponse } from 'next/server'

const ORDERLY_API = 'https://api-evm.orderly.org'

export async function GET() {
  try {
    const [tickersRes, infoRes] = await Promise.all([
      fetch(`${ORDERLY_API}/v1/public/futures`, { next: { revalidate: 30 } }),
      fetch(`${ORDERLY_API}/v1/public/info`, { next: { revalidate: 300 } })
    ])
    
    const tickersData = await tickersRes.json()
    const infoData = await infoRes.json()
    
    const symbolInfo: Record<string, any> = {}
    infoData.data?.rows?.forEach((row: any) => {
      symbolInfo[row.symbol] = row
    })
    
    const markets = (tickersData.data?.rows || [])
      .map((ticker: any) => {
        const info = symbolInfo[ticker.symbol] || {}
        const change24h = ticker.mark_price && ticker.open_24h 
          ? (ticker.mark_price - ticker.open_24h) / ticker.open_24h 
          : 0
        
        return {
          symbol: ticker.symbol,
          indexPrice: ticker.index_price || 0,
          markPrice: ticker.mark_price || 0,
          change24h,
          volume24h: ticker.volume_24h || 0,
          openInterest: ticker.open_interest || 0,
          fundingRate: ticker.est_funding_rate || 0,
        }
      })
      .sort((a: any, b: any) => b.volume24h - a.volume24h)

    return NextResponse.json({
      success: true,
      data: markets
    })
  } catch (error) {
    console.error('Failed to fetch markets:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch markets' },
      { status: 500 }
    )
  }
}
