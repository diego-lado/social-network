import { useState, memo, useCallback } from 'react'
import * as Avatar from '@radix-ui/react-avatar'
import { OptionsMenu } from '@/shared/ui/OptionsMenu'
import { formatRelativeTime } from '@/utils/date'
import { CommentForm } from './CommentForm'
import type { CommentWithReplies } from '@/types'

interface CommentItemProps {
  comment: CommentWithReplies
  postId: string
  onDelete: (commentId: string) => void
  onReply: (parentId: string, content: string, name: string, avatar: string) => void
  onEdit: (comment: CommentWithReplies) => void
  depth: number
}

const MAX_DEPTH = 5

export const CommentItem = memo(function CommentItem({
  comment,
  postId,
  onDelete,
  onReply,
  onEdit,
  depth,
}: CommentItemProps) {
  const [isReplying, setIsReplying] = useState(false)
  const [showReplies, setShowReplies] = useState(true)

  const hasReplies = comment.replies && comment.replies.length > 0
  const canNest = depth < MAX_DEPTH

  const relativeTime = formatRelativeTime(comment.createdAt)

  const handleReply = useCallback((content: string, name: string, avatar: string) => {
    onReply(comment.id, content, name, avatar)
    setIsReplying(false)
  }, [comment.id, onReply])

  const handleToggleReply = useCallback(() => {
    setIsReplying(prev => !prev)
  }, [])

  const handleToggleReplies = useCallback(() => {
    setShowReplies(prev => !prev)
  }, [])

  const handleDelete = useCallback(() => {
    onDelete(comment.id)
  }, [comment.id, onDelete])

  const handleEdit = useCallback(() => {
    onEdit(comment)
  }, [comment, onEdit])

  const marginLeft = depth * 24

  return (
    <div
      className="relative"
      style={{ marginLeft: `${marginLeft}px` }}
    >
      {/* Connection line for nested comments */}
      {depth > 0 && (
        <div
          className="absolute left-0 top-0 bottom-0 w-px bg-gray-300"
          style={{ left: `${-24}px` }}
        />
      )}

      <div className="card mb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <Avatar.Root className="inline-flex items-center justify-center align-middle overflow-hidden select-none w-8 h-8 rounded-full bg-primary-100 flex-shrink-0">
                <Avatar.Image
                  src={comment.avatar}
                  alt={comment.name}
                  className="w-full h-full object-cover"
                />
                <Avatar.Fallback className="w-full h-full flex items-center justify-center bg-primary-500 text-white text-xs font-medium">
                  {comment.name.charAt(0).toUpperCase()}
                </Avatar.Fallback>
              </Avatar.Root>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {comment.name}
                </p>
                <p className="text-xs text-gray-500">
                  {relativeTime}
                </p>
              </div>
            </div>
            <p className="text-gray-700 whitespace-pre-wrap mb-3">
              {comment.content}
            </p>
            <div className="flex items-center gap-4">
                {canNest && (
                  <button
                    onClick={handleToggleReply}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors cursor-pointer"
                  >
                    {isReplying ? 'Cancelar' : 'Responder'}
                  </button>
                )}
                {hasReplies && (
                  <button
                    onClick={handleToggleReplies}
                    className="text-sm text-gray-600 hover:text-gray-700 font-medium transition-colors cursor-pointer"
                  >
                    {showReplies
                      ? `Ocultar ${comment.replies!.length} respuesta${comment.replies!.length > 1 ? 's' : ''}`
                      : `Mostrar ${comment.replies!.length} respuesta${comment.replies!.length > 1 ? 's' : ''}`}
                  </button>
                )}
              </div>
          </div>
          <OptionsMenu
            ariaLabel="Opciones del comentario"
            items={[
              {
                label: 'Editar',
                onClick: handleEdit,
                variant: 'default',
              },
              {
                label: 'Eliminar',
                onClick: handleDelete,
                variant: 'danger',
              },
            ]}
          />
        </div>

        {isReplying && canNest && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <CommentForm
              onSubmit={handleReply}
              onCancel={handleToggleReply}
              placeholder="Escribe tu respuesta..."
            />
          </div>
        )}
      </div>

      {hasReplies && showReplies && (
        <div className="mt-2">
          {comment.replies!.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              postId={postId}
              onDelete={onDelete}
              onReply={onReply}
              onEdit={onEdit}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
})

