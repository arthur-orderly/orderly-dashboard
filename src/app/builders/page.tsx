import Navbar from '@/components/Navbar'
import BuilderLeaderboard from '@/components/BuilderLeaderboard'

export const metadata = {
  title: 'Builders | Orderly Dashboard',
  description: 'Top DEXs building on Orderly Network',
}

export default function BuildersPage() {
  return (
    <div className="min-h-screen bg-orderly-dark">
      <Navbar />
      
      <main className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1200px] mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Builder <span className="gradient-text">Leaderboard</span>
            </h1>
            <p className="text-gray-400">
              Top DEXs building on Orderly • Real-time data from the Orderly API
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-orderly-card rounded-xl border border-orderly-border p-6">
              <p className="text-sm text-gray-400 mb-1">Total Builders</p>
              <p className="text-3xl font-bold text-white">237+</p>
              <p className="text-xs text-gray-500 mt-1">DEXs on Orderly</p>
            </div>
            <div className="bg-orderly-card rounded-xl border border-orderly-border p-6">
              <p className="text-sm text-gray-400 mb-1">Total Volume</p>
              <p className="text-3xl font-bold text-white">$184B+</p>
              <p className="text-xs text-gray-500 mt-1">All-time trading volume</p>
            </div>
            <div className="bg-orderly-card rounded-xl border border-orderly-border p-6">
              <p className="text-sm text-gray-400 mb-1">Supported Chains</p>
              <p className="text-3xl font-bold text-white">15+</p>
              <p className="text-xs text-gray-500 mt-1">EVM & non-EVM chains</p>
            </div>
          </div>

          {/* Builder Leaderboard */}
          <BuilderLeaderboard />

          {/* CTA Section */}
          <div className="mt-8 bg-gradient-to-r from-orderly-purple/20 to-orderly-cyan/20 rounded-xl border border-orderly-purple/30 p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-3">Build Your Own DEX</h2>
            <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
              Launch a perpetual futures DEX in minutes with Orderly One. No coding required. 
              Connect to shared liquidity across 15+ chains with up to 100x leverage.
            </p>
            <a 
              href="https://dex.orderly.network" 
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-orderly-purple hover:bg-orderly-purple/80 text-white font-semibold rounded-lg transition-colors"
            >
              Start Building
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}
