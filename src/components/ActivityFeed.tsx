'use client'

import { useEffect, useState, useCallback } from 'react'

interface Trade {
  id: string
  symbol: string
  side: 'BUY' | 'SELL'
  price: number
  quantity: number
  timestamp: number
  notional: number
}

interface ApiTrade {
  symbol: string
  side: 'BUY' | 'SELL'
  executed_price: number
  executed_quantity: number
  executed_timestamp: number
}

// Top traded markets to fetch
const MARKETS = [
  'PERP_BTC_USDC',
  'PERP_ETH_USDC',
  'PERP_SOL_USDC',
  'PERP_DOGE_USDC',
  'PERP_ARB_USDC',
  'PERP_OP_USDC',
]

function formatSymbol(symbol: string): string {
  // Convert PERP_BTC_USDC to BTC
  return symbol.replace('PERP_', '').replace('_USDC', '')
}

function formatNumber(num: number): string {
  if (num >= 1_000_000) {
    return `$${(num / 1_000_000).toFixed(2)}M`
  }
  if (num >= 1_000) {
    return `$${(num / 1_000).toFixed(2)}K`
  }
  return `$${num.toFixed(2)}`
}

export default function ActivityFeed() {
  const [trades, setTrades] = useState<Trade[]>([])
  const [isLive, setIsLive] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTrades = useCallback(async () => {
    try {
      // Fetch trades from multiple markets in parallel
      const promises = MARKETS.map(async (symbol) => {
        const res = await fetch(
          `https://api.orderly.org/v1/public/market_trades?symbol=${symbol}&limit=5`,
          { cache: 'no-store' }
        )
        const json = await res.json()
        
        if (json.success && json.data?.rows) {
          return json.data.rows.map((trade: ApiTrade) => ({
            id: `${trade.symbol}-${trade.executed_timestamp}-${Math.random()}`,
            symbol: formatSymbol(trade.symbol),
            side: trade.side,
            price: trade.executed_price,
            quantity: trade.executed_quantity,
            timestamp: trade.executed_timestamp,
            notional: trade.executed_price * trade.executed_quantity,
          }))
        }
        return []
      })

      const results = await Promise.all(promises)
      const allTrades = results.flat()
      
      // Sort by timestamp descending and take top 20
      const sortedTrades = allTrades
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 20)
      
      setTrades(sortedTrades)
      setError(null)
      setIsLoading(false)
    } catch (err) {
      setError('Failed to fetch trades')
      console.error('ActivityFeed fetch error:', err)
      setIsLoading(false)
    }
  }, [])

  // Initial fetch and polling
  useEffect(() => {
    fetchTrades()
    
    const interval = setInterval(() => {
      if (isLive) {
        fetchTrades()
      }
    }, 5000) // Refresh every 5 seconds

    return () => clearInterval(interval)
  }, [fetchTrades, isLive])

  const formatTime = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000)
    if (seconds < 60) return `${seconds}s ago`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    return `${hours}h ago`
  }

  if (error && trades.length === 0) {
    return (
      <div className="bg-orderly-card rounded-xl border border-red-500/50 p-6">
        <p className="text-red-400">{error}</p>
      </div>
    )
  }

  return (
    <div className="bg-orderly-card rounded-xl border border-orderly-border overflow-hidden">
      <div className="px-6 py-4 border-b border-orderly-border flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Live Trades</h2>
          <p className="text-sm text-gray-400">Real-time trades from Orderly</p>
        </div>
        <button
          onClick={() => setIsLive(!isLive)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            isLive
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
          {isLive ? 'Live' : 'Paused'}
        </button>
      </div>

      <div className="divide-y divide-orderly-border max-h-[400px] overflow-y-auto">
        {isLoading ? (
          <div className="px-6 py-8 text-center text-gray-400">
            <div className="animate-spin w-6 h-6 border-2 border-orderly-purple border-t-transparent rounded-full mx-auto mb-2" />
            Loading trades...
          </div>
        ) : trades.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-400">
            No recent trades
          </div>
        ) : (
          trades.map((trade, index) => (
            <div
              key={trade.id}
              className={`px-6 py-3 flex items-center justify-between hover:bg-orderly-dark/50 transition-all ${
                index === 0 && isLive ? 'bg-orderly-dark/30' : ''
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${
                  trade.side === 'BUY'
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {trade.side === 'BUY' ? '↑' : '↓'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">{trade.symbol}</span>
                    <span className={`text-xs font-medium ${
                      trade.side === 'BUY' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {trade.side}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="font-mono">{trade.quantity.toFixed(4)}</span>
                    <span>•</span>
                    <span>{formatTime(trade.timestamp)}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="font-mono text-white">
                  {formatNumber(trade.notional)}
                </p>
                <p className="text-xs text-gray-500 font-mono">
                  @ ${trade.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
