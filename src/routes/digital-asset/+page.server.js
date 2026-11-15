import { digital_asset_service } from "#lib/services/digital-asset.service.js";
import { taxonomy_service, TAXONOMY_CONFIG } from "#lib/api.js";

export async function load() {
    // Load digital_asset items and all 6 registered taxonomies in parallel
    const [result, termsByTaxonomy] = await Promise.all([
        digital_asset_service.getAll(50),
        taxonomy_service.getAllTaxonomies()
    ]);

    console.log("Total Data:", result.total);

    if (result.error) {
        console.warn(`Saat memuat arsip: ${result.error}`);
    }
    return {
        assets: result.assets,
        total: result.total,
        taxonomies: TAXONOMY_CONFIG,
        termsByTaxonomy
    };
}