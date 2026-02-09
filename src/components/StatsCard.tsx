interface StatsCardProps {
  title: string
  value: string
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  icon?: React.ReactNode
  subtitle?: string
}

export default function StatsCard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon,
  subtitle,
}: StatsCardProps) {
  const changeColors = {
    positive: 'text-green-400',
    negative: 'text-red-400',
    neutral: 'text-gray-400',
  }

  return (
    <div className="bg-orderly-card rounded-xl p-6 border border-orderly-border card-hover">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-400 font-medium">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
          {change && (
            <p className={`text-sm mt-2 font-medium ${changeColors[changeType]}`}>
              {change}
            </p>
          )}
        </div>
        {icon && (
          <div className="p-3 rounded-lg bg-orderly-purple/10 text-orderly-purple">
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}
