import { lazy } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from '@/shared/layout/Layout'
import { ToastProvider } from '@/shared/ui/ToastProvider'

// Lazy load de páginas para code splitting
const PostsList = lazy(() => import('./pages/PostsList').then(module => ({ default: module.PostsList })))
const PostDetail = lazy(() => import('./pages/PostDetail').then(module => ({ default: module.PostDetail })))

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<PostsList />} />
            <Route path="/post/:postId" element={<PostDetail />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </ToastProvider>
  )
}

export default App

