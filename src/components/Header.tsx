'use client'

export default function Header() {
  return (
    <header className="bg-orderly-card border-b border-orderly-border">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orderly-purple to-orderly-cyan flex items-center justify-center">
              <span className="text-white font-bold text-lg">O</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Orderly Dashboard</h1>
              <p className="text-sm text-gray-400">Real-time analytics for the permissionless liquidity layer</p>
            </div>
          </div>
          <a 
            href="https://orderly.network" 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-4 py-2 bg-orderly-purple hover:bg-orderly-purple/80 text-white rounded-lg transition-colors text-sm font-medium"
          >
            Visit Orderly →
          </a>
        </div>
      </div>
    </header>
  )
}
