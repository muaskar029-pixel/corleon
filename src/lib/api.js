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

export const META_KEYS = [
    'resource_type',
    'date',
    'location',
    'screen',
    'editor',
    'photographer',
    'file_size',
    'caption',
    'keyword_other',
    'named_person',
    'credit',
    'note',
    'document_extract',
    'recognised',
    'landmark',
    'source',
    'status',
    'duration',
    'sample',
    'audio_bitrate',
    'frame_rate',
    'video_bitrate',
    'original_filename',
    'file_hash',
    'image_dimensions',
    'asset_license',
    'mime_type'
];

/** @param {any} rawMetabox */
export const parseMetabox = (rawMetabox) => {
    const source = rawMetabox?.all_meta ?? rawMetabox ?? {};
    return Object.fromEntries(
        META_KEYS.map((key) => {
            const val = source[key];
            return [key, Array.isArray(val) ? (val[0] ?? '') : (val ?? '')];
        })
    );
};

/**
 * Registered custom taxonomies associated with the 'digital_asset' post type in WordPress.
 * Each entry includes:
 * - slug: The REST API endpoint base name (`/wp/v2/<slug>`) and post payload key.
 * - label: Human-readable display name for UI rendering.
 * - description: Brief explanation of how the taxonomy classifies digital assets.
 * - hierarchical: Whether terms support parent-child relationships (like Categories) or are flat (like Tags).
 */
export const TAXONOMY_CONFIG = [
    {
        slug: 'aspect_ratio',
        label: 'Aspect Ratios',
        description: 'Classifies visual media by frame proportions (e.g., 16:9, 4:3, 1:1).',
        hierarchical: false
    },
    {
        slug: 'categories',
        label: 'Categories',
        description: 'Groups digital assets into broad topical or thematic classifications.',
        hierarchical: false
    },
    {
        slug: 'country',
        label: 'Countries',
        description: 'Identifies the country of origin or geographic subject of the digital asset.',
        hierarchical: false
    },
    {
        slug: 'formats',
        label: 'Formats',
        description: 'Specifies the media container or file format standard (e.g., MP4, RAW, PDF, WAV).',
        hierarchical: false
    }
];

/**
 * List of taxonomy REST base slugs used to extract term ID arrays from WordPress post objects.
 */
export const TAXONOMY_KEYS = TAXONOMY_CONFIG.map((tax) => tax.slug);

/**
 * Normalizes a WordPress taxonomy term object returned by `/wp/v2/<taxonomy>`.
 *
 * @param {any} term - Raw term object from the WordPress REST API.
 */
export const parseTerm = (term) => ({
    id: Number(term.id),
    name: term.name ?? '',
    slug: term.slug ?? '',
    description: term.description ?? '',
    count: Number(term.count ?? 0),
    parent: Number(term.parent ?? 0)
});

/**
 * Extracts assigned taxonomy term IDs from a WordPress 'digital_asset' post response.
 * WordPress stores assigned terms on the post root object as arrays of numeric term IDs
 * (e.g., `item.access_level = [3]`, `item.tags = [10, 12]`).
 *
 * @param {any} item - Raw post object from the WordPress REST API.
 */
export const parsePostTaxonomies = (item) =>
    Object.fromEntries(
        TAXONOMY_KEYS.map((taxKey) => [
            taxKey,
            Array.isArray(item?.[taxKey]) ? item[taxKey].map(Number) : []
        ])
    );

/**
 * Extracts embedded taxonomy term details (`id`, `name`, `slug`, `taxonomy`) from
 * `item._embedded['wp:term']` when a WordPress post is fetched with `_embed: true`.
 *
 * @param {any} item - Raw post object from the WordPress REST API.
 */
export const parseEmbeddedTerms = (item) => {
    const groups = item?._embedded?.['wp:term'];
    if (!Array.isArray(groups)) return [];
    return groups
        .flat()
        .filter((term) => term && TAXONOMY_KEYS.includes(term.taxonomy))
        .map((term) => ({
            id: Number(term.id),
            name: term.name ?? '',
            slug: term.slug ?? '',
            taxonomy: term.taxonomy
        }));
};

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
    metabox: parseMetabox(item.metabox),
    taxonomies: parsePostTaxonomies(item),
    taxonomy_terms: parseEmbeddedTerms(item)
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

/**
 * Service layer for interacting with WordPress REST API taxonomy endpoints (`/wp/v2/<taxonomy>`).
 * Dynamically generates CRUD helpers (`getAll`, `create`, `update`, `remove`) for each
 * registered digital asset taxonomy defined in `TAXONOMY_KEYS`, plus a `getAllTaxonomies()`
 * helper to fetch all taxonomy term lists in parallel.
 */
export const taxonomy_service = {
    ...Object.fromEntries(
        TAXONOMY_KEYS.map((tax) => [
            tax,
            {
                /**
                 * Retrieves all terms for the specified taxonomy, including empty terms (`hide_empty: false`).
                 */
                async getAll(per_page = 100) {
                    try {
                        const response = await wpApi.get(`/wp/v2/${tax}`, {
                            params: { per_page, hide_empty: false }
                        });
                        return {
                            items: response.data.map(parseTerm),
                            error: null
                        };
                    } catch (/** @type {any} */ error) {
                        console.error(`[taxonomy_service.${tax}.getAll] Error:`, error.message);
                        return {
                            items: [],
                            error: error.response?.data?.message || error.message
                        };
                    }
                },

                /**
                 * Creates a new term inside the specified taxonomy (`POST /wp/v2/<taxonomy>`).
                 * @param {{ name: string; slug?: string; description?: string; parent?: number }} payload
                 */
                async create(payload) {
                    try {
                        const response = await wpApi.post(`/wp/v2/${tax}`, payload);
                        return { item: parseTerm(response.data), error: null };
                    } catch (/** @type {any} */ error) {
                        console.error(`[taxonomy_service.${tax}.create] Error:`, error.message);
                        return {
                            item: null,
                            error: error.response?.data?.message || error.message
                        };
                    }
                },

                /**
                 * Updates an existing term by ID (`POST /wp/v2/<taxonomy>/<id>`).
                 */
                async update(id, payload) {
                    try {
                        const response = await wpApi.post(`/wp/v2/${tax}/${id}`, payload);
                        return { item: parseTerm(response.data), error: null };
                    } catch (/** @type {any} */ error) {
                        console.error(`[taxonomy_service.${tax}.update] Error:`, error.message);
                        return {
                            item: null,
                            error: error.response?.data?.message || error.message
                        };
                    }
                },

                /**
                 * Permanently deletes a term by ID (`DELETE /wp/v2/<taxonomy>/<id>?force=true`).
                 * WordPress requires `force: true` when deleting taxonomy terms via REST API.
                 */
                async remove(id) {
                    try {
                        await wpApi.delete(`/wp/v2/${tax}/${id}`, {
                            params: { force: true }
                        });
                        return { error: null };
                    } catch (/** @type {any} */ error) {
                        console.error(`[taxonomy_service.${tax}.remove] Error:`, error.message);
                        return {
                            error: error.response?.data?.message || error.message
                        };
                    }
                }
            }
        ])
    ),

    /**
     * Fetches term lists for all 6 registered digital asset taxonomies concurrently.
     * Useful for populating taxonomy selection checkboxes on Create/Edit Asset forms
     * and the central Taxonomy Management page.
     */
    async getAllTaxonomies() {
        const entries = await Promise.all(
            TAXONOMY_KEYS.map(async (tax) => {
                const res = await this[tax].getAll(100);
                return [tax, res.items];
            })
        );
        return Object.fromEntries(entries);
    }
};
