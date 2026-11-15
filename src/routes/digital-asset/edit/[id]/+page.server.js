// @ts-nocheck
import { error, fail, redirect } from "@sveltejs/kit";
import { api_service, taxonomy_service, META_KEYS, TAXONOMY_CONFIG, TAXONOMY_KEYS } from "#lib/api.js";

/**
 * Loads the target 'digital_asset' post along with all available terms for the 6
 * registered taxonomies so the Edit form can render pre-checked taxonomy checkboxes.
 */
export async function load({ params }) {
    const [{ item, error: api_error }, termsByTaxonomy] = await Promise.all([
        api_service.digital_asset.get_by_id(params.id),
        taxonomy_service.getAllTaxonomies()
    ]);

    if (!item) {
        throw error(404, api_error || 'Digital Asset tidak ditemukan');
    }

    return {
        asset: item,
        taxonomies: TAXONOMY_CONFIG,
        termsByTaxonomy
    };
}

export const actions = {
    default: async ({ request, params }) => {
        const form_data = await request.formData();
        const title = form_data.get('title')?.toString().trim();
        const content = form_data.get('content')?.toString() ?? '';
        const status = form_data.get('post_status')?.toString() ?? 'publish';

        if (!title) {
            return fail(400, { error: 'Judul asset wajib diisi.' });
        }

        // Collect all 27 custom metabox fields
        const metabox = Object.fromEntries(
            META_KEYS.map((key) => {
                const formKey = key === 'status' ? 'meta_status' : key;
                return [key, form_data.get(formKey)?.toString() ?? ''];
            })
        );

        /**
         * Collect selected term IDs for each of the 6 registered taxonomies.
         * WordPress REST API expects an array of numeric term IDs for each taxonomy key
         * on the root payload (e.g., `access_level: [3]`, `tags: [10, 12]`).
         * Sending an empty array `[]` clears all terms for that taxonomy on the post.
         */
        const taxonomyPayload = Object.fromEntries(
            TAXONOMY_KEYS.map((taxKey) => [
                taxKey,
                form_data.getAll(`tax_${taxKey}`).map((val) => Number(val)).filter(Boolean)
            ])
        );

        const { error: update_error } = await api_service.digital_asset.update(params.id, {
            title,
            content,
            status,
            metabox,
            ...taxonomyPayload
        });

        if (update_error) {
            return fail(500, { error: update_error });
        }

        throw redirect(303, '/?tab=digital-asset');
    }
};
