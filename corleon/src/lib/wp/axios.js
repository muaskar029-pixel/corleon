import axios from 'axios';
import {
  PUBLIC_WP_API_URL,
  PUBLIC_WP_USERNAME,
  PUBLIC_WP_APP_PASSWORD
} from '$env/static/public';

export const wpApi = axios.create({
  baseURL: PUBLIC_WP_API_URL,
  timeout: 10000,
  auth: {
    username: PUBLIC_WP_USERNAME,
    password: PUBLIC_WP_APP_PASSWORD
  }
});

export async function getPosts(type = 'posts', page = 1, search = '', perPage = 9) {
  const res = await wpApi.get(`/${type}`, {
    params: {
      page,
      per_page: perPage,
      search: search || undefined,
      _embed: true
    }
  });
  return res.data;
}

export async function getPostById(id, type = 'posts') {
  const res = await wpApi.get(`/${type}/${id}`, {
    params: { _embed: true }
  });
  return res.data;
}

export async function createPost(data, type = 'posts') {
  const res = await wpApi.post(`/${type}`, data);
  return res.data;
}

export async function updatePost(id, data, type = 'posts') {
  const res = await wpApi.post(`/${type}/${id}`, data);
  return res.data;
}

export async function deletePost(id, type = 'posts') {
  const res = await wpApi.delete(`/${type}/${id}`);
  return res.data;
}

export async function uploadMedia(file) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await wpApi.post('/media', formData);
  return res.data;
}

export async function getTaxonomies(type = 'digital_asset') {
  const res = await wpApi.get('/taxonomies', {
    params: { type }
  });
  const taxonomies = Object.values(res.data);

  for (const tax of taxonomies) {
    const termsRes = await wpApi.get(`/${tax.rest_base}`, {
      params: { per_page: 100 }
    });
    tax.terms = termsRes.data;
  }

  return taxonomies;
}

export async function getUsers() {
  const res = await wpApi.get('/users', {
    params: { context: 'edit', per_page: 100 }
  });
  return res.data;
}

export async function getUserById(id) {
  const res = await wpApi.get(`/users/${id}`, {
    params: { context: 'edit' }
  });
  return res.data;
}

export async function createUser(data) {
  const res = await wpApi.post('/users', data);
  return res.data;
}

export async function updateUser(id, data) {
  const res = await wpApi.post(`/users/${id}`, data);
  return res.data;
}

export async function deleteUser(id, reassign = 1) {
  const res = await wpApi.delete(`/users/${id}`, {
    params: { force: true, reassign }
  });
  return res.data;
}
