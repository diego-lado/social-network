import { describe, it, expect } from 'vitest'
import { buildCommentTree } from '../commentTree'
import type { Comment } from '@/types'

describe('buildCommentTree', () => {
  it('should build a tree from flat comments array', () => {
    const comments: Comment[] = [
      {
        id: '1',
        content: 'Root comment 1',
        name: 'User 1',
        avatar: 'avatar1.jpg',
        createdAt: '2024-01-01T00:00:00Z',
        parentId: null,
      },
      {
        id: '2',
        content: 'Reply to comment 1',
        name: 'User 2',
        avatar: 'avatar2.jpg',
        createdAt: '2024-01-01T01:00:00Z',
        parentId: '1',
      },
      {
        id: '3',
        content: 'Root comment 2',
        name: 'User 3',
        avatar: 'avatar3.jpg',
        createdAt: '2024-01-01T02:00:00Z',
        parentId: null,
      },
    ]

    const tree = buildCommentTree(comments)

    expect(tree).toHaveLength(2)
    expect(tree[0].id).toBe('3') // Newest first
    expect(tree[1].id).toBe('1')
    expect(tree[1].replies).toHaveLength(1)
    expect(tree[1].replies![0].id).toBe('2')
  })

  it('should handle nested replies', () => {
    const comments: Comment[] = [
      {
        id: '1',
        content: 'Root',
        name: 'User 1',
        avatar: 'avatar1.jpg',
        createdAt: '2024-01-01T00:00:00Z',
        parentId: null,
      },
      {
        id: '2',
        content: 'Reply 1',
        name: 'User 2',
        avatar: 'avatar2.jpg',
        createdAt: '2024-01-01T01:00:00Z',
        parentId: '1',
      },
      {
        id: '3',
        content: 'Reply to Reply 1',
        name: 'User 3',
        avatar: 'avatar3.jpg',
        createdAt: '2024-01-01T02:00:00Z',
        parentId: '2',
      },
    ]

    const tree = buildCommentTree(comments)

    expect(tree).toHaveLength(1)
    expect(tree[0].replies).toHaveLength(1)
    expect(tree[0].replies![0].replies).toHaveLength(1)
    expect(tree[0].replies![0].replies![0].id).toBe('3')
  })

  it('should return empty array for empty input', () => {
    const tree = buildCommentTree([])
    expect(tree).toHaveLength(0)
  })
})

