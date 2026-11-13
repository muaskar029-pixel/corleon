// @ts-nocheck
import { wpApi } from "#lib/api.js";

export const digital_asset_service = {
    async getAll(perPage = 50) {
        try {
            const response = await wpApi.get('/wp/v2/digital_asset', {
                params: { 
                    per_page: perPage, 
                    _embed: true 
                }
            });
            
            const assets = response.data.map(item => ({
                id: item.id,
                slug: item.slug,
                title: item.title?.rendered ?? 'Untitled',
                content: item.content?.rendered ?? '',
                date: item.date,
                status: item.status,
                link: item.link,
                metabox: item.metabox ?? {}
            }));

            return {
                assets,
                total: Number(response.headers['x-wp-total'] || assets.length)
            };
        } catch (error) {
            console.error('gagal mengambil data dari wordpress', error.message);
            return {
                assets: [],
                total: 0,
                error: error.message
            };
        }
    }
};