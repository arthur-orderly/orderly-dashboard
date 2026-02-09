'use client'

import { useEffect, useState, useCallback } from 'react'

interface LiveData {
  volume24h: number
  openInterest: number
  tvl: number
  lastUpdated: Date
}

interface MarketInfo {
  symbol: string
  mark_price: number
  index_price: number
  open_interest: number
  '24h_amount': number
}

function formatNumber(num: number, decimals = 2): string {
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

function LiveStatCard({
  title,
  value,
  isUpdating,
  change,
  subtitle,
}: {
  title: string
  value: string
  isUpdating: boolean
  change?: { value: string; type: 'positive' | 'negative' | 'neutral' }
  subtitle?: string
}) {
  return (
    <div className="bg-orderly-card rounded-xl p-6 border border-orderly-border card-hover relative overflow-hidden">
      {/* Pulse indicator when updating */}
      <div className={`absolute top-3 right-3 w-2 h-2 rounded-full transition-all duration-300 ${
        isUpdating ? 'bg-orderly-cyan animate-ping' : 'bg-green-500'
      }`} />
      <div className={`absolute top-3 right-3 w-2 h-2 rounded-full ${
        isUpdating ? 'bg-orderly-cyan' : 'bg-green-500'
      }`} />
      
      <div>
        <p className="text-sm text-gray-400 font-medium">{title}</p>
        <p className={`text-2xl font-bold text-white mt-1 transition-all duration-300 ${
          isUpdating ? 'opacity-70' : 'opacity-100'
        }`}>
          {value}
        </p>
        {subtitle && (
          <p className="text-xs text-gray-500 mt-1 tabular-nums">{subtitle}</p>
        )}
        {change && (
          <p className={`text-sm mt-1 font-medium ${
            change.type === 'positive' ? 'text-green-400' :
            change.type === 'negative' ? 'text-red-400' :
            'text-gray-400'
          }`}>
            {change.value}
          </p>
        )}
      </div>
    </div>
  )
}

export default function LiveStats() {
  const [data, setData] = useState<LiveData | null>(null)
  const [prevData, setPrevData] = useState<LiveData | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(15)

  const fetchData = useCallback(async () => {
    setIsUpdating(true)
    try {
      // Fetch markets data from Orderly
      const res = await fetch('https://api.orderly.org/v1/public/futures', {
        cache: 'no-store'
      })
      const json = await res.json()
      const markets: MarketInfo[] = json.data?.rows || []

      // Calculate 24h volume (in USD)
      const volume24h = markets.reduce((acc, m) => acc + (m['24h_amount'] || 0), 0)

      // Calculate open interest (base * price = USD)
      const openInterest = markets.reduce((acc, m) => {
        const oi = m.open_interest || 0
        const price = m.mark_price || m.index_price || 0
        return acc + (oi * price)
      }, 0)

      // Fetch TVL from Orderly's balance stats
      let tvl = 30_000_000 // fallback
      try {
        const tvlRes = await fetch('https://api.orderly.org/v1/public/balance/stats', {
          cache: 'no-store'
        })
        const tvlJson = await tvlRes.json()
        if (tvlJson.success && tvlJson.data?.total_holding) {
          tvl = tvlJson.data.total_holding
        }
      } catch {
        // Use fallback TVL
      }

      setPrevData(data)
      setData({
        volume24h,
        openInterest,
        tvl,
        lastUpdated: new Date()
      })
      setError(null)
    } catch (err) {
      setError('Failed to fetch data')
      console.error('LiveStats fetch error:', err)
    } finally {
      setIsUpdating(false)
      setCountdown(15)
    }
  }, [data])

  // Initial fetch and 15-second interval
  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 15000)
    return () => clearInterval(interval)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(c => (c > 0 ? c - 1 : 15))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Calculate changes
  const getChange = (current: number, previous: number | undefined) => {
    if (!previous) return undefined
    const diff = current - previous
    const pct = (diff / previous) * 100
    if (Math.abs(pct) < 0.01) return undefined
    return {
      value: `${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%`,
      type: pct > 0 ? 'positive' as const : pct < 0 ? 'negative' as const : 'neutral' as const
    }
  }

  if (error && !data) {
    return (
      <div className="col-span-3 bg-orderly-card rounded-xl p-6 border border-red-500/50">
        <p className="text-red-400">{error}</p>
      </div>
    )
  }

  return (
    <>
      <LiveStatCard
        title="24h Volume"
        value={data ? formatNumber(data.volume24h) : '---'}
        isUpdating={isUpdating}
        change={getChange(data?.volume24h || 0, prevData?.volume24h)}
        subtitle={`Next: ${countdown}s`}
      />
      <LiveStatCard
        title="Open Interest"
        value={data ? formatNumber(data.openInterest) : '---'}
        isUpdating={isUpdating}
        change={getChange(data?.openInterest || 0, prevData?.openInterest)}
      />
      <LiveStatCard
        title="TVL"
        value={data ? formatNumber(data.tvl) : '---'}
        isUpdating={isUpdating}
        change={getChange(data?.tvl || 0, prevData?.tvl)}
      />
    </>
  )
}
