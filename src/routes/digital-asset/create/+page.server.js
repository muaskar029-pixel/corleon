// @ts-nocheck
import { fail, redirect } from "@sveltejs/kit";
import { api_service } from "#lib/api.js";

export const actions = {
    default: async ({ request }) => {
        const form_data = await request.formData();
        const title = form_data.get('title')?.toString().trim();
        const content = form_data.get('content')?.toString() ?? '';
        const status = form_data.get('status')?.toString() ?? 'publish';

        if (!title) {
            return fail(400, { error: 'Judul asset wajib diisi.' });
        }

        const { error: create_error } = await api_service.digital_asset.create({
            title,
            content,
            status
        });

        if (create_error) {
            return fail(500, { error: create_error });
        }

        throw redirect(303, '/?tab=digital-asset');
    }
};
