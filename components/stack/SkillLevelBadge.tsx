interface SkillLevelBadgeProps {
  level: 'Beginner' | 'Intermediate' | 'Advanced'
  size?: 'small' | 'medium' | 'large'
}

const levelConfig = {
  'Beginner': {
    color: 'bg-green-100 border-green-300 text-green-800',
    icon: '🌱',
    description: 'Perfect for beginners just starting out'
  },
  'Intermediate': {
    color: 'bg-blue-100 border-blue-300 text-blue-800',
    icon: '📈',
    description: 'For those with some experience'
  },
  'Advanced': {
    color: 'bg-purple-100 border-purple-300 text-purple-800',
    icon: '⚡',
    description: 'For experienced professionals'
  }
}

export function SkillLevelBadge({ level, size = 'medium' }: SkillLevelBadgeProps) {
  const config = levelConfig[level]

  const sizeClasses = {
    small: 'px-2 py-1 text-xs',
    medium: 'px-3 py-1.5 text-sm',
    large: 'px-4 py-2 text-base'
  }

  return (
    <span className={`inline-block border rounded-full font-medium ${config.color} ${sizeClasses[size]}`}>
      {config.icon} {level} Level
    </span>
  )
}
