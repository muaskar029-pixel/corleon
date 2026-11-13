import { api_service } from '#lib/api.js';

    export async function load() {
        const [digital_assetlenderRes] = await Promise.all([
            api_service.digital_asset.getAll(50),
        ]);
  
        return {
            digital_asset: digital_assetlenderRes.items ?? [],
        };
    }