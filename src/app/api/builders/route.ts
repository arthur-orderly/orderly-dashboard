import { NextResponse } from 'next/server'

const ORDERLY_API = 'https://api-evm.orderly.org'

// Top builders by 30d volume (verified Feb 2026)
const TOP_BUILDERS = [
  'orderly',      // #1 - $2.97B
  'raydium',      // #2 - $401M  
  'kodiak',       // #3 - $250M
  'aden',         // #4 - $232M
  'woofi_pro',    // #5 - $160M
  'aegisdex',     // #6 - $68M
  'berrie',       // #7 - $28M
  'vooi',         // #8 - $10M
  'logx',         // #9 - $9.5M
  'quick_perps',  // #10 - $2.8M
]

export const dynamic = 'force-dynamic'

async function fetchWithRetry(url: string, retries = 2): Promise<any> {
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url, { cache: 'no-store' })
      const data = await res.json()
      if (data.success) return data
      if (data.code === -1003 && i < retries) {
        // Rate limited - wait and retry
        await new Promise(r => setTimeout(r, 1000))
        continue
      }
    } catch (err) {
      if (i === retries) throw err
    }
  }
  return null
}

export async function GET() {
  try {
    // Fetch broker names first
    const namesData = await fetchWithRetry(`${ORDERLY_API}/v1/public/broker/name`)
    
    if (!namesData) {
      throw new Error('Failed to fetch broker names')
    }
    
    const brokerMap = new Map(
      namesData.data.rows.map((b: any) => [b.broker_id, b.broker_name])
    )
    
    // Fetch volume stats for each builder with slight delays to avoid rate limits
    const builders = []
    
    for (const brokerId of TOP_BUILDERS) {
      try {
        const data = await fetchWithRetry(
          `${ORDERLY_API}/v1/public/volume/stats?broker_id=${brokerId}`
        )
        
        if (data?.data) {
          builders.push({
            broker_id: brokerId,
            broker_name: brokerMap.get(brokerId) || brokerId,
            volume_30d: data.data.perp_volume_last_30_days || 0,
            volume_7d: data.data.perp_volume_last_7_days || 0,
            volume_24h: data.data.perp_volume_last_1_day || 0,
            volume_ytd: data.data.perp_volume_ytd || 0,
            volume_ltd: data.data.perp_volume_ltd || 0,
          })
        }
        
        // Small delay between requests
        await new Promise(r => setTimeout(r, 100))
      } catch (err) {
        console.error(`Failed to fetch volume for ${brokerId}:`, err)
      }
    }
    
    // Sort by 30d volume descending
    builders.sort((a, b) => b.volume_30d - a.volume_30d)
    
    return NextResponse.json({
      success: true,
      data: builders,
      timestamp: Date.now()
    })
  } catch (error) {
    console.error('Failed to fetch builder data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch builder data' },
      { status: 500 }
    )
  }
}
