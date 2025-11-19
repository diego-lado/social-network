/**
 * @vitest-environment node
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { api } from '../api'
import type { Post, Comment } from '@/types'

// Mock de fetch global
const mockFetch = vi.fn()
global.fetch = mockFetch as any

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset console.warn para evitar ruido en los tests
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Posts', () => {
    describe('getPosts', () => {
      it('should fetch posts successfully with default parameters', async () => {
        const mockPosts: Post[] = [
          {
            id: '1',
            title: 'Test Post 1',
            content: 'Content 1',
            name: 'User 1',
            avatar: 'avatar1.jpg',
            createdAt: '2024-01-01T00:00:00Z',
          },
          {
            id: '2',
            title: 'Test Post 2',
            content: 'Content 2',
            name: 'User 2',
            avatar: 'avatar2.jpg',
            createdAt: '2024-01-02T00:00:00Z',
          },
        ]

        ;(global.fetch as any).mockResolvedValueOnce({
          ok: true,
          json: async () => mockPosts,
        })

        const result = await api.getPosts()

        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/post?page=1&limit=10&sortBy=createdAt&order=desc')
        )
        expect(result).toEqual(mockPosts)
      })

      it('should fetch posts with custom pagination and sort order', async () => {
        const mockPosts: Post[] = []
        ;(global.fetch as any).mockResolvedValueOnce({
          ok: true,
          json: async () => mockPosts,
        })

        await api.getPosts(2, 20, 'oldest')

        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/post?page=2&limit=20&sortBy=createdAt&order=asc')
        )
      })

      it('should throw error when fetch fails', async () => {
        ;(global.fetch as any).mockResolvedValueOnce({
          ok: false,
          status: 500,
        })

        await expect(api.getPosts()).rejects.toThrow('Failed to fetch posts')
      })
    })

    describe('getSinglePost', () => {
      it('should fetch a single post successfully', async () => {
        const mockPost: Post = {
          id: '1',
          title: 'Test Post',
          content: 'Content',
          name: 'User',
          avatar: 'avatar.jpg',
          createdAt: '2024-01-01T00:00:00Z',
        }

        ;(global.fetch as any).mockResolvedValueOnce({
          ok: true,
          json: async () => mockPost,
        })

        const result = await api.getSinglePost('1')

        expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/post/1'))
        expect(result).toEqual(mockPost)
      })

      it('should throw error when post not found', async () => {
        ;(global.fetch as any).mockResolvedValueOnce({
          ok: false,
          status: 404,
        })

        await expect(api.getSinglePost('999')).rejects.toThrow('Failed to fetch post')
      })
    })

    describe('createPost', () => {
      it('should create a post successfully', async () => {
        const newPost: Partial<Post> = {
          title: 'New Post',
          content: 'New Content',
          name: 'User',
          avatar: 'avatar.jpg',
        }

        const createdPost: Post = {
          id: '1',
          ...newPost,
          createdAt: '2024-01-01T00:00:00Z',
        } as Post

        ;(global.fetch as any).mockResolvedValueOnce({
          ok: true,
          json: async () => createdPost,
        })

        const result = await api.createPost(newPost)

        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/post'),
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(newPost),
          }
        )
        expect(result).toEqual(createdPost)
      })

      it('should throw error when creation fails', async () => {
        ;(global.fetch as any).mockResolvedValueOnce({
          ok: false,
          status: 400,
        })

        await expect(api.createPost({ title: 'Test' })).rejects.toThrow('Failed to create post')
      })
    })

    describe('updatePost', () => {
      it('should update a post successfully', async () => {
        const updateData: Partial<Post> = {
          title: 'Updated Title',
          content: 'Updated Content',
        }

        const updatedPost: Post = {
          id: '1',
          title: 'Updated Title',
          content: 'Updated Content',
          name: 'User',
          avatar: 'avatar.jpg',
          createdAt: '2024-01-01T00:00:00Z',
        }

        ;(global.fetch as any).mockResolvedValueOnce({
          ok: true,
          json: async () => updatedPost,
        })

        const result = await api.updatePost('1', updateData)

        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/post/1'),
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateData),
          }
        )
        expect(result).toEqual(updatedPost)
      })

      it('should throw error when update fails', async () => {
        ;(global.fetch as any).mockResolvedValueOnce({
          ok: false,
          status: 404,
        })

        await expect(api.updatePost('999', { title: 'Test' })).rejects.toThrow('Failed to update post')
      })
    })

    describe('deletePost', () => {
      it('should delete a post successfully', async () => {
        const deletedPost: Post = {
          id: '1',
          title: 'Deleted Post',
          content: 'Content',
          name: 'User',
          avatar: 'avatar.jpg',
          createdAt: '2024-01-01T00:00:00Z',
        }

        ;(global.fetch as any).mockResolvedValueOnce({
          ok: true,
          json: async () => deletedPost,
        })

        const result = await api.deletePost('1')

        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/post/1'),
          {
            method: 'DELETE',
          }
        )
        expect(result).toEqual(deletedPost)
      })

      it('should throw error when deletion fails', async () => {
        ;(global.fetch as any).mockResolvedValueOnce({
          ok: false,
          status: 404,
        })

        await expect(api.deletePost('999')).rejects.toThrow('Failed to delete post')
      })
    })
  })

  describe('Comments', () => {
    describe('getComments', () => {
      it('should fetch comments successfully', async () => {
        const mockComments: Comment[] = [
          {
            id: '1',
            content: 'Comment 1',
            name: 'User 1',
            avatar: 'avatar1.jpg',
            createdAt: '2024-01-01T00:00:00Z',
            parentId: null,
          },
          {
            id: '2',
            content: 'Comment 2',
            name: 'User 2',
            avatar: 'avatar2.jpg',
            createdAt: '2024-01-02T00:00:00Z',
            parentId: '1',
          },
        ]

        ;(global.fetch as any).mockResolvedValueOnce({
          ok: true,
          json: async () => mockComments,
        })

        const result = await api.getComments('1')

        expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/post/1/comment'))
        expect(result).toEqual(mockComments)
      })

      it('should return empty array when post has no comments', async () => {
        ;(global.fetch as any).mockResolvedValueOnce({
          ok: true,
          json: async () => [],
        })

        const result = await api.getComments('1')
        expect(result).toEqual([])
      })

      it('should throw error when fetch fails', async () => {
        ;(global.fetch as any).mockResolvedValueOnce({
          ok: false,
          status: 500,
        })

        await expect(api.getComments('1')).rejects.toThrow('Failed to fetch comments')
      })
    })

    describe('createComment', () => {
      it('should create a root comment successfully', async () => {
        const newComment: Partial<Comment> = {
          content: 'New Comment',
          name: 'User',
          avatar: 'avatar.jpg',
          parentId: null,
        }

        const createdComment: Comment = {
          id: '1',
          ...newComment,
          createdAt: '2024-01-01T00:00:00Z',
        } as Comment

        ;(global.fetch as any).mockResolvedValueOnce({
          ok: true,
          json: async () => createdComment,
        })

        const result = await api.createComment('1', newComment)

        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/post/1/comment'),
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(newComment),
          }
        )
        expect(result).toEqual(createdComment)
      })

      it('should create a reply comment successfully', async () => {
        const replyComment: Partial<Comment> = {
          content: 'Reply',
          name: 'User',
          avatar: 'avatar.jpg',
          parentId: '1',
        }

        const createdReply: Comment = {
          id: '2',
          ...replyComment,
          createdAt: '2024-01-01T00:00:00Z',
        } as Comment

        ;(global.fetch as any).mockResolvedValueOnce({
          ok: true,
          json: async () => createdReply,
        })

        const result = await api.createComment('1', replyComment)
        expect(result).toEqual(createdReply)
      })

      it('should throw error when creation fails', async () => {
        ;(global.fetch as any).mockResolvedValueOnce({
          ok: false,
          status: 400,
        })

        await expect(api.createComment('1', { content: 'Test' })).rejects.toThrow('Failed to create comment')
      })
    })

    describe('updateComment', () => {
      it('should update a comment successfully', async () => {
        const updateData: Partial<Comment> = {
          content: 'Updated Comment',
        }

        const updatedComment: Comment = {
          id: '1',
          content: 'Updated Comment',
          name: 'User',
          avatar: 'avatar.jpg',
          createdAt: '2024-01-01T00:00:00Z',
          parentId: null,
        }

        ;(global.fetch as any).mockResolvedValueOnce({
          ok: true,
          json: async () => updatedComment,
        })

        const result = await api.updateComment('1', '1', updateData)

        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/post/1/comment/1'),
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateData),
          }
        )
        expect(result).toEqual(updatedComment)
      })

      it('should throw error when update fails', async () => {
        ;(global.fetch as any).mockResolvedValueOnce({
          ok: false,
          status: 404,
        })

        await expect(api.updateComment('1', '999', { content: 'Test' })).rejects.toThrow('Failed to update comment')
      })
    })

    describe('deleteComment', () => {
      it('should delete a comment successfully', async () => {
        const deletedComment: Comment = {
          id: '1',
          content: 'Deleted Comment',
          name: 'User',
          avatar: 'avatar.jpg',
          createdAt: '2024-01-01T00:00:00Z',
          parentId: null,
        }

        ;(global.fetch as any).mockResolvedValueOnce({
          ok: true,
          json: async () => deletedComment,
        })

        const result = await api.deleteComment('1', '1')

        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/post/1/comment/1'),
          {
            method: 'DELETE',
          }
        )
        expect(result).toEqual(deletedComment)
      })

      it('should throw error when deletion fails', async () => {
        ;(global.fetch as any).mockResolvedValueOnce({
          ok: false,
          status: 404,
        })

        await expect(api.deleteComment('1', '999')).rejects.toThrow('Failed to delete comment')
      })
    })

    describe('deleteCommentRecursive', () => {
      it('should delete a comment and all its children', async () => {
        const allComments: Comment[] = [
          {
            id: '1',
            content: 'Parent',
            name: 'User 1',
            avatar: 'avatar1.jpg',
            createdAt: '2024-01-01T00:00:00Z',
            parentId: null,
          },
          {
            id: '2',
            content: 'Child 1',
            name: 'User 2',
            avatar: 'avatar2.jpg',
            createdAt: '2024-01-02T00:00:00Z',
            parentId: '1',
          },
          {
            id: '3',
            content: 'Child 2',
            name: 'User 3',
            avatar: 'avatar3.jpg',
            createdAt: '2024-01-03T00:00:00Z',
            parentId: '1',
          },
          {
            id: '4',
            content: 'Grandchild',
            name: 'User 4',
            avatar: 'avatar4.jpg',
            createdAt: '2024-01-04T00:00:00Z',
            parentId: '2',
          },
        ]

        // Mock getComments
        ;(global.fetch as any).mockResolvedValueOnce({
          ok: true,
          json: async () => allComments,
        })

        // Mock deleteComment calls (4 times: for comment 1, 2, 3, and 4)
        const deletedComment = { id: '1', content: 'Deleted' }
        ;(global.fetch as any)
          .mockResolvedValueOnce({ ok: true, json: async () => ({ ...deletedComment, id: '1' }) })
          .mockResolvedValueOnce({ ok: true, json: async () => ({ ...deletedComment, id: '2' }) })
          .mockResolvedValueOnce({ ok: true, json: async () => ({ ...deletedComment, id: '3' }) })
          .mockResolvedValueOnce({ ok: true, json: async () => ({ ...deletedComment, id: '4' }) })

        await api.deleteCommentRecursive('1', '1')

        // Should call getComments once
        expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/post/1/comment'))

        // Should delete all 4 comments (parent + 3 children)
        expect(global.fetch).toHaveBeenCalledTimes(5) // 1 getComments + 4 deleteComment
      })

      it('should handle comment with no children', async () => {
        const allComments: Comment[] = [
          {
            id: '1',
            content: 'Parent',
            name: 'User 1',
            avatar: 'avatar1.jpg',
            createdAt: '2024-01-01T00:00:00Z',
            parentId: null,
          },
        ]

        ;(global.fetch as any).mockResolvedValueOnce({
          ok: true,
          json: async () => allComments,
        })

        const deletedComment = { id: '1', content: 'Deleted' }
        ;(global.fetch as any).mockResolvedValueOnce({
          ok: true,
          json: async () => deletedComment,
        })

        await api.deleteCommentRecursive('1', '1')

        // Should only delete the parent comment
        expect(global.fetch).toHaveBeenCalledTimes(2) // 1 getComments + 1 deleteComment
      })

      it('should return early when post has no comments', async () => {
        ;(global.fetch as any).mockResolvedValueOnce({
          ok: true,
          json: async () => [],
        })

        await api.deleteCommentRecursive('1', '1')

        // Should only call getComments, no deleteComment calls
        expect(global.fetch).toHaveBeenCalledTimes(1)
        expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/post/1/comment'))
      })

      it('should continue deleting even if some deletions fail', async () => {
        const allComments: Comment[] = [
          {
            id: '1',
            content: 'Parent',
            name: 'User 1',
            avatar: 'avatar1.jpg',
            createdAt: '2024-01-01T00:00:00Z',
            parentId: null,
          },
          {
            id: '2',
            content: 'Child',
            name: 'User 2',
            avatar: 'avatar2.jpg',
            createdAt: '2024-01-02T00:00:00Z',
            parentId: '1',
          },
        ]

        ;(global.fetch as any).mockResolvedValueOnce({
          ok: true,
          json: async () => allComments,
        })

        // First delete succeeds, second fails
        ;(global.fetch as any)
          .mockResolvedValueOnce({ ok: true, json: async () => ({ id: '1' }) })
          .mockResolvedValueOnce({ ok: false, status: 500 })

        await api.deleteCommentRecursive('1', '1')

        // Should attempt to delete both comments
        expect(global.fetch).toHaveBeenCalledTimes(3) // 1 getComments + 2 deleteComment attempts
      })

      it('should throw error when getComments fails', async () => {
        ;(global.fetch as any).mockResolvedValueOnce({
          ok: false,
          status: 500,
        })

        await expect(api.deleteCommentRecursive('1', '1')).rejects.toThrow()
      })
    })

    describe('deleteAllComments', () => {
      it('should delete all comments of a post', async () => {
        const comments: Comment[] = [
          {
            id: '1',
            content: 'Comment 1',
            name: 'User 1',
            avatar: 'avatar1.jpg',
            createdAt: '2024-01-01T00:00:00Z',
            parentId: null,
          },
          {
            id: '2',
            content: 'Comment 2',
            name: 'User 2',
            avatar: 'avatar2.jpg',
            createdAt: '2024-01-02T00:00:00Z',
            parentId: null,
          },
        ]

        ;(global.fetch as any).mockResolvedValueOnce({
          ok: true,
          json: async () => comments,
        })

        const deletedComment = { id: '1', content: 'Deleted' }
        ;(global.fetch as any)
          .mockResolvedValueOnce({ ok: true, json: async () => ({ ...deletedComment, id: '1' }) })
          .mockResolvedValueOnce({ ok: true, json: async () => ({ ...deletedComment, id: '2' }) })

        await api.deleteAllComments('1')

        // Should call getComments once and deleteComment twice
        expect(global.fetch).toHaveBeenCalledTimes(3) // 1 getComments + 2 deleteComment
        expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/post/1/comment'))
      })

      it('should return early when post has no comments', async () => {
        ;(global.fetch as any).mockResolvedValueOnce({
          ok: true,
          json: async () => [],
        })

        await api.deleteAllComments('1')

        // Should only call getComments
        expect(global.fetch).toHaveBeenCalledTimes(1)
      })

      it('should continue deleting even if some deletions fail', async () => {
        const comments: Comment[] = [
          {
            id: '1',
            content: 'Comment 1',
            name: 'User 1',
            avatar: 'avatar1.jpg',
            createdAt: '2024-01-01T00:00:00Z',
            parentId: null,
          },
          {
            id: '2',
            content: 'Comment 2',
            name: 'User 2',
            avatar: 'avatar2.jpg',
            createdAt: '2024-01-02T00:00:00Z',
            parentId: null,
          },
        ]

        ;(global.fetch as any).mockResolvedValueOnce({
          ok: true,
          json: async () => comments,
        })

        // First delete succeeds, second fails
        ;(global.fetch as any)
          .mockResolvedValueOnce({ ok: true, json: async () => ({ id: '1' }) })
          .mockResolvedValueOnce({ ok: false, status: 500 })

        await api.deleteAllComments('1')

        // Should attempt to delete both comments
        expect(global.fetch).toHaveBeenCalledTimes(3) // 1 getComments + 2 deleteComment attempts
      })

      it('should handle error when getComments fails gracefully', async () => {
        ;(global.fetch as any).mockResolvedValueOnce({
          ok: false,
          status: 500,
        })

        // Should not throw, just log warning
        await expect(api.deleteAllComments('1')).resolves.toBeUndefined()
      })
    })
  })
})

