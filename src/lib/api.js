// @ts-nocheck

import axios from 'axios';

try {
    process.loadEnvFile();
} catch {
    // Abaikan jika file .env tidak ditemukan (misalnya saat pakai env dari sistem/OS)
}

const basic_auth = Buffer.from(
    `${process.env.WP_USER}:${process.env.WP_APP_PASSWORD}`
).toString('base64');

export const wpApi = axios.create({
    baseURL: process.env.WP_API_URL || 'http://192.168.122.213/wp-json',
  timeout: 5000,
  headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${basic_auth}`
  }
});

const endpoints = ['digital_asset'];

/** @param {any} item */
const parseItem = (item) => ({
    id: item.id,
    slug: item.slug,
    title: item.title?.rendered ?? 'Untitled',
    raw_title: item.title?.raw ?? item.title?.rendered ?? '',
    raw_content: item.content?.raw ?? item.content?.rendered ?? '',
    content: item.content?.rendered ?? '',
    date: item.date,
    status: item.status,
    metabox: item.metabox ?? {}
});

export const api_service = Object.fromEntries(
    endpoints.map((endpoint) => [
        endpoint,
        {
            async getAll(per_pages = 50) {
                try {
                    const response = await wpApi.get(`/wp/v2/${endpoint}`, {
                        params: { per_page: per_pages, _embed: true }
                    });

                    const items = response.data.map(parseItem);

                    return {
                        items,
                        total: Number(response.headers['x-wp-total'] || items.length)
                    };
                } catch (/** @type {any} */ error) {
                    console.error(`[api_service.${endpoint}] Error:`, error.message);
                    return { items: [], total: 0, error: error.message };
                }
            },

            async get_by_id(id) {
                try {
                    const response = await wpApi.get(`/wp/v2/${endpoint}/${id}`, {
                        params: { context: 'edit' }
                    });
                    return { item: parseItem(response.data), error: null };
                } catch (/** @type {any} */ error) {
                    console.error(`[api_service.${endpoint}.get_by_id] Error:`, error.message);
                    return { item: null, error: error.response?.data?.message || error.message };
                }
            },

            async update(id, payload) {
                try {
                    const response = await wpApi.post(`/wp/v2/${endpoint}/${id}`, payload);
                    return { item: parseItem(response.data), error: null };
                } catch (/** @type {any} */ error) {
                    console.error(`[api_service.${endpoint}.update] Error:`, error.message);
                    return { item: null, error: error.response?.data?.message || error.message };
                }
            },

            async create(payload) {
                try {
                    const response = await wpApi.post(`/wp/v2/${endpoint}`, payload);
                    return { item: parseItem(response.data), error: null };
                } catch (/** @type {any} */ error) {
                    console.error(`[api_service.${endpoint}.create] Error:`, error.message);
                    return { item: null, error: error.response?.data?.message || error.message };
                }
            }
        }
    ])
);

// Raw WP items (keeps title.rendered and _embedded) for the paginated digital-asset page.
export async function getAssets(page = 1, per_page = 12) {
    const response = await wpApi.get('/wp/v2/digital_asset', {
        params: { page, per_page, _embed: true }
    });
    return {
        items: response.data,
        totalPages: Number(response.headers['x-wp-totalpages'] || 1)
    };
}
