// @ts-nocheck
import { fail, redirect } from "@sveltejs/kit";
import { api_service, taxonomy_service, META_KEYS, TAXONOMY_CONFIG, TAXONOMY_KEYS } from "#lib/api.js";

/**
 * Loads available terms for all 6 registered taxonomies so the Create Asset form
 * can display taxonomy selection checkboxes.
 */
export async function load() {
    const termsByTaxonomy = await taxonomy_service.getAllTaxonomies();

    return {
        taxonomies: TAXONOMY_CONFIG,
        termsByTaxonomy
    };
}

export const actions = {
    default: async ({ request }) => {
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
         * WordPress REST API assigns terms to the newly created 'digital_asset' post
         * when passed as arrays of numeric term IDs (e.g., `categories: [2, 4]`).
         */
        const taxonomyPayload = Object.fromEntries(
            TAXONOMY_KEYS.map((taxKey) => [
                taxKey,
                form_data.getAll(`tax_${taxKey}`).map((val) => Number(val)).filter(Boolean)
            ])
        );

        const { error: create_error } = await api_service.digital_asset.create({
            title,
            content,
            status,
            metabox,
            ...taxonomyPayload
        });

        if (create_error) {
            return fail(500, { error: create_error });
        }

        throw redirect(303, '/?tab=digital-asset');
    }
};
