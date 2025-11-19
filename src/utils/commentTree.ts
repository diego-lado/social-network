import type { Comment, CommentWithReplies } from '@/types';

/**
 * Builds a tree structure from flat comments array
 * Comments with parentId === null are top-level comments
 * Comments with parentId === string are replies to other comments
 */
export function buildCommentTree(comments: Comment[]): CommentWithReplies[] {
  const commentMap = new Map<string, CommentWithReplies>();
  const rootComments: CommentWithReplies[] = [];

  // First pass: create all comment nodes
  comments.forEach((comment) => {
    commentMap.set(comment.id, { ...comment, replies: [] });
  });

  // Second pass: build the tree structure
  comments.forEach((comment) => {
    const commentNode = commentMap.get(comment.id)!;
    
    if (comment.parentId === null) {
      // Root level comment
      rootComments.push(commentNode);
    } else {
      // Reply to another comment
      const parent = commentMap.get(comment.parentId);
      if (parent) {
        if (!parent.replies) {
          parent.replies = [];
        }
        parent.replies.push(commentNode);
      }
    }
  });

  // Sort by creation date (newest first)
  const sortByDate = (a: CommentWithReplies, b: CommentWithReplies) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  };

  rootComments.sort(sortByDate);
  
  const sortReplies = (comments: CommentWithReplies[]) => {
    comments.sort(sortByDate);
    comments.forEach((comment) => {
      if (comment.replies && comment.replies.length > 0) {
        sortReplies(comment.replies);
      }
    });
  };

  sortReplies(rootComments);

  return rootComments;
}

