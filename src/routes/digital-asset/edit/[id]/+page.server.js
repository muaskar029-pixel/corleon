// @ts-nocheck
import { error, fail, redirect } from "@sveltejs/kit";
import { api_service } from "#lib/api.js";

export async function load({ params }) {
    const { item, error: api_error } = await api_service.digital_asset.get_by_id(params.id);
    if (!item) {
        throw error(404, api_error || 'Digital Asset tidak ditemukan');
    }

    return { asset: item };
}

export const actions = {
    default: async ({ request, params }) => {
        const form_data = await request.formData();
        const title = form_data.get('title')?.toString().trim();
        const content = form_data.get('content')?.toString() ?? '';
        const status = form_data.get('status')?.toString() ?? 'publish';

        if (!title) {
            return fail(400, { error: 'Judul asset wajib diisi.' });
        }

        const { error: update_error } = await api_service.digital_asset.update(params.id, {
            title,
            content,
            status
        });

        if (update_error) {
            return fail(500, { error: update_error });
        }

        throw redirect(303, '/?tab=digital-asset');
    }
};
