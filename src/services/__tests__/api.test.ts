/**
 * @vitest-environment node
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { Post, Comment } from '@/types'

// Mock de axios antes de importar el módulo api
vi.mock('axios', () => {
  const mockInstance = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  }
  return {
    default: {
      create: vi.fn(() => mockInstance),
    },
  }
})

// Importar api después del mock
import { api } from '../api'
import axios from 'axios'

// Obtener la instancia mockeada desde el resultado de create
const mockAxiosInstance = (axios.create as any).mock.results[0]?.value

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

        mockAxiosInstance.get.mockResolvedValueOnce({
          data: mockPosts,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {} as any,
        })

        const result = await api.getPosts()

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/post', {
          params: { page: 1, limit: 10, sortBy: 'createdAt', order: 'desc' }
        })
        expect(result).toEqual(mockPosts)
      })

      it('should fetch posts with custom pagination and sort order', async () => {
        const mockPosts: Post[] = []
        mockAxiosInstance.get.mockResolvedValueOnce({
          data: mockPosts,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {} as any,
        })

        await api.getPosts(2, 20, 'oldest')

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/post', {
          params: { page: 2, limit: 20, sortBy: 'createdAt', order: 'asc' }
        })
      })

      it('should throw error when fetch fails', async () => {
        mockAxiosInstance.get.mockRejectedValueOnce({
          response: {
            status: 500,
            data: { message: 'Server Error' },
          },
        })

        await expect(api.getPosts()).rejects.toThrow()
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

        mockAxiosInstance.get.mockResolvedValueOnce({
          data: mockPost,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {} as any,
        })

        const result = await api.getSinglePost('1')

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/post/1')
        expect(result).toEqual(mockPost)
      })

      it('should throw error when post not found', async () => {
        mockAxiosInstance.get.mockRejectedValueOnce({
          response: {
            status: 404,
            data: { message: 'Not Found' },
          },
        })

        await expect(api.getSinglePost('999')).rejects.toThrow()
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

        mockAxiosInstance.post.mockResolvedValueOnce({
          data: createdPost,
          status: 201,
          statusText: 'Created',
          headers: {},
          config: {} as any,
        })

        const result = await api.createPost(newPost)

        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/post', newPost)
        expect(result).toEqual(createdPost)
      })

      it('should throw error when creation fails', async () => {
        mockAxiosInstance.post.mockRejectedValueOnce({
          response: {
            status: 400,
            data: { message: 'Bad Request' },
          },
        })

        await expect(api.createPost({ title: 'Test' })).rejects.toThrow()
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

        mockAxiosInstance.put.mockResolvedValueOnce({
          data: updatedPost,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {} as any,
        })

        const result = await api.updatePost('1', updateData)

        expect(mockAxiosInstance.put).toHaveBeenCalledWith('/post/1', updateData)
        expect(result).toEqual(updatedPost)
      })

      it('should throw error when update fails', async () => {
        mockAxiosInstance.put.mockRejectedValueOnce({
          response: {
            status: 404,
            data: { message: 'Not Found' },
          },
        })

        await expect(api.updatePost('999', { title: 'Test' })).rejects.toThrow()
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

        mockAxiosInstance.delete.mockResolvedValueOnce({
          data: deletedPost,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {} as any,
        })

        const result = await api.deletePost('1')

        expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/post/1')
        expect(result).toEqual(deletedPost)
      })

      it('should throw error when deletion fails', async () => {
        mockAxiosInstance.delete.mockRejectedValueOnce({
          response: {
            status: 404,
            data: { message: 'Not Found' },
          },
        })

        await expect(api.deletePost('999')).rejects.toThrow()
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

        mockAxiosInstance.get.mockResolvedValueOnce({
          data: mockComments,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {} as any,
        })

        const result = await api.getComments('1')

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/post/1/comment')
        expect(result).toEqual(mockComments)
      })

      it('should return empty array when post has no comments', async () => {
        mockAxiosInstance.get.mockResolvedValueOnce({
          data: [],
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {} as any,
        })

        const result = await api.getComments('1')
        expect(result).toEqual([])
      })

      it('should throw error when fetch fails', async () => {
        mockAxiosInstance.get.mockRejectedValueOnce({
          response: {
            status: 500,
            data: { message: 'Server Error' },
          },
        })

        await expect(api.getComments('1')).rejects.toThrow()
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

        mockAxiosInstance.post.mockResolvedValueOnce({
          data: createdComment,
          status: 201,
          statusText: 'Created',
          headers: {},
          config: {} as any,
        })

        const result = await api.createComment('1', newComment)

        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/post/1/comment', newComment)
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

        mockAxiosInstance.post.mockResolvedValueOnce({
          data: createdReply,
          status: 201,
          statusText: 'Created',
          headers: {},
          config: {} as any,
        })

        const result = await api.createComment('1', replyComment)
        expect(result).toEqual(createdReply)
      })

      it('should throw error when creation fails', async () => {
        mockAxiosInstance.post.mockRejectedValueOnce({
          response: {
            status: 400,
            data: { message: 'Bad Request' },
          },
        })

        await expect(api.createComment('1', { content: 'Test' })).rejects.toThrow()
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

        mockAxiosInstance.put.mockResolvedValueOnce({
          data: updatedComment,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {} as any,
        })

        const result = await api.updateComment('1', '1', updateData)

        expect(mockAxiosInstance.put).toHaveBeenCalledWith('/post/1/comment/1', updateData)
        expect(result).toEqual(updatedComment)
      })

      it('should throw error when update fails', async () => {
        mockAxiosInstance.put.mockRejectedValueOnce({
          response: {
            status: 404,
            data: { message: 'Not Found' },
          },
        })

        await expect(api.updateComment('1', '999', { content: 'Test' })).rejects.toThrow()
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

        mockAxiosInstance.delete.mockResolvedValueOnce({
          data: deletedComment,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {} as any,
        })

        const result = await api.deleteComment('1', '1')

        expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/post/1/comment/1')
        expect(result).toEqual(deletedComment)
      })

      it('should throw error when deletion fails', async () => {
        mockAxiosInstance.delete.mockRejectedValueOnce({
          response: {
            status: 404,
            data: { message: 'Not Found' },
          },
        })

        await expect(api.deleteComment('1', '999')).rejects.toThrow()
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
        mockAxiosInstance.get.mockResolvedValueOnce({
          data: allComments,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {} as any,
        })

        // Mock deleteComment calls (4 times: for comment 1, 2, 3, and 4)
        const deletedComment = { id: '1', content: 'Deleted' }
        mockAxiosInstance.delete
          .mockResolvedValueOnce({ data: { ...deletedComment, id: '1' }, status: 200, statusText: 'OK', headers: {}, config: {} as any })
          .mockResolvedValueOnce({ data: { ...deletedComment, id: '2' }, status: 200, statusText: 'OK', headers: {}, config: {} as any })
          .mockResolvedValueOnce({ data: { ...deletedComment, id: '3' }, status: 200, statusText: 'OK', headers: {}, config: {} as any })
          .mockResolvedValueOnce({ data: { ...deletedComment, id: '4' }, status: 200, statusText: 'OK', headers: {}, config: {} as any })

        await api.deleteCommentRecursive('1', '1')

        // Should call getComments once
        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/post/1/comment')

        // Should delete all 4 comments (parent + 3 children)
        expect(mockAxiosInstance.delete).toHaveBeenCalledTimes(4)
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

        mockAxiosInstance.get.mockResolvedValueOnce({
          data: allComments,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {} as any,
        })

        const deletedComment = { id: '1', content: 'Deleted' }
        mockAxiosInstance.delete.mockResolvedValueOnce({
          data: deletedComment,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {} as any,
        })

        await api.deleteCommentRecursive('1', '1')

        // Should only delete the parent comment
        expect(mockAxiosInstance.delete).toHaveBeenCalledTimes(1)
      })

      it('should return early when post has no comments', async () => {
        mockAxiosInstance.get.mockResolvedValueOnce({
          data: [],
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {} as any,
        })

        await api.deleteCommentRecursive('1', '1')

        // Should only call getComments, no deleteComment calls
        expect(mockAxiosInstance.get).toHaveBeenCalledTimes(1)
        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/post/1/comment')
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

        mockAxiosInstance.get.mockResolvedValueOnce({
          data: allComments,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {} as any,
        })

        // First delete succeeds, second fails
        mockAxiosInstance.delete
          .mockResolvedValueOnce({ data: { id: '1' }, status: 200, statusText: 'OK', headers: {}, config: {} as any })
          .mockRejectedValueOnce({ response: { status: 500, data: { message: 'Server Error' } } })

        await api.deleteCommentRecursive('1', '1')

        // Should attempt to delete both comments
        expect(mockAxiosInstance.delete).toHaveBeenCalledTimes(2)
      })

      it('should throw error when getComments fails', async () => {
        mockAxiosInstance.get.mockRejectedValueOnce({
          response: {
            status: 500,
            data: { message: 'Server Error' },
          },
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

        mockAxiosInstance.get.mockResolvedValueOnce({
          data: comments,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {} as any,
        })

        const deletedComment = { id: '1', content: 'Deleted' }
        mockAxiosInstance.delete
          .mockResolvedValueOnce({ data: { ...deletedComment, id: '1' }, status: 200, statusText: 'OK', headers: {}, config: {} as any })
          .mockResolvedValueOnce({ data: { ...deletedComment, id: '2' }, status: 200, statusText: 'OK', headers: {}, config: {} as any })

        await api.deleteAllComments('1')

        // Should call getComments once and deleteComment twice
        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/post/1/comment')
        expect(mockAxiosInstance.delete).toHaveBeenCalledTimes(2)
      })

      it('should return early when post has no comments', async () => {
        mockAxiosInstance.get.mockResolvedValueOnce({
          data: [],
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {} as any,
        })

        await api.deleteAllComments('1')

        // Should only call getComments
        expect(mockAxiosInstance.get).toHaveBeenCalledTimes(1)
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

        mockAxiosInstance.get.mockResolvedValueOnce({
          data: comments,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {} as any,
        })

        // First delete succeeds, second fails
        mockAxiosInstance.delete
          .mockResolvedValueOnce({ data: { id: '1' }, status: 200, statusText: 'OK', headers: {}, config: {} as any })
          .mockRejectedValueOnce({ response: { status: 500, data: { message: 'Server Error' } } })

        await api.deleteAllComments('1')

        // Should attempt to delete both comments
        expect(mockAxiosInstance.delete).toHaveBeenCalledTimes(2)
      })

      it('should handle error when getComments fails gracefully', async () => {
        mockAxiosInstance.get.mockRejectedValueOnce({
          response: {
            status: 500,
            data: { message: 'Server Error' },
          },
        })

        // Should not throw, just log warning
        await expect(api.deleteAllComments('1')).resolves.toBeUndefined()
      })
    })
  })
})
