import { useState, useEffect, useRef, useMemo, lazy, Suspense } from 'react'
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { PlusIcon, ChevronDownIcon } from '@/shared/icons/Icons'
import { api } from '@/services/api'
import { PostCard } from '@/components/PostCard'
import { LoadingOverlay } from '@/shared/ui/LoadingOverlay'
import { LoadingState } from '@/shared/ui/LoadingState'
import { ErrorState } from '@/shared/ui/ErrorState'
import { Button } from '@/shared/ui/Button'
import { useToast } from '@/shared/ui/useToast'
import type { Post } from '@/types'

// Lazy load de componentes pesados que solo se usan cuando se necesitan
const PostForm = lazy(() => import('@/components/PostForm').then(module => ({ default: module.PostForm })))
const ConfirmDialog = lazy(() => import('@/shared/ui/ConfirmDialog').then(module => ({ default: module.ConfirmDialog })))

type SortOrder = 'newest' | 'oldest'

const POSTS_PER_PAGE = 10

export function PostsList() {
  const queryClient = useQueryClient()
  const toast = useToast()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<Post | null>(null)
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest')
  const [deletePostId, setDeletePostId] = useState<string | null>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useInfiniteQuery({
    queryKey: ['posts', sortOrder],
    queryFn: ({ pageParam = 1 }) => api.getPosts(pageParam, POSTS_PER_PAGE, sortOrder),
    getNextPageParam: (lastPage, allPages) => {
      // Si la última página tiene menos de POSTS_PER_PAGE, no hay más páginas
      return lastPage.length === POSTS_PER_PAGE ? allPages.length + 1 : undefined
    },
    initialPageParam: 1,
  })

  // Obtener todos los posts de todas las páginas y ordenarlos correctamente
  // Usamos useMemo para evitar reordenar en cada render
  const allPosts = useMemo(() => {
    const posts = data?.pages.flat() ?? []
    // Eliminar duplicados por si acaso (usando id como clave única)
    const uniquePosts = Array.from(
      new Map(posts.map(post => [post.id, post])).values()
    )
    // Ordenar por fecha
    return uniquePosts.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime()
      const dateB = new Date(b.createdAt).getTime()
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB
    })
  }, [data?.pages, sortOrder])

  // Observer para detectar cuando el usuario llega al final
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { threshold: 0.1 }
    )

    const currentRef = loadMoreRef.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const errorShownRef = useRef(false)

  // Toast para errores al cargar posts
  useEffect(() => {
    if (error && !errorShownRef.current) {
      errorShownRef.current = true
      toast.error('Error al cargar los posts. Por favor, intenta nuevamente.')
    }
    if (!error) {
      errorShownRef.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error])

  const deleteMutation = useMutation({
    mutationFn: async (postId: string) => {
      await api.deleteAllComments(postId)
      return api.deletePost(postId)
    },
    onSuccess: (_, postId) => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      queryClient.removeQueries({ queryKey: ['post', postId] })
      queryClient.removeQueries({ queryKey: ['comments', postId] })
      setDeletePostId(null)
      toast.success('Post eliminado correctamente')
    },
    onError: () => {
      toast.error('Error al eliminar el post. Por favor, intenta nuevamente.')
    },
  })

  const createMutation = useMutation({
    mutationFn: api.createPost,
    onSuccess: (newPost) => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      queryClient.removeQueries({ queryKey: ['post', newPost.id] })
      queryClient.removeQueries({ queryKey: ['comments', newPost.id] })
      toast.success('Post creado correctamente')
    },
    onError: () => {
      toast.error('Error al crear el post. Por favor, intenta nuevamente.')
      // Si hay error, volver a abrir el modal
      setIsFormOpen(true)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ postId, post }: { postId: string; post: Partial<Post> }) =>
      api.updatePost(postId, post),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      setEditingPost(null)
      toast.success('Post actualizado correctamente')
    },
    onError: () => {
      toast.error('Error al actualizar el post. Por favor, intenta nuevamente.')
      // Si hay error, volver a abrir el modal con el post que se estaba editando
      if (editingPost) {
        setIsFormOpen(true)
      }
    },
  })

  const handleCreate = () => {
    setEditingPost(null)
    setIsFormOpen(true)
  }

  const handleEdit = (post: Post) => {
    setEditingPost(post)
    setIsFormOpen(true)
  }

  const handleDelete = (postId: string) => {
    setDeletePostId(postId)
  }

  const handleSubmit = (postData: Partial<Post>) => {
    // Cerrar el modal inmediatamente cuando se inicia la mutación
    setIsFormOpen(false)
    
    if (editingPost) {
      updateMutation.mutate({
        postId: editingPost.id,
        post: { ...postData, createdAt: editingPost.createdAt },
      })
    } else {
      createMutation.mutate({
        ...postData,
        createdAt: new Date().toISOString(),
      })
    }
  }

  if (isLoading) {
    return <LoadingState message="Cargando posts..." />
  }

  if (error) {
    return (
      <ErrorState
        message="Error al cargar los posts"
        action={
          <Button
            onClick={() => queryClient.invalidateQueries({ queryKey: ['posts'] })}
          >
            Reintentar
          </Button>
        }
      />
    )
  }

  return (
    <div>
      {(deleteMutation.isPending || updateMutation.isPending || createMutation.isPending) && (
        <LoadingOverlay
          message={
            deleteMutation.isPending
              ? 'Eliminando post...'
              : updateMutation.isPending
              ? 'Guardando cambios...'
              : 'Creando post...'
          }
        />
      )}

      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0">Posts</h2>
        <div className="flex flex-col md:flex-row md:items-center md:justify-end gap-3 md:gap-3">
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <Button variant="secondary" leftIcon={<ChevronDownIcon className="w-4 h-4" />} fullWidth className="md:w-auto">
                {sortOrder === 'newest' ? 'Más recientes' : 'Más antiguos'}
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="min-w-[180px] bg-white rounded-lg shadow-lg border border-gray-200 p-1 z-50"
                align="end"
              >
                <DropdownMenu.Item
                  className={`px-3 py-2 text-sm rounded-md cursor-pointer focus:outline-none focus:bg-gray-100 ${
                    sortOrder === 'newest'
                      ? 'bg-primary-50 text-primary-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onSelect={() => setSortOrder('newest')}
                >
                  Más recientes primero
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  className={`px-3 py-2 text-sm rounded-md cursor-pointer focus:outline-none focus:bg-gray-100 ${
                    sortOrder === 'oldest'
                      ? 'bg-primary-50 text-primary-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onSelect={() => setSortOrder('oldest')}
                >
                  Más antiguos primero
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
          <Button onClick={handleCreate} leftIcon={<PlusIcon className="w-5 h-5" />} fullWidth className="md:w-auto">
            Nuevo Post
          </Button>
        </div>
      </div>

      {allPosts.length === 0 && !isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">No hay posts aún</p>
          <Button onClick={handleCreate}>
            Crear el primer post
          </Button>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-6">
            {allPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onDelete={handleDelete}
                onEdit={handleEdit}
              />
            ))}
          </div>
          
          {/* Elemento para detectar cuando llegar al final */}
          <div ref={loadMoreRef} className="py-4">
            {isFetchingNextPage && (
              <div className="flex items-center justify-center">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                <p className="ml-3 text-gray-600">Cargando más posts...</p>
              </div>
            )}
          </div>
        </>
      )}

      {isFormOpen && (
        <Suspense fallback={null}>
          <PostForm
            post={editingPost}
            isOpen={isFormOpen}
            onClose={() => {
              setIsFormOpen(false)
              setEditingPost(null)
            }}
            onSubmit={handleSubmit}
          />
        </Suspense>
      )}

      {deletePostId && (
        <Suspense fallback={null}>
          <ConfirmDialog
            isOpen={!!deletePostId}
            onClose={() => setDeletePostId(null)}
            onConfirm={() => {
              if (deletePostId) {
                deleteMutation.mutate(deletePostId)
              }
            }}
            title="Eliminar Post"
            description="¿Estás seguro de que quieres eliminar este post? Esta acción no se puede deshacer."
            confirmText="Eliminar"
            cancelText="Cancelar"
            variant="danger"
          />
        </Suspense>
      )}
    </div>
  )
}

