interface LoadingOverlayProps {
  message?: string
}

export function LoadingOverlay({ message = 'Cargando...' }: LoadingOverlayProps) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl p-6 flex flex-col items-center gap-4 min-w-[200px]">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
        <p className="text-gray-700 font-medium">{message}</p>
      </div>
    </div>
  )
}





