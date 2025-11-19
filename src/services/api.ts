import type { Post, Comment } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const api = {
  // Posts
  getPosts: async (page: number = 1, limit: number = 10, sortOrder: 'newest' | 'oldest' = 'newest'): Promise<Post[]> => {
    const sortParam = sortOrder === 'newest' ? 'createdAt' : 'createdAt';
    const orderParam = sortOrder === 'newest' ? 'desc' : 'asc';
    const response = await fetch(
      `${API_BASE_URL}/post?page=${page}&limit=${limit}&sortBy=${sortParam}&order=${orderParam}`
    );
    if (!response.ok) {
      throw new Error('Failed to fetch posts');
    }
    return response.json();
  },

  getSinglePost: async (postId: string): Promise<Post> => {
    const response = await fetch(`${API_BASE_URL}/post/${postId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch post');
    }
    return response.json();
  },

  createPost: async (post: Partial<Post>): Promise<Post> => {
    const response = await fetch(`${API_BASE_URL}/post`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(post),
    });
    if (!response.ok) {
      throw new Error('Failed to create post');
    }
    return response.json();
  },

  updatePost: async (postId: string, post: Partial<Post>): Promise<Post> => {
    const response = await fetch(`${API_BASE_URL}/post/${postId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(post),
    });
    if (!response.ok) {
      throw new Error('Failed to update post');
    }
    return response.json();
  },

  deletePost: async (postId: string): Promise<Post> => {
    const response = await fetch(`${API_BASE_URL}/post/${postId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete post');
    }
    return response.json();
  },

  // Comments
  getComments: async (postId: string): Promise<Comment[]> => {
    const response = await fetch(`${API_BASE_URL}/post/${postId}/comment`);
    if (!response.ok) {
      throw new Error('Failed to fetch comments');
    }
    return response.json();
  },

  createComment: async (
    postId: string,
    comment: Partial<Comment>
  ): Promise<Comment> => {
    const response = await fetch(`${API_BASE_URL}/post/${postId}/comment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(comment),
    });
    if (!response.ok) {
      throw new Error('Failed to create comment');
    }
    return response.json();
  },

  updateComment: async (
    postId: string,
    commentId: string,
    comment: Partial<Comment>
  ): Promise<Comment> => {
    const response = await fetch(
      `${API_BASE_URL}/post/${postId}/comment/${commentId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(comment),
      }
    );
    if (!response.ok) {
      throw new Error('Failed to update comment');
    }
    return response.json();
  },

  deleteComment: async (
    postId: string,
    commentId: string
  ): Promise<Comment> => {
    const response = await fetch(
      `${API_BASE_URL}/post/${postId}/comment/${commentId}`,
      {
        method: 'DELETE',
      }
    );
    if (!response.ok) {
      throw new Error('Failed to delete comment');
    }
    return response.json();
  },

  // Borrar un comentario y todos sus hijos
  deleteCommentRecursive: async (
    postId: string,
    commentId: string
  ): Promise<void> => {
    try {
      // Obtener todos los comentarios del post
      const allComments = await api.getComments(postId);
      
      if (!allComments || allComments.length === 0) {
        return;
      }
      
      // Construir un mapa de parentId -> array de hijos para acceso eficiente
      const childrenMap = new Map<string, Comment[]>();
      allComments.forEach(comment => {
        if (comment.parentId) {
          const children = childrenMap.get(comment.parentId) || [];
          children.push(comment);
          childrenMap.set(comment.parentId, children);
        }
      });
      
      // Encontrar todos los descendientes usando BFS (más eficiente que múltiples pasadas)
      const idsToDelete = new Set<string>([commentId]);
      const queue = [commentId];
      
      while (queue.length > 0) {
        const currentId = queue.shift()!;
        const children = childrenMap.get(currentId) || [];
        
        children.forEach(child => {
          if (!idsToDelete.has(child.id)) {
            idsToDelete.add(child.id);
            queue.push(child.id);
          }
        });
      }
      
      // Filtrar y borrar los comentarios identificados
      const commentsToDelete = allComments.filter(comment => idsToDelete.has(comment.id));
      
      // Borrar de forma secuencial para evitar problemas de concurrencia
      for (const comment of commentsToDelete) {
        try {
          await api.deleteComment(postId, comment.id);
        } catch (error) {
          console.warn(`Error al borrar comentario ${comment.id}:`, error);
          // Continuar con el siguiente aunque haya un error
        }
      }
    } catch (error) {
      console.warn('Error al borrar comentario y sus hijos:', error);
      throw error;
    }
  },

  // Borrar todos los comentarios de un post
  deleteAllComments: async (postId: string): Promise<void> => {
    try {
      // Obtener todos los comentarios del post
      const comments = await api.getComments(postId);
      
      if (!comments || comments.length === 0) {
        return;
      }
      
      // Borrar cada comentario de forma secuencial para evitar problemas de concurrencia
      for (const comment of comments) {
        try {
          await api.deleteComment(postId, comment.id);
        } catch (error) {
          console.warn(`Error al borrar comentario ${comment.id}:`, error);
          // Continuar con el siguiente aunque haya un error
        }
      }
    } catch (error) {
      // Si no hay comentarios o hay un error, continuar de todas formas
      console.warn('Error al obtener o borrar comentarios:', error);
    }
  },
};

