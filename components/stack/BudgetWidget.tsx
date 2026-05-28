interface BudgetWidgetProps {
  budgetLevel: 'Free' | 'Free + Paid' | 'Premium' | 'Enterprise'
}

const budgetData = {
  'Free': {
    label: '$0/mo',
    description: 'All recommended tools have free tiers available. No subscription required.'
  },
  'Free + Paid': {
    label: '$50-200/mo',
    description: 'Mix of free tools and affordable paid subscriptions. Most tools offer free plans.'
  },
  'Premium': {
    label: '$200-500/mo',
    description: 'Investment in premium tools and services. Includes professional subscriptions.'
  },
  'Enterprise': {
    label: '$500+/mo',
    description: 'Enterprise-grade tools and dedicated services. Custom pricing negotiated.'
  }
}

export function BudgetWidget({ budgetLevel }: BudgetWidgetProps) {
  const budget = budgetData[budgetLevel]

  return (
    <div className="card">
      <h3 className="font-display font-bold text-sm mb-3">💰 Estimated Monthly Budget</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between py-2 border-b border-gray-100 pb-3">
          <span className="text-sm font-medium text-gray-600">Monthly Cost</span>
          <span className="font-bold text-lg text-primary">{budget.label}</span>
        </div>
        <p className="text-xs text-gray-500 leading-relaxed">
          {budget.description}
        </p>
      </div>
    </div>
  )
}
