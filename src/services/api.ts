import axios from 'axios';
import type { Post, Comment } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Crear instancia de axios (preparada para agregar interceptor después)
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  // Posts
  getPosts: async (page: number = 1, limit: number = 10, sortOrder: 'newest' | 'oldest' = 'newest'): Promise<Post[]> => {
    const sortParam = sortOrder === 'newest' ? 'createdAt' : 'createdAt';
    const orderParam = sortOrder === 'newest' ? 'desc' : 'asc';
    const response = await apiClient.get('/post', {
      params: { page, limit, sortBy: sortParam, order: orderParam }
    });
    return response.data;
  },

  getSinglePost: async (postId: string): Promise<Post> => {
    const response = await apiClient.get(`/post/${postId}`);
    return response.data;
  },

  createPost: async (post: Partial<Post>): Promise<Post> => {
    const response = await apiClient.post('/post', post);
    return response.data;
  },

  updatePost: async (postId: string, post: Partial<Post>): Promise<Post> => {
    const response = await apiClient.put(`/post/${postId}`, post);
    return response.data;
  },

  deletePost: async (postId: string): Promise<Post> => {
    const response = await apiClient.delete(`/post/${postId}`);
    return response.data;
  },

  // Comments
  getComments: async (postId: string): Promise<Comment[]> => {
    const response = await apiClient.get(`/post/${postId}/comment`);
    return response.data;
  },

  createComment: async (
    postId: string,
    comment: Partial<Comment>
  ): Promise<Comment> => {
    const response = await apiClient.post(`/post/${postId}/comment`, comment);
    return response.data;
  },

  updateComment: async (
    postId: string,
    commentId: string,
    comment: Partial<Comment>
  ): Promise<Comment> => {
    const response = await apiClient.put(
      `/post/${postId}/comment/${commentId}`,
      comment
    );
    return response.data;
  },

  deleteComment: async (
    postId: string,
    commentId: string
  ): Promise<Comment> => {
    const response = await apiClient.delete(
      `/post/${postId}/comment/${commentId}`
    );
    return response.data;
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

