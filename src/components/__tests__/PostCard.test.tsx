import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { PostCard } from '../PostCard'
import type { Post } from '@/types'

const mockPost: Post = {
  id: '1',
  title: 'Test Post',
  content: 'This is a test post content',
  name: 'Test User',
  avatar: 'https://example.com/avatar.jpg',
  createdAt: '2024-01-01T00:00:00Z',
}

describe('PostCard', () => {
  it('should render post information', () => {
    const onDelete = vi.fn()
    const onEdit = vi.fn()

    render(
      <MemoryRouter>
        <PostCard post={mockPost} onDelete={onDelete} onEdit={onEdit} />
      </MemoryRouter>
    )

    expect(screen.getByText('Test Post')).toBeInTheDocument()
    expect(screen.getByText(/This is a test post content/)).toBeInTheDocument()
    expect(screen.getByText('Test User')).toBeInTheDocument()
  })

  it('should truncate long content', () => {
    const longPost: Post = {
      ...mockPost,
      content: 'a'.repeat(300),
    }
    const onDelete = vi.fn()
    const onEdit = vi.fn()

    render(
      <MemoryRouter>
        <PostCard post={longPost} onDelete={onDelete} onEdit={onEdit} />
      </MemoryRouter>
    )

    // Buscar el contenido del post específicamente (no la fecha)
    // El contenido truncado debería tener 200 caracteres + "..."
    const content = screen.getByText(/^a{200}\.\.\./)
    expect(content).toBeInTheDocument()
    expect(content.textContent).toContain('...')
  })
})

