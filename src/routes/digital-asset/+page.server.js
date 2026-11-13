import { digital_asset_service } from "#lib/services/digital-asset.service.js";

export async function load() {
    const result = await digital_asset_service.getAll(50);

    console.log("Total Data:", result.total);

    if (result.error) {
        console.warn('Saat memuat arsip: ${result.error}');
    }
    return {                                                                                                                                                      
        assets: result.assets,                                                                                                                                
        total: result.total                                                                                                                                       
    };
}