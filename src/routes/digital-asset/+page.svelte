<script>
    // @ts-nocheck
    import { Button } from "#lib/components/ui/button/index.ts";
    let { data } = $props();
</script>

<div class="p-6 space-y-6">
    <div class="flex items-center justify-between">
        <div>
            <h1 class="text-xl font-semibold">Digital Asset Management</h1>
            <span class="text-sm text-muted-foreground">Total: {data.assets?.length ?? 0} item</span>
        </div>
        <Button href="/digital-asset/create" size="sm">+ Add New Asset</Button>
    </div>

    <div class="border rounded-md overflow-x-auto">
        <table class="w-full text-sm text-left">
            <thead class="bg-muted text-muted-foreground border-b">
                <tr>
                    <th class="p-3 font-medium w-16">ID</th>
                    <th class="p-3 font-medium">Title</th>
                    <th class="p-3 font-medium">Resource Type</th>
                    <th class="p-3 font-medium">Location</th>
                    <th class="p-3 font-medium">Photographer</th>
                    <th class="p-3 font-medium">Taxonomies</th>
                    <th class="p-3 font-medium">Status</th>
                    <th class="p-3 font-medium">Date</th>
                    <th class="p-3 font-medium text-right">Action</th>
                </tr>
            </thead>
            <tbody class="divide-y">
                {#each data.assets ?? [] as item (item.id)}
                    <tr class="hover:bg-muted/50">
                        <td class="p-3 font-mono text-xs">#{item.id}</td>
                        <td class="p-3 font-medium">
                            <div>{@html item.title}</div>
                            <div class="text-xs text-muted-foreground">{item.slug}</div>
                        </td>
                        <td class="p-3">
                            {#if item.metabox?.resource_type}
                                <span class="px-2 py-0.5 text-xs rounded border bg-muted capitalize">
                                    {item.metabox.resource_type}
                                </span>
                            {:else}
                                <span class="text-muted-foreground">-</span>
                            {/if}
                        </td>
                        <td class="p-3 text-muted-foreground">
                            {item.metabox?.location || '-'}
                        </td>
                        <td class="p-3 text-muted-foreground">
                            {item.metabox?.photographer || '-'}
                        </td>
                        <!-- Renders assigned taxonomy terms embedded on the digital_asset post -->
                        <td class="p-3">
                            {#if item.taxonomy_terms?.length > 0}
                                <div class="flex flex-wrap gap-1">
                                    {#each item.taxonomy_terms as term (term.id)}
                                        <span class="px-2 py-0.5 text-xs rounded border bg-muted">
                                            <span class="text-muted-foreground">{term.taxonomy}:</span> {term.name}
                                        </span>
                                    {/each}
                                </div>
                            {:else}
                                <span class="text-muted-foreground">-</span>
                            {/if}
                        </td>
                        <td class="p-3">
                            <span class="px-2 py-0.5 text-xs rounded border bg-secondary">
                                {item.status}
                            </span>
                        </td>
                        <td class="p-3 text-muted-foreground">
                            {new Date(item.date).toLocaleDateString('id-ID')}
                        </td>
                        <td class="p-3 text-right">
                            <Button href="/digital-asset/edit/{item.id}" variant="outline" size="sm">
                                Edit
                            </Button>
                        </td>
                    </tr>
                {:else}
                    <tr>
                        <td colspan="9" class="p-6 text-center text-muted-foreground">
                            Belum ada data asset.
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
</div>