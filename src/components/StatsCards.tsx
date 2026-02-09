'use client'

import { useState, useEffect } from 'react'
import { formatNumber } from '@/lib/api'

interface Stats {
  totalVolume: number
  traders: number
  builders: number
  markets: number
}

export default function StatsCards() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/stats')
        const data = await res.json()
        if (data.success) {
          setStats(data.data)
        }
      } catch (err) {
        console.error('Failed to fetch stats:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-orderly-card rounded-xl border border-orderly-border p-6 animate-pulse">
            <div className="h-4 bg-orderly-border rounded w-20 mb-2"></div>
            <div className="h-8 bg-orderly-border rounded w-28"></div>
          </div>
        ))}
      </div>
    )
  }

  const cards = [
    { label: 'Total Volume', value: formatNumber(stats?.totalVolume || 0), sub: 'All-time' },
    { label: 'Traders', value: `${Math.round((stats?.traders || 0) / 1000)}K+`, sub: '' },
    { label: 'Builders', value: stats?.builders?.toString() || '0', sub: `${stats?.markets || 0} markets` },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {cards.map((card, i) => (
        <div key={i} className="bg-orderly-card rounded-xl border border-orderly-border p-6">
          <p className="text-sm text-gray-400 mb-1">{card.label}</p>
          <p className="text-2xl font-bold text-white">{card.value}</p>
          {card.sub && <p className="text-xs text-gray-500 mt-1">{card.sub}</p>}
        </div>
      ))}
    </div>
  )
}
