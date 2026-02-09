'use client'

import { useState, useEffect } from 'react'

// Known buyback transactions from multisig 0xb154...b839 (BNB Chain)
const BUYBACK_HISTORY = [
  { date: '2025-11-27', amount: 744245.70, usdAtTime: 99296 },
  { date: '2025-12-12', amount: 492317.33, usdAtTime: 52118 },
  { date: '2025-12-26', amount: 404489.57, usdAtTime: 38924 },
  { date: '2026-01-07', amount: 209808.85, usdAtTime: 21381 },
  { date: '2026-01-21', amount: 208247.13, usdAtTime: 16094 },
  { date: '2026-02-05', amount: 236176.50, usdAtTime: 13012 },
]

export default function BuybackCard() {
  const [price, setPrice] = useState<number>(0.0556)
  const [loading, setLoading] = useState(true)

  const totalORDER = BUYBACK_HISTORY.reduce((s, b) => s + b.amount, 0)
  const totalUSDSpent = BUYBACK_HISTORY.reduce((s, b) => s + b.usdAtTime, 0)

  useEffect(() => {
    async function fetchPrice() {
      try {
        const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=orderly-network&vs_currencies=usd')
        const data = await res.json()
        if (data['orderly-network']?.usd) {
          setPrice(data['orderly-network'].usd)
        }
      } catch (e) {
        // fallback price already set
      } finally {
        setLoading(false)
      }
    }
    fetchPrice()
  }, [])

  const currentValue = totalORDER * price

  return (
    <div className="bg-orderly-card rounded-xl p-6 border border-orderly-border card-hover col-span-2">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-400 font-medium">ORDER Buybacks</p>
          <p className="text-2xl font-bold text-white mt-1">
            {(totalORDER / 1_000_000).toFixed(2)}M ORDER
          </p>
          <p className="text-xs text-gray-500 mt-1">
            ${totalUSDSpent.toLocaleString()} spent • Worth ${Math.round(currentValue).toLocaleString()} now
          </p>
        </div>
        <div className="text-right">
          <a 
            href="https://debank.com/profile/0xb154de8a6d6377b028612d4d7942ca8771c4b839"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-orderly-purple hover:text-orderly-cyan transition-colors"
          >
            View wallet ↗
          </a>
          <p className="text-xs text-gray-500 mt-1">
            {BUYBACK_HISTORY.length} buybacks since Nov 2025
          </p>
          {!loading && (
            <p className="text-xs text-gray-500">
              ORDER @ ${price.toFixed(4)}
            </p>
          )}
        </div>
      </div>
      {/* Mini bar chart of buybacks */}
      <div className="flex items-end gap-1 mt-3 h-8">
        {BUYBACK_HISTORY.map((b, i) => {
          const maxAmount = Math.max(...BUYBACK_HISTORY.map(h => h.amount))
          const height = (b.amount / maxAmount) * 100
          return (
            <div key={i} className="flex-1 group relative">
              <div 
                className="bg-gradient-to-t from-orderly-purple to-orderly-cyan rounded-t opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
                style={{ height: `${height}%` }}
                title={`${b.date}: ${Math.round(b.amount).toLocaleString()} ORDER ($${b.usdAtTime.toLocaleString()})`}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
