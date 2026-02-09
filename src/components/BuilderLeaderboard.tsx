'use client'

import { useEffect, useState } from 'react'
import { formatNumber } from '@/lib/api'

interface BuilderData {
  broker_id: string
  broker_name: string
  volume_30d: number
  volume_7d: number
  volume_24h: number
  volume_ytd?: number
  volume_ltd?: number
  connected_users?: number
}

// Builder metadata with logos (verified Feb 2026)
// Priority: 1) Official site favicon 2) CoinGecko/CMC 3) DefiLlama
const BUILDER_META: Record<string, { description?: string; website?: string; token?: string; logo?: string }> = {
  orderly: {
    description: 'The permissionless liquidity layer for Web3 trading',
    website: 'https://orderly.network',
    token: 'ORDER',
    logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/28931.png'
  },
  raydium: { 
    description: 'On-chain order book AMM powering DeFi evolution', 
    website: 'https://perps.raydium.io', 
    token: 'RAY',
    logo: 'https://assets.coingecko.com/coins/images/13928/small/PSigc4ie_400x400.jpg'
  },
  kodiak: { 
    description: "Berachain's native liquidity platform", 
    website: 'https://perps.kodiak.finance', 
    token: 'KDK',
    logo: 'https://perps.kodiak.finance/favicon.ico'
  },
  aden: { 
    description: 'Pro-Grade Order Book DEX for Everyone', 
    website: 'https://perp.aden.io', 
    token: 'BGSC',
    logo: 'https://www.aden.io/static/images/logo.webp'
  },
  woofi_pro: { 
    description: 'All the tools you need, in one place. The home of $WOO', 
    website: 'https://fi.woo.org', 
    token: 'WOO',
    logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/7501.png'
  },
  aegisdex: { 
    description: 'Decentralized Trading with Yield-Bearing Collateral', 
    website: 'https://app.aegisdex.io',
    logo: 'https://pbs.twimg.com/profile_images/1847661499159699456/lLHJHMrE_400x400.jpg'
  },
  berrie: { 
    description: 'Fresh perpetual trading on Berachain', 
    website: 'https://berrie.exchange',
    logo: 'https://pbs.twimg.com/profile_images/1888595691590082560/9Ii3fH5a_400x400.jpg'
  },
  vooi: { 
    description: 'Trade perpetuals across chains', 
    website: 'https://vooi.io',
    logo: 'https://vooi.io/favicon.ico'
  },
  logx: { 
    description: 'Omnichain perpetual trading', 
    website: 'https://app.logx.trade', 
    token: 'LOGX',
    logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/29555.png'
  },
  quick_perps: { 
    description: 'QuickSwap perpetuals powered by Orderly', 
    website: 'https://perps.quickswap.exchange', 
    token: 'QUICK',
    logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/8206.png'
  },
  what_exchange: { 
    description: 'DeFi-centric, community focused. Built by Traders.', 
    website: 'https://trade.what.exchange',
    logo: 'https://trade.what.exchange/favicon.ico'
  },
  velto: { 
    description: 'Next-gen perpetual DEX', 
    website: 'https://velto.io',
    logo: 'https://velto.io/favicon.ico'
  },
  bitoro_network: { 
    description: 'Decentralized perpetuals exchange', 
    website: 'https://bitoro.network',
    logo: 'https://icons.llama.fi/bitoro-network.png'
  },
  tealstreet: { 
    description: 'Professional trading terminal', 
    website: 'https://tealstreet.io',
    logo: 'https://tealstreet.io/favicon.ico'
  },
  pnut: { 
    description: 'Nutty perpetual trading', 
    website: 'https://nuttydex.xyz',
    logo: 'https://nuttydex.xyz/favicon.ico'
  },
  perpsdao: { 
    description: 'Community-driven perpetuals', 
    website: 'https://perpsdao.xyz',
    logo: 'https://perpsdao.xyz/favicon.ico'
  },
  dextools: { 
    description: 'DEX trading tools and analytics', 
    website: 'https://dextools.io', 
    token: 'DEXT',
    logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/15473.png'
  },
  jojo: { 
    description: 'Perpetual DEX on Base', 
    website: 'https://jojo.exchange',
    logo: 'https://jojo.exchange/favicon.ico'
  },
  saros: { 
    description: 'DeFi super network on Solana', 
    website: 'https://saros.finance', 
    token: 'SAROS',
    logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/18279.png'
  },
}

function BuilderIcon({ brokerId, name }: { brokerId: string; name: string }) {
  const [imgError, setImgError] = useState(false)
  const meta = BUILDER_META[brokerId]
  
  if (!meta?.logo || imgError) {
    return (
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orderly-purple to-orderly-cyan flex items-center justify-center text-xs font-bold text-white">
        {name.slice(0, 2).toUpperCase()}
      </div>
    )
  }
  
  return (
    <img
      src={meta.logo}
      alt={name}
      className="w-8 h-8 rounded-lg bg-orderly-dark object-cover"
      onError={() => setImgError(true)}
    />
  )
}

export default function BuilderLeaderboard() {
  const [builders, setBuilders] = useState<BuilderData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  useEffect(() => {
    async function fetchBuilders() {
      try {
        const res = await fetch('/api/builders')
        const json = await res.json()
        
        if (!json.success) {
          throw new Error(json.error || 'Failed to fetch')
        }
        
        setBuilders(json.data)
        setLastUpdated(new Date(json.timestamp))
        setError(null)
      } catch (err) {
        console.error('Failed to fetch builders:', err)
        setError('Failed to load builder data')
      } finally {
        setLoading(false)
      }
    }

    fetchBuilders()
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchBuilders, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const totalVolume = builders.reduce((acc, b) => acc + b.volume_30d, 0)
  const topBuilders = builders.slice(0, 20) // Show top 20

  if (loading) {
    return (
      <div className="bg-orderly-card rounded-xl border border-orderly-border p-8">
        <div className="flex items-center justify-center gap-3">
          <div className="w-5 h-5 border-2 border-orderly-purple border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-400">Loading builder data from Orderly API...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-orderly-card rounded-xl border border-orderly-border p-8">
        <div className="text-center text-red-400">
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-orderly-purple/20 rounded-lg hover:bg-orderly-purple/30 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-orderly-card rounded-xl border border-orderly-border overflow-hidden">
      <div className="px-6 py-4 border-b border-orderly-border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Builder Leaderboard</h2>
            <p className="text-sm text-gray-400">Top DEXs on Orderly by 30-day volume • Live data</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Total 30d Volume (Top {topBuilders.length})</p>
            <p className="text-lg font-bold text-white">{formatNumber(totalVolume)}</p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs text-gray-400 uppercase tracking-wider">
              <th className="px-6 py-3 font-medium">#</th>
              <th className="px-6 py-3 font-medium">Builder</th>
              <th className="px-6 py-3 font-medium text-right">Volume (30d)</th>
              <th className="px-6 py-3 font-medium text-right">Volume (7d)</th>
              <th className="px-6 py-3 font-medium text-right">Volume (24h)</th>
              <th className="px-6 py-3 font-medium text-right">Token</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-orderly-border">
            {topBuilders.map((builder, index) => {
              const rank = index + 1
              const meta = BUILDER_META[builder.broker_id] || {}
              
              return (
                <tr 
                  key={builder.broker_id}
                  className="hover:bg-orderly-dark/50 transition-colors cursor-pointer"
                  onClick={() => meta.website && window.open(meta.website, '_blank')}
                >
                  <td className="px-6 py-4">
                    <span className={`font-bold ${
                      rank === 1 ? 'text-yellow-400' :
                      rank === 2 ? 'text-gray-300' :
                      rank === 3 ? 'text-amber-600' :
                      'text-gray-500'
                    }`}>
                      {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <BuilderIcon brokerId={builder.broker_id} name={builder.broker_name} />
                      <div>
                        <span className="font-medium text-white">{builder.broker_name}</span>
                        {meta.description && (
                          <p className="text-xs text-gray-500 max-w-[200px] truncate">{meta.description}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-mono text-white">{formatNumber(builder.volume_30d)}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-mono text-gray-300">{formatNumber(builder.volume_7d)}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-mono text-gray-400">{formatNumber(builder.volume_24h)}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {meta.token ? (
                      <span className="text-orderly-cyan font-medium">${meta.token}</span>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-4 border-t border-orderly-border flex items-center justify-between">
        <span className="text-sm text-gray-500">
          {builders.length} active builders
          {lastUpdated && (
            <span className="ml-2 text-gray-600">
              • Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </span>
        <a 
          href="https://dex.orderly.network/board" 
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-orderly-purple hover:text-orderly-cyan transition-colors font-medium"
        >
          View all on Orderly One →
        </a>
      </div>
    </div>
  )
}
