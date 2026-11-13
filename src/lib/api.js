import axios from 'axios';

export const wpApi = axios.create({
  baseURL: 'http://192.168.122.213/wp-json',
  timeout: 5000,
  headers: {
      'Content-Type': 'application/json'
  }
});

const endpoints = ['digital_asset'];

/** @param {any} item */
const parseItem = (item) => ({
    id: item.id,
    slug: item.slug,
    title: item.title?.rendered ?? 'Untitled',
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
