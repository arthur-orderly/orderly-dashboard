'use client'

import { useState, useEffect } from 'react'
import { formatNumber, formatPercent } from '@/lib/api'

interface Market {
  symbol: string
  indexPrice: number
  change24h: number
  volume24h: number
  openInterest: number
  fundingRate: number
}

export default function TopMarkets() {
  const [markets, setMarkets] = useState<Market[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchMarkets() {
      try {
        const res = await fetch('/api/markets')
        const data = await res.json()
        if (data.success) {
          setMarkets(data.data.slice(0, 10))
        }
      } catch (err) {
        console.error('Failed to fetch markets:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchMarkets()
    const interval = setInterval(fetchMarkets, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="bg-orderly-card rounded-xl border border-orderly-border p-6">
        <div className="h-6 bg-orderly-border rounded w-40 mb-4"></div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-orderly-border rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-orderly-card rounded-xl border border-orderly-border overflow-hidden">
      <div className="px-6 py-4 border-b border-orderly-border">
        <h2 className="text-lg font-semibold text-white">Top Markets</h2>
        <p className="text-sm text-gray-400">By 24h trading volume</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs text-gray-400 uppercase tracking-wider">
              <th className="px-6 py-3 font-medium">Market</th>
              <th className="px-6 py-3 font-medium text-right">Price</th>
              <th className="px-6 py-3 font-medium text-right">24h Change</th>
              <th className="px-6 py-3 font-medium text-right">24h Volume</th>
              <th className="px-6 py-3 font-medium text-right">Open Interest</th>
              <th className="px-6 py-3 font-medium text-right">Funding</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-orderly-border">
            {markets.map((market) => (
              <tr key={market.symbol} className="hover:bg-orderly-dark/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orderly-purple to-orderly-cyan flex items-center justify-center text-xs font-bold text-white">
                      {market.symbol.replace('PERP_', '').replace('_USDC', '').slice(0, 3)}
                    </div>
                    <div>
                      <span className="font-medium text-white">{market.symbol.replace('PERP_', '').replace('_USDC', '')}</span>
                      <p className="text-xs text-gray-500">Perpetual</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="font-mono text-white">${market.indexPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className={`font-mono ${market.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {market.change24h >= 0 ? '+' : ''}{formatPercent(market.change24h)}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="font-mono text-gray-300">{formatNumber(market.volume24h)}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="font-mono text-gray-400">{formatNumber(market.openInterest)}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className={`font-mono ${market.fundingRate >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {market.fundingRate >= 0 ? '+' : ''}{formatPercent(market.fundingRate)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
