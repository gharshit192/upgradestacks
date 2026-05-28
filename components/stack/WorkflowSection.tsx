interface WorkflowSectionProps {
  description: string
}

export function WorkflowSection({ description }: WorkflowSectionProps) {
  return (
    <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 mb-8">
      <h3 className="font-display font-bold text-base mb-3 text-gray-900">
        💼 Typical Workflow
      </h3>
      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
        {description}
      </p>
    </div>
  )
}
