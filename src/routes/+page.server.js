import { api_service, taxonomy_service, TAXONOMY_CONFIG } from '#lib/api.js';

export async function load() {
    // Fetch digital_asset posts and all 6 registered taxonomies in parallel
    const [digital_assetlenderRes, termsByTaxonomy] = await Promise.all([
        api_service.digital_asset.getAll(50),
        taxonomy_service.getAllTaxonomies()
    ]);

    return {
        digital_asset: digital_assetlenderRes.items ?? [],
        taxonomies: TAXONOMY_CONFIG,
        termsByTaxonomy
    };
}