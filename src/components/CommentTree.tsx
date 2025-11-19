import { memo } from 'react'
import { CommentItem } from './CommentItem'
import type { CommentWithReplies } from '@/types'

interface CommentTreeProps {
  comments: CommentWithReplies[]
  postId: string
  onDelete: (commentId: string) => void
  onReply: (parentId: string, content: string, name: string, avatar: string) => void
  onEdit: (comment: CommentWithReplies) => void
}

export const CommentTree = memo(function CommentTree({
  comments,
  postId,
  onDelete,
  onReply,
  onEdit,
}: CommentTreeProps) {
  if (comments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No hay comentarios aún. ¡Sé el primero en comentar!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          postId={postId}
          onDelete={onDelete}
          onReply={onReply}
          onEdit={onEdit}
          depth={0}
        />
      ))}
    </div>
  )
})

