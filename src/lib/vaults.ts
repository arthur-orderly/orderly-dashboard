// Orderly Vaults API utilities

const VAULTS_API = 'https://api-sv.orderly.org'

export interface VaultInfo {
  vault_id: string
  vault_name: string
  vault_type: 'protocol' | 'community'
  description: string
  sp_name: string  // Strategy Provider
  tvl: number
  lifetime_apy: number
  vault_lifetime_net_pnl: number
  lp_counts: number  // depositors
  vault_age: number  // days
  status: string
  '30d_apy': number
  performance_fee_rate: number
  supported_chains: { chain_id: string; chain_name: string }[]
}

export interface VaultsResponse {
  success: boolean
  data: { rows: VaultInfo[] }
  timestamp: number
}

export async function getVaults(): Promise<VaultInfo[]> {
  try {
    const res = await fetch(`${VAULTS_API}/v1/public/strategy_vault/vault/info`, {
      next: { revalidate: 60 }  // Cache for 60 seconds
    })
    const data: VaultsResponse = await res.json()
    
    if (data.success && data.data?.rows) {
      return data.data.rows
    }
    return []
  } catch (error) {
    console.error('Failed to fetch vaults:', error)
    return []
  }
}

export function formatVaultPnl(pnl: number): string {
  const sign = pnl >= 0 ? '+' : ''
  if (Math.abs(pnl) >= 1_000_000) {
    return `${sign}$${(pnl / 1_000_000).toFixed(2)}M`
  }
  if (Math.abs(pnl) >= 1_000) {
    return `${sign}$${(pnl / 1_000).toFixed(2)}K`
  }
  return `${sign}$${pnl.toFixed(2)}`
}

export function formatApy(apy: number): string {
  const sign = apy >= 0 ? '+' : ''
  return `${sign}${(apy * 100).toFixed(2)}%`
}
