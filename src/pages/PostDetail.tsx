import { useState, lazy, Suspense, useCallback, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeftIcon } from '@/shared/icons/Icons'
import * as Avatar from '@radix-ui/react-avatar'
import { OptionsMenu } from '@/shared/ui/OptionsMenu'
import { api } from '@/services/api'
import { buildCommentTree } from '@/utils/commentTree'
import { formatRelativeTime } from '@/utils/date'
import { CommentTree } from '@/components/CommentTree'
import { CommentForm } from '@/components/CommentForm'
import { CommentFormModal } from '@/components/CommentFormModal'
import { LoadingOverlay } from '@/shared/ui/LoadingOverlay'
import { LoadingState } from '@/shared/ui/LoadingState'
import { ErrorState } from '@/shared/ui/ErrorState'
import { Button } from '@/shared/ui/Button'
import { useToast } from '@/shared/ui/useToast'
import type { Comment } from '@/types'

// Lazy load de componentes pesados
const ConfirmDialog = lazy(() => import('@/shared/ui/ConfirmDialog').then(module => ({ default: module.ConfirmDialog })))

export function PostDetail() {
  const { postId } = useParams<{ postId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const toast = useToast()
  const [deletePostConfirm, setDeletePostConfirm] = useState(false)
  const [deleteCommentConfirm, setDeleteCommentConfirm] = useState<{ isOpen: boolean; commentId: string | null }>({
    isOpen: false,
    commentId: null,
  })
  const [isCommentFormOpen, setIsCommentFormOpen] = useState(false)
  const [editingComment, setEditingComment] = useState<Comment | null>(null)
  const postErrorShownRef = useRef(false)

  const { data: post, isLoading: postLoading, error: postError } = useQuery({
    queryKey: ['post', postId],
    queryFn: () => api.getSinglePost(postId!),
    enabled: !!postId,
  })

  const { data: comments, isLoading: commentsLoading } = useQuery({
    queryKey: ['comments', postId],
    queryFn: () => api.getComments(postId!),
    enabled: !!postId,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  })

  // Toast para errores al cargar el post
  useEffect(() => {
    if (postError && !postErrorShownRef.current) {
      postErrorShownRef.current = true
      toast.error('Error al cargar el post. Por favor, intenta nuevamente.')
    }
    if (!postError) {
      postErrorShownRef.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postError])

  const deletePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      // Primero borrar todos los comentarios del post
      await api.deleteAllComments(postId)
      // Luego borrar el post
      return api.deletePost(postId)
    },
    onSuccess: (_, deletedPostId) => {
      // Invalidar lista de posts
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      // Remover el caché del post específico
      queryClient.removeQueries({ queryKey: ['post', deletedPostId] })
      // Remover todos los comentarios asociados a ese post
      queryClient.removeQueries({ queryKey: ['comments', deletedPostId] })
      toast.success('Post eliminado correctamente')
      navigate('/')
    },
    onError: () => {
      toast.error('Error al eliminar el post. Por favor, intenta nuevamente.')
    },
  })

  const createCommentMutation = useMutation({
    mutationFn: ({ content, name, avatar, parentId }: {
      content: string
      name: string
      avatar: string
      parentId: string | null
    }) => {
      return api.createComment(postId!, {
        content,
        name,
        avatar,
        parentId,
        createdAt: new Date().toISOString(),
      })
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] })
      if (variables.parentId) {
        toast.success('Respuesta creada correctamente')
      } else {
        toast.success('Comentario creado correctamente')
      }
    },
    onError: () => {
      toast.error('Error al crear el comentario. Por favor, intenta nuevamente.')
    },
  })

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => api.deleteCommentRecursive(postId!, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] })
      toast.success('Comentario eliminado correctamente')
    },
    onError: () => {
      toast.error('Error al eliminar el comentario. Por favor, intenta nuevamente.')
    },
  })

  const updateCommentMutation = useMutation({
    mutationFn: ({ commentId, content, name, avatar }: {
      commentId: string
      content: string
      name: string
      avatar: string
    }) => {
      return api.updateComment(postId!, commentId, {
        content,
        name,
        avatar,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] })
      toast.success('Comentario actualizado correctamente')
    },
    onError: () => {
      toast.error('Error al actualizar el comentario. Por favor, intenta nuevamente.')
    },
  })

  const handleDeletePost = useCallback(() => {
    setDeletePostConfirm(true)
  }, [])

  const confirmDeletePost = useCallback(() => {
    if (postId) {
      deletePostMutation.mutate(postId)
    }
  }, [postId, deletePostMutation])

  const handleCreateComment = useCallback((content: string, name: string, avatar: string) => {
    if (postId) {
      createCommentMutation.mutate({
        content,
        name,
        avatar,
        parentId: null,
      })
    }
  }, [postId, createCommentMutation])

  const handleReplyComment = useCallback((
    parentId: string,
    content: string,
    name: string,
    avatar: string
  ) => {
    if (postId) {
      createCommentMutation.mutate({
        content,
        name,
        avatar,
        parentId,
      })
    }
  }, [postId, createCommentMutation])

  const handleDeleteComment = useCallback((commentId: string) => {
    setDeleteCommentConfirm({ isOpen: true, commentId })
  }, [])

  const confirmDeleteComment = useCallback(() => {
    if (deleteCommentConfirm.commentId) {
      deleteCommentMutation.mutate(deleteCommentConfirm.commentId)
    }
  }, [deleteCommentConfirm.commentId, deleteCommentMutation])

  const handleUpdateComment = useCallback((
    commentId: string,
    content: string,
    name: string,
    avatar: string
  ) => {
    updateCommentMutation.mutate({ commentId, content, name, avatar })
    setIsCommentFormOpen(false)
    setEditingComment(null)
  }, [updateCommentMutation])

  const handleEditComment = useCallback((comment: Comment) => {
    setEditingComment(comment)
    setIsCommentFormOpen(true)
  }, [])

  const handleSubmitCommentEdit = useCallback((content: string, name: string, avatar: string) => {
    if (editingComment) {
      handleUpdateComment(editingComment.id, content, name, avatar)
    }
  }, [editingComment, handleUpdateComment])

  const commentTree = comments ? buildCommentTree(comments) : []

  const relativeTime = post ? formatRelativeTime(post.createdAt) : ''

  if (postLoading) {
    return <LoadingState message="Cargando post..." />
  }

  if (postError || !post) {
    return (
      <ErrorState
        message="Error al cargar el post"
        action={
          <Button as="link" to="/">
            Volver a posts
          </Button>
        }
      />
    )
  }

  return (
    <div>
      {(deletePostMutation.isPending || deleteCommentMutation.isPending || updateCommentMutation.isPending || createCommentMutation.isPending) && (
        <LoadingOverlay
          message={
            deletePostMutation.isPending
              ? 'Eliminando post...'
              : deleteCommentMutation.isPending
              ? 'Eliminando comentario...'
              : updateCommentMutation.isPending
              ? 'Guardando comentario...'
              : 'Creando comentario...'
          }
        />
      )}

      <Link
        to="/"
        className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-6 transition-colors"
      >
        <ArrowLeftIcon className="w-5 h-5" />
        Volver a posts
      </Link>

      <article className="card mb-8">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {post.title}
            </h1>
            <div className="flex items-center gap-3 mb-4">
              <Avatar.Root className="inline-flex items-center justify-center align-middle overflow-hidden select-none w-10 h-10 rounded-full bg-primary-100">
                <Avatar.Image
                  src={post.avatar}
                  alt={post.name}
                  className="w-full h-full object-cover"
                />
                <Avatar.Fallback className="w-full h-full flex items-center justify-center bg-primary-500 text-white text-sm font-medium">
                  {post.name.charAt(0).toUpperCase()}
                </Avatar.Fallback>
              </Avatar.Root>
              <div>
                <p className="text-sm font-medium text-gray-900">{post.name}</p>
                <p className="text-xs text-gray-500">
                  {relativeTime}
                </p>
              </div>
            </div>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {post.content}
            </p>
          </div>
          <OptionsMenu
            ariaLabel="Opciones del post"
            items={[
              {
                label: 'Eliminar',
                onClick: handleDeletePost,
                variant: 'danger',
              },
            ]}
          />
        </div>
      </article>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Comentarios {comments && `(${comments.filter(c => !c.parentId).length})`}
        </h2>
        <div className="card mb-6">
          <CommentForm onSubmit={handleCreateComment} />
        </div>
      </section>

      {commentsLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">Cargando comentarios...</p>
          </div>
        </div>
      ) : (
        <CommentTree
          comments={commentTree}
          postId={postId!}
          onDelete={handleDeleteComment}
          onReply={handleReplyComment}
          onEdit={handleEditComment}
        />
      )}

      {(deletePostConfirm || deleteCommentConfirm.isOpen) && (
        <Suspense fallback={null}>
          {deletePostConfirm && (
            <ConfirmDialog
              isOpen={deletePostConfirm}
              onClose={() => setDeletePostConfirm(false)}
              onConfirm={confirmDeletePost}
              title="Eliminar Post"
              description="¿Estás seguro de que quieres eliminar este post? Esta acción no se puede deshacer."
              confirmText="Eliminar"
              cancelText="Cancelar"
              variant="danger"
            />
          )}

          {deleteCommentConfirm.isOpen && (
            <ConfirmDialog
              isOpen={deleteCommentConfirm.isOpen}
              onClose={() => setDeleteCommentConfirm({ isOpen: false, commentId: null })}
              onConfirm={confirmDeleteComment}
              title="Eliminar Comentario"
              description="¿Estás seguro de que quieres eliminar este comentario? Esta acción no se puede deshacer."
              confirmText="Eliminar"
              cancelText="Cancelar"
              variant="danger"
            />
          )}
        </Suspense>
      )}

      {isCommentFormOpen && (
        <CommentFormModal
          comment={editingComment}
          isOpen={isCommentFormOpen}
          onClose={() => {
            setIsCommentFormOpen(false)
            setEditingComment(null)
          }}
          onSubmit={handleSubmitCommentEdit}
        />
      )}
    </div>
  )
}

