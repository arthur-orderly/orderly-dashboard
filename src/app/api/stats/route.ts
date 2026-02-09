import { NextResponse } from 'next/server'

const ORDERLY_API = 'https://api-evm.orderly.org'

export async function GET() {
  try {
    const [volumeRes, infoRes] = await Promise.all([
      fetch(`${ORDERLY_API}/v1/public/volume/stats`, { next: { revalidate: 300 } }),
      fetch(`${ORDERLY_API}/v1/public/info`, { next: { revalidate: 300 } })
    ])
    
    const volumeData = await volumeRes.json()
    const infoData = await infoRes.json()
    
    // Calculate total volume across all brokers
    const brokers = volumeData.data?.brokers || {}
    let totalVolume = 0
    let builderCount = 0
    
    Object.values(brokers).forEach((stats: any) => {
      totalVolume += stats.volume_ltd || 0
      if (stats.volume_30d > 0) builderCount++
    })

    return NextResponse.json({
      success: true,
      data: {
        totalVolume,
        traders: 895000, // Approximate - would need different endpoint
        builders: builderCount,
        markets: infoData.data?.rows?.length || 97
      }
    })
  } catch (error) {
    console.error('Failed to fetch stats:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
