import { Link } from 'react-router-dom'
import { ChatBubbleIcon } from '@/shared/icons/Icons'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            to="/"
            className="flex items-center gap-2 text-primary-600 hover:text-primary-700 transition-colors"
          >
            <ChatBubbleIcon className="w-6 h-6" />
            <h1 className="text-2xl font-bold">Social Network</h1>
          </Link>
        </div>
      </header>
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center text-gray-600 text-sm">
          © 2025 Social Network
        </div>
      </footer>
    </div>
  )
}





