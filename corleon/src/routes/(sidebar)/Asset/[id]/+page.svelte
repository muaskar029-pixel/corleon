<script>
  import { page } from '$app/state';
  import { Button, Spinner, Badge } from 'flowbite-svelte';
  import { getPostById } from '$lib/wp/axios.js';

  const id = page.params.id;
  const assetPromise = getPostById(id, 'digital_asset');

  const metaFields = [
    { key: 'resource_type', label: 'Resource Type' },
    { key: 'date', label: 'Date' },
    { key: 'status', label: 'Status' },
    { key: 'asset_license', label: 'Asset License' },
    { key: 'location', label: 'Location' },
    { key: 'screen', label: 'Screen' },
    { key: 'editor', label: 'Editor' },
    { key: 'photographer', label: 'Photographer' },
    { key: 'file_size', label: 'File Size' },
    { key: 'keyword_other', label: 'Keyword - Other' },
    { key: 'named_person', label: 'Named person(s)' },
    { key: 'credit', label: 'Credit' },
    { key: 'note', label: 'Notes' },
    { key: 'recognised', label: 'Keywords - Recognised' },
    { key: 'landmark', label: 'Keywords - Landmark' },
    { key: 'source', label: 'Source' },
    { key: 'duration', label: 'Duration' },
    { key: 'sample', label: 'Sample rate' },
    { key: 'audio_bitrate', label: 'Audio bitrate' },
    { key: 'frame_rate', label: 'Frame rate' },
    { key: 'video_bitrate', label: 'Video bitrate' },
    { key: 'original_filename', label: 'Original File name' },
    { key: 'file_hash', label: 'File Hash' },
    { key: 'image_dimensions', label: 'Image Dimensions' },
    { key: 'mime_type', label: 'Mime Type' },
    { key: 'caption', label: 'Caption' },
    { key: 'document_extract', label: 'Document extract' }
  ];
</script>

<div class="bg-gradient-to-br from-[#F7F6FF] via-[#F7F6FF] to-[#FDE4E6] p-6 text-[#0E0347] dark:from-[#0B0711] dark:via-[#0B0711] dark:to-[#0E0347] dark:text-[#FFFFFF]">
  {#await assetPromise}
    <Spinner />
  {:then asset}
    {@const imageUrl = asset._embedded?.['wp:featuredmedia']?.[0]?.source_url}
    {@const rawMeta = asset.metabox?.all_meta || {}}
    {@const terms = asset._embedded?.['wp:term']?.flat() || []}

    <div class="mb-6 flex max-w-4xl items-center justify-between">
      <h1 class="text-h4 font-bold text-[#0E0347] dark:text-[#FFFFFF]">
        {@html asset.title.rendered}
      </h1>
      <div class="flex gap-2">
        <Button
          size="sm"
          href={`/Asset/${id}/edit`}
          class="rounded-full bg-[#DB000F] px-5 text-white hover:bg-[#BB080B]"
        >
          Edit
        </Button>
        <Button
          size="sm"
          href="/Asset"
          class="rounded-full border border-[#0E0347] bg-transparent px-5 text-[#0E0347] hover:bg-[#0E0347] hover:text-white dark:border-white dark:bg-transparent dark:text-white dark:hover:bg-white dark:hover:text-[#0E0347]"
        >
          Back
        </Button>
      </div>
    </div>

    <div class="max-w-4xl space-y-6 rounded-2xl border border-[#C4C0D4]/40 bg-white p-6 shadow-[0_8px_24px_-12px_rgba(14,3,71,0.25)] dark:border-white/10 dark:bg-[#150B52]">
      {#if imageUrl}
        <img src={imageUrl} alt="Thumbnail" class="max-h-80 w-full rounded-xl object-cover" />
      {/if}

      <div class="flex flex-wrap items-center gap-2 text-body-sm text-[#0B2E8D] dark:text-[#C4C0D4]">
        <span>Published: {new Date(asset.date).toLocaleDateString()}</span>
        {#each terms as term}
          <Badge class="rounded-full bg-[#0B2E8D] px-3 py-0.5 text-white dark:bg-[#0035C6]">
            {term.name}
          </Badge>
        {/each}
      </div>

      <div class="text-body text-[#0E0347] dark:text-[#FFFFFF]">
        {@html asset.content.rendered}
      </div>

      <div>
        <h2 class="mb-3 text-h5 font-bold text-[#0E0347] dark:text-[#FFFFFF]">Details (Metabox)</h2>
        <div class="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {#each metaFields as field}
            <div class="rounded-xl border border-[#C4C0D4]/40 bg-[#F7F6FF] p-3 dark:border-[#0035C6]/30 dark:bg-[#0E0347]">
              <p class="text-body-sm text-[#0B2E8D] dark:text-[#C4C0D4]">{field.label}</p>
              <p class="text-body font-bold text-[#0E0347] dark:text-[#FFFFFF]">
                {rawMeta[field.key]?.[0] || '-'}
              </p>
            </div>
          {/each}
        </div>
      </div>
    </div>
  {:catch err}
    <p class="text-[#DB000F]">Failed to load asset: {err.message}</p>
  {/await}
</div>
