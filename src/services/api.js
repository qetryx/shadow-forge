// SIR: This file integrates the JSONPlaceholder API (https://jsonplaceholder.typicode.com/)
// All user, post, todo, album, and photo data in the app is fetched from this API as per your instructions.

import axios from 'axios';

const API_BASE_URL = 'https://jsonplaceholder.typicode.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiService = {
  // Posts
  getPosts: () => api.get('/posts'),
  getPost: (id) => api.get(`/posts/${id}`),
  createPost: (data) => api.post('/posts', data),
  updatePost: (id, data) => api.put(`/posts/${id}`, data),
  deletePost: (id) => api.delete(`/posts/${id}`),
  getUserPosts: (userId) => api.get(`/users/${userId}/posts`),

  // Users
  getUsers: () => api.get('/users'),
  getUser: (id) => api.get(`/users/${id}`),
  getUserTodos: (userId) => api.get(`/users/${userId}/todos`),
  getUserAlbums: (userId) => api.get(`/users/${userId}/albums`),

  // Comments
  getComments: () => api.get('/comments'),
  getPostComments: (postId) => api.get(`/posts/${postId}/comments`),

  // Albums
  getAlbums: () => api.get('/albums'),
  getAlbum: (id) => api.get(`/albums/${id}`),
  getAlbumPhotos: (albumId) => api.get(`/albums/${albumId}/photos`),

  // Photos
  getPhotos: () => api.get('/photos'),

  // Todos
  getTodos: () => api.get('/todos'),
};

export default apiService; 