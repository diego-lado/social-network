import { memo } from 'react'
import { Link } from 'react-router-dom'
import * as Avatar from '@radix-ui/react-avatar'
import { OptionsMenu } from '@/shared/ui/OptionsMenu'
import { formatRelativeTime } from '@/utils/date'
import type { Post } from '@/types'

interface PostCardProps {
  post: Post
  onDelete: (postId: string) => void
  onEdit: (post: Post) => void
}

export const PostCard = memo(function PostCard({ post, onDelete, onEdit }: PostCardProps) {
  const truncatedContent =
    post.content.length > 200
      ? `${post.content.substring(0, 200)}...`
      : post.content

  const relativeTime = formatRelativeTime(post.createdAt)

  return (
    <article className="card hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <Link
            to={`/post/${post.id}`}
            className="block group"
          >
            <h2 className="text-xl font-semibold text-gray-900 group-hover:text-primary-600 transition-colors mb-2">
              {post.title}
            </h2>
          </Link>
          <p className="text-gray-700 mb-4 line-clamp-3">{truncatedContent}</p>
          <div className="flex items-center gap-3">
            <Avatar.Root className="inline-flex items-center justify-center align-middle overflow-hidden select-none w-8 h-8 rounded-full bg-primary-100">
              <Avatar.Image
                src={post.avatar}
                alt={post.name}
                className="w-full h-full object-cover"
              />
              <Avatar.Fallback className="w-full h-full flex items-center justify-center bg-primary-500 text-white text-xs font-medium">
                {post.name.charAt(0).toUpperCase()}
              </Avatar.Fallback>
            </Avatar.Root>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {post.name}
              </p>
              <p className="text-xs text-gray-500">
                {relativeTime}
              </p>
            </div>
          </div>
        </div>
        <OptionsMenu
          ariaLabel="Opciones del post"
          items={[
            {
              label: 'Editar',
              onClick: () => onEdit(post),
              variant: 'default',
            },
            {
              label: 'Eliminar',
              onClick: () => onDelete(post.id),
              variant: 'danger',
            },
          ]}
        />
      </div>
    </article>
  )
})

