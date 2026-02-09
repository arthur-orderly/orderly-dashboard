'use client'

import { useState } from 'react'
import { formatPrice, formatNumber, formatPercent } from '@/lib/api'

interface Market {
  symbol: string
  index_price: number
  mark_price: number
  open_interest: number
  '24h_volume': number
  '24h_amount': number
  '24h_high': number
  '24h_low': number
  '24h_open': number
  '24h_close': number
  est_funding_rate: number
}

interface MarketsTableProps {
  markets: Market[]
}

// Direct icon URLs for tokens not in standard repos
// Using DefiLlama and CoinMarketCap CDNs which allow direct access
const DIRECT_ICON_URLS: Record<string, string> = {
  // Commodities
  'XAG': 'https://s2.coinmarketcap.com/static/img/coins/64x64/29389.png',
  'XAU': 'https://s2.coinmarketcap.com/static/img/coins/64x64/29388.png',
  // Hyperliquid
  'HYPE': 'https://icons.llama.fi/hyperliquid.png',
  // Memecoins - using CoinCap
  'WIF': 'https://assets.coincap.io/assets/icons/wif@2x.png',
  'PEPE': 'https://assets.coincap.io/assets/icons/pepe@2x.png',
  'BONK': 'https://assets.coincap.io/assets/icons/bonk@2x.png',
  'FLOKI': 'https://assets.coincap.io/assets/icons/floki@2x.png',
  'SHIB': 'https://assets.coincap.io/assets/icons/shib@2x.png',
  'DOGE': 'https://assets.coincap.io/assets/icons/doge@2x.png',
  // CMC for newer tokens (using their IDs)
  'TRUMP': 'https://s2.coinmarketcap.com/static/img/coins/64x64/35336.png',
  'MELANIA': 'https://s2.coinmarketcap.com/static/img/coins/64x64/35347.png',
  'AI16Z': 'https://s2.coinmarketcap.com/static/img/coins/64x64/34096.png',
  'VIRTUAL': 'https://s2.coinmarketcap.com/static/img/coins/64x64/29420.png',
  'PENGU': 'https://s2.coinmarketcap.com/static/img/coins/64x64/33825.png',
  'FARTCOIN': 'https://s2.coinmarketcap.com/static/img/coins/64x64/33597.png',
  // Standard tokens
  'JUP': 'https://assets.coincap.io/assets/icons/jup@2x.png',
  'ENA': 'https://s2.coinmarketcap.com/static/img/coins/64x64/30171.png',
  'ONDO': 'https://s2.coinmarketcap.com/static/img/coins/64x64/21159.png',
  'W': 'https://s2.coinmarketcap.com/static/img/coins/64x64/29587.png',
  // Solana memes
  'POPCAT': 'https://s2.coinmarketcap.com/static/img/coins/64x64/28782.png',
  'MEW': 'https://s2.coinmarketcap.com/static/img/coins/64x64/30126.png',
  'BOME': 'https://s2.coinmarketcap.com/static/img/coins/64x64/29870.png',
  'MOTHER': 'https://s2.coinmarketcap.com/static/img/coins/64x64/31510.png',
}

// Map of symbol overrides for standard icon repo
const SYMBOL_ICON_MAP: Record<string, string> = {
  '1000PEPE': 'pepe',
  '1000BONK': 'bonk',
  '1000FLOKI': 'floki',
  '1000SHIB': 'shib',
  '1000WIF': 'wif',
  '1000MOG': 'mog',
  '1000000MOG': 'mog',
}

function TokenIcon({ symbol }: { symbol: string }) {
  const [imgError, setImgError] = useState(false)
  const [useFallback, setUseFallback] = useState(false)
  
  // Clean symbol
  const cleanSymbol = symbol.replace('PERP_', '').replace('_USDC', '')
  const baseSymbol = cleanSymbol.replace(/^1000000?/, '') // Remove 1000 or 1000000 prefix
  
  // Check for direct URL first
  const directUrl = DIRECT_ICON_URLS[cleanSymbol] || DIRECT_ICON_URLS[baseSymbol]
  
  // Get mapped symbol for standard repo
  const iconSymbol = SYMBOL_ICON_MAP[cleanSymbol] || cleanSymbol.toLowerCase()
  
  // Primary: direct URL or cryptocurrency-icons repo
  const primaryUrl = directUrl || `https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/${iconSymbol}.png`
  
  // Fallback: CoinGecko search (using base symbol)
  const fallbackUrl = `https://assets.coingecko.com/coins/images/1/small/${baseSymbol.toLowerCase()}.png`
  
  if (imgError && !useFallback && !directUrl) {
    // Try fallback
    setUseFallback(true)
    setImgError(false)
  }
  
  if (imgError) {
    // Final fallback to gradient with initials
    return (
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orderly-purple to-orderly-cyan flex items-center justify-center text-xs font-bold text-white">
        {baseSymbol.slice(0, 2)}
      </div>
    )
  }
  
  return (
    <img
      src={useFallback ? fallbackUrl : primaryUrl}
      alt={cleanSymbol}
      className="w-8 h-8 rounded-full bg-orderly-dark"
      onError={() => setImgError(true)}
    />
  )
}

export default function MarketsTable({ markets }: MarketsTableProps) {
  // Sort by 24h_amount (USD volume) descending
  const sortedMarkets = [...markets].sort((a, b) => (b['24h_amount'] || 0) - (a['24h_amount'] || 0))
  
  const calculateChange = (open: number, close: number) => {
    if (!open || !close) return 0
    return (close - open) / open
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
            {sortedMarkets.slice(0, 10).map((market) => {
              const change = calculateChange(market['24h_open'], market['24h_close'])
              const isPositive = change >= 0
              const symbol = market.symbol.replace('PERP_', '').replace('_USDC', '')
              
              return (
                <tr 
                  key={market.symbol}
                  className="hover:bg-orderly-dark/50 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <TokenIcon symbol={market.symbol} />
                      <div>
                        <p className="font-medium text-white">{symbol}</p>
                        <p className="text-xs text-gray-500">Perpetual</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <p className="font-mono text-white">
                      ${formatPrice(market.mark_price || market.index_price)}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                      {formatPercent(change)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <p className="font-mono text-white">
                      {formatNumber(market['24h_amount'] || 0)}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <p className="font-mono text-gray-300">
                      {formatNumber((market.open_interest || 0) * (market.mark_price || market.index_price || 0))}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`font-mono text-sm ${
                      (market.est_funding_rate || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {formatPercent(market.est_funding_rate || 0)}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-4 border-t border-orderly-border">
        <button className="text-sm text-orderly-purple hover:text-orderly-cyan transition-colors font-medium">
          View all markets →
        </button>
      </div>
    </div>
  )
}
