<script>
    // @ts-nocheck
    import { enhance } from '$app/forms';
    import { Button } from "#lib/components/ui/button/index.ts";
    import { Input } from "#lib/components/ui/input/index.ts";
    import { Label } from "#lib/components/ui/label/index.ts";

    let { data, form } = $props();
    let meta = $derived(data.asset.metabox ?? {});
</script>

<div class="max-w-4xl mx-auto p-6 space-y-6">
    <div class="flex items-center justify-between border-b pb-4">
        <div>
            <h1 class="text-xl font-semibold">Edit Digital Asset #{data.asset.id}</h1>
            <p class="text-xs text-muted-foreground">Slug: #{data.asset.slug}</p>
        </div>
        <Button href="/?tab=digital-asset" variant="outline" size="sm">Back</Button>
    </div>

    {#if form?.error}
        <div class="p-3 rounded-md bg-destructive/10 text-destructive text-sm border border-destructive/20">
            {form.error}
        </div>
    {/if}

    <form method="POST" use:enhance class="space-y-6">
        <!-- Post Utama -->
        <div class="border rounded-md p-4 space-y-4 bg-card">
            <h2 class="text-base font-semibold border-b pb-2">Informasi Utama Post</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-2">
                    <Label for="title">Title</Label>
                    <Input id="title" name="title" value={data.asset.raw_title} required />
                </div>

                <div class="space-y-2">
                    <Label for="post_status">Post Status (WordPress)</Label>
                    <select
                        id="post_status"
                        name="post_status"
                        value={data.asset.status}
                        class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
                    >
                        <option value="publish">Publish</option>
                        <option value="draft">Draft</option>
                        <option value="pending">Pending Review</option>
                    </select>
                </div>
            </div>

            <div class="space-y-2">
                <Label for="content">Description / Content</Label>
                <textarea
                    id="content"
                    name="content"
                    rows="4"
                    class="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs"
                >{data.asset.raw_content}</textarea>
            </div>
        </div>

        <!-- Taxonomies Section: Renders multi-select checkboxes for all 4 registered WordPress taxonomies -->
        <div class="border rounded-md p-4 space-y-4 bg-card">
            <div class="border-b pb-2">
                <h2 class="text-base font-semibold">Taxonomies (Klasifikasi Asset)</h2>
                <p class="text-xs text-muted-foreground">
                    Pilih kategori/term untuk Aspect Ratios, Categories, Countries, dan Formats
                </p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {#each data.taxonomies ?? [] as tax (tax.slug)}
                    {@const terms = data.termsByTaxonomy?.[tax.slug] ?? []}
                    {@const selectedIds = data.asset.taxonomies?.[tax.slug] ?? []}
                    <div class="border rounded-md p-3 space-y-2">
                        <div class="flex items-center justify-between">
                            <Label class="font-medium">{tax.label}</Label>
                            <span class="text-xs text-muted-foreground font-mono">{tax.slug}</span>
                        </div>
                        {#if terms.length > 0}
                            <div class="max-h-36 overflow-y-auto space-y-1.5 pt-1">
                                {#each terms as term (term.id)}
                                    <label class="flex items-center gap-2 text-sm cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="tax_{tax.slug}"
                                            value={term.id}
                                            checked={selectedIds.includes(term.id)}
                                            class="rounded border-input"
                                        />
                                        <span>{term.name}</span>
                                    </label>
                                {/each}
                            </div>
                        {:else}
                            <p class="text-xs text-muted-foreground italic">
                                Belum ada term. Tambahkan di halaman Kelola Taxonomy.
                            </p>
                        {/if}
                    </div>
                {/each}
            </div>
        </div>

        <!-- Grup 1: Informasi Umum & Lokasi (Details Meta Box) -->
        <div class="border rounded-md p-4 space-y-4 bg-card">
            <h2 class="text-base font-semibold border-b pb-2">1. Informasi Umum & Lokasi (Meta Box)</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-2">
                    <Label for="resource_type">Resource Type</Label>
                    <select
                        id="resource_type"
                        name="resource_type"
                        value={meta.resource_type}
                        class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
                    >
                        <option value="">Choose Resource Type</option>
                        <option value="photo">Photo</option>
                        <option value="video">Video</option>
                        <option value="document">Document</option>
                        <option value="audio">Audio</option>
                    </select>
                </div>

                <div class="space-y-2">
                    <Label for="meta_status">Status (Asset)</Label>
                    <select
                        id="meta_status"
                        name="meta_status"
                        value={meta.status || 'active'}
                        class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
                    >
                        <option value="active">Active</option>
                        <option value="none active">None Active</option>
                    </select>
                </div>

                <div class="space-y-2">
                    <Label for="asset_license">Asset License</Label>
                    <select
                        id="asset_license"
                        name="asset_license"
                        value={meta.asset_license}
                        class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
                    >
                        <option value="">Choose License</option>
                        <option value="public_domain">Public Domain</option>
                        <option value="cc_by">Creative Common (CC-BY)</option>
                        <option value="copyrighted">Copyrighted (All Rights Reserved)</option>
                        <option value="active">Active (Legacy Coretez)</option>
                        <option value="none active">None Active (Legacy Coretez)</option>
                    </select>
                </div>

                <div class="space-y-2">
                    <Label for="date">Date</Label>
                    <Input type="date" id="date" name="date" value={meta.date} />
                </div>

                <div class="space-y-2">
                    <Label for="location">Location</Label>
                    <Input id="location" name="location" value={meta.location} />
                </div>

                <div class="space-y-2">
                    <Label for="source">Source</Label>
                    <Input id="source" name="source" value={meta.source} />
                </div>

                <div class="space-y-2">
                    <Label for="screen">Screen</Label>
                    <Input id="screen" name="screen" value={meta.screen} />
                </div>
            </div>
        </div>

        <!-- Grup 2: Kredit & Kontributor -->
        <div class="border rounded-md p-4 space-y-4 bg-card">
            <h2 class="text-base font-semibold border-b pb-2">2. Kredit & Kontributor</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-2">
                    <Label for="photographer">Photographer</Label>
                    <Input id="photographer" name="photographer" value={meta.photographer} />
                </div>

                <div class="space-y-2">
                    <Label for="editor">Editor</Label>
                    <Input id="editor" name="editor" value={meta.editor} />
                </div>

                <div class="space-y-2">
                    <Label for="credit">Credit</Label>
                    <Input id="credit" name="credit" value={meta.credit} />
                </div>

                <div class="space-y-2">
                    <Label for="named_person">Named person(s)</Label>
                    <Input id="named_person" name="named_person" value={meta.named_person} />
                </div>
            </div>
        </div>

        <!-- Grup 3: Deskripsi & Kata Kunci -->
        <div class="border rounded-md p-4 space-y-4 bg-card">
            <h2 class="text-base font-semibold border-b pb-2">3. Deskripsi & Kata Kunci</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-2">
                    <Label for="keyword_other">Keyword - Other</Label>
                    <Input id="keyword_other" name="keyword_other" value={meta.keyword_other} />
                </div>

                <div class="space-y-2">
                    <Label for="recognised">Keywords - Recognised</Label>
                    <Input id="recognised" name="recognised" value={meta.recognised} />
                </div>

                <div class="space-y-2">
                    <Label for="landmark">Keywords - Landmark</Label>
                    <Input id="landmark" name="landmark" value={meta.landmark} />
                </div>

                <div class="space-y-2">
                    <Label for="note">Notes</Label>
                    <Input id="note" name="note" value={meta.note} />
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-2">
                    <Label for="caption">Caption</Label>
                    <textarea
                        id="caption"
                        name="caption"
                        maxlength="400"
                        rows="4"
                        class="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs"
                    >{meta.caption}</textarea>
                </div>

                <div class="space-y-2">
                    <Label for="document_extract">Document extract (Readonly)</Label>
                    <textarea
                        id="document_extract"
                        name="document_extract"
                        maxlength="400"
                        rows="4"
                        readonly
                        class="flex w-full rounded-md border border-input bg-muted/40 px-3 py-2 text-sm shadow-xs"
                    >{meta.document_extract}</textarea>
                </div>
            </div>
        </div>

        <!-- Grup 4: Spesifikasi Teknis Media -->
        <div class="border rounded-md p-4 space-y-4 bg-card">
            <h2 class="text-base font-semibold border-b pb-2">4. Spesifikasi Teknis Media</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="space-y-2">
                    <Label for="file_size">File Size</Label>
                    <Input id="file_size" name="file_size" value={meta.file_size} />
                </div>

                <div class="space-y-2">
                    <Label for="duration">Duration</Label>
                    <Input id="duration" name="duration" value={meta.duration} />
                </div>

                <div class="space-y-2">
                    <Label for="sample">Sample rate</Label>
                    <Input id="sample" name="sample" value={meta.sample} />
                </div>

                <div class="space-y-2">
                    <Label for="audio_bitrate">Audio bitrate</Label>
                    <Input id="audio_bitrate" name="audio_bitrate" value={meta.audio_bitrate} />
                </div>

                <div class="space-y-2">
                    <Label for="frame_rate">Frame rate</Label>
                    <Input id="frame_rate" name="frame_rate" value={meta.frame_rate} />
                </div>

                <div class="space-y-2">
                    <Label for="video_bitrate">Video bitrate</Label>
                    <Input id="video_bitrate" name="video_bitrate" value={meta.video_bitrate} />
                </div>

                <div class="space-y-2">
                    <Label for="original_filename">Original File name (Readonly)</Label>
                    <Input id="original_filename" name="original_filename" value={meta.original_filename} readonly class="bg-muted/40" />
                </div>

                <div class="space-y-2">
                    <Label for="file_hash">File Hash (Readonly)</Label>
                    <Input id="file_hash" name="file_hash" value={meta.file_hash} readonly class="bg-muted/40" />
                </div>

                <div class="space-y-2">
                    <Label for="image_dimensions">Image Dimensions (Readonly)</Label>
                    <Input id="image_dimensions" name="image_dimensions" value={meta.image_dimensions} readonly class="bg-muted/40" />
                </div>

                <div class="space-y-2">
                    <Label for="mime_type">Mime Type (Readonly)</Label>
                    <Input id="mime_type" name="mime_type" value={meta.mime_type} readonly class="bg-muted/40" />
                </div>
            </div>
        </div>

        <div class="flex justify-end gap-2 pt-2">
            <Button href="/?tab=digital-asset" variant="ghost">Batal</Button>
            <Button type="submit">Simpan Perubahan</Button>
        </div>
    </form>
</div>
