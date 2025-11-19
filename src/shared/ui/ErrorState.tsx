interface ErrorStateProps {
  message: string
  action?: React.ReactNode
}

export function ErrorState({ message, action }: ErrorStateProps) {
  return (
    <div className="text-center py-12">
      <p className="text-red-600 mb-4">{message}</p>
      {action}
    </div>
  )
}





