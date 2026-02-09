import { VaultInfo, formatVaultPnl, formatApy } from '@/lib/vaults'
import { formatNumber } from '@/lib/api'

interface VaultCardsProps {
  vaults: VaultInfo[]
}

function VaultCardItem({ vault }: { vault: VaultInfo }) {
  const isPositiveApy = vault.lifetime_apy >= 0
  const isPositivePnl = vault.vault_lifetime_net_pnl >= 0
  const isProtocol = vault.vault_type === 'protocol'

  return (
    <div className={`p-5 rounded-xl border transition-all card-hover ${
      isProtocol 
        ? 'bg-gradient-to-br from-orderly-purple/20 to-orderly-cyan/10 border-orderly-purple/30' 
        : 'bg-orderly-dark border-orderly-border'
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-white">{vault.vault_name}</h3>
            {isProtocol && (
              <span className="px-2 py-0.5 text-xs rounded bg-orderly-purple/30 text-orderly-purple font-medium">
                Protocol
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500">{vault.sp_name}</p>
        </div>
        <div className={`text-right`}>
          <p className={`text-2xl font-bold ${isPositiveApy ? 'text-green-400' : 'text-red-400'}`}>
            {formatApy(vault.lifetime_apy)}
          </p>
          <p className="text-xs text-gray-500">All-time APY</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-xs text-gray-500 mb-1">TVL</p>
          <p className="font-mono text-white">{formatNumber(vault.tvl)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">PnL</p>
          <p className={`font-mono ${isPositivePnl ? 'text-green-400' : 'text-red-400'}`}>
            {formatVaultPnl(vault.vault_lifetime_net_pnl)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Depositors</p>
          <p className="text-white">{vault.lp_counts}</p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-orderly-border/50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-500">{vault.vault_age} days active</span>
          <span className={`text-xs ${vault['30d_apy'] >= 0 ? 'text-green-400/70' : 'text-red-400/70'}`}>
            30d: {formatApy(vault['30d_apy'])}
          </span>
        </div>
        <button className="text-sm text-orderly-purple hover:text-orderly-cyan transition-colors font-medium">
          View Vault →
        </button>
      </div>
    </div>
  )
}

export default function VaultCards({ vaults }: VaultCardsProps) {
  const totalTvl = vaults.reduce((acc, v) => acc + v.tvl, 0)
  const totalPnl = vaults.reduce((acc, v) => acc + v.vault_lifetime_net_pnl, 0)
  
  // Sort: protocol vaults first, then by TVL
  const sortedVaults = [...vaults].sort((a, b) => {
    if (a.vault_type === 'protocol' && b.vault_type !== 'protocol') return -1
    if (a.vault_type !== 'protocol' && b.vault_type === 'protocol') return 1
    return b.tvl - a.tvl
  })

  return (
    <div className="bg-orderly-card rounded-xl border border-orderly-border overflow-hidden">
      <div className="px-6 py-4 border-b border-orderly-border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Vault Performance</h2>
            <p className="text-sm text-gray-400">Automated trading strategies</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-lg font-bold text-white">{formatNumber(totalTvl)}</p>
              <p className="text-xs text-gray-500">Total TVL</p>
            </div>
            <div className="text-right">
              <p className={`text-lg font-bold ${totalPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatVaultPnl(totalPnl)}
              </p>
              <p className="text-xs text-gray-500">Total PnL</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 grid gap-4">
        {sortedVaults.map((vault) => (
          <VaultCardItem key={vault.vault_id} vault={vault} />
        ))}
      </div>

      <div className="px-6 py-4 border-t border-orderly-border">
        <a 
          href="https://app.orderly.network/vaults" 
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-orderly-purple hover:text-orderly-cyan transition-colors font-medium"
        >
          Explore all vaults on Orderly →
        </a>
      </div>
    </div>
  )
}
