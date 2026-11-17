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

<div class="p-4">
  {#await assetPromise}
    <Spinner />
  {:then asset}
    {@const imageUrl = asset._embedded?.['wp:featuredmedia']?.[0]?.source_url}
    {@const rawMeta = asset.metabox?.all_meta || {}}
    {@const terms = asset._embedded?.['wp:term']?.flat() || []}

    <div class="mb-4 flex max-w-4xl items-center justify-between">
      <h1 class="text-2xl font-bold dark:text-white">
        {@html asset.title.rendered}
      </h1>
      <div class="flex gap-2">
        <Button size="sm" href={`/Asset/${id}/edit`}>Edit</Button>
        <Button size="sm" color="alternative" href="/Asset">Back</Button>
      </div>
    </div>

    <div class="max-w-4xl space-y-6">
      {#if imageUrl}
        <img src={imageUrl} alt="Thumbnail" class="max-h-80 w-full rounded-lg object-cover" />
      {/if}

      <div class="flex flex-wrap items-center gap-2 text-sm text-gray-500">
        <span>Published: {new Date(asset.date).toLocaleDateString()}</span>
        {#each terms as term}
          <Badge color="indigo">{term.name}</Badge>
        {/each}
      </div>

      <div class="text-base text-gray-800 dark:text-gray-200">
        {@html asset.content.rendered}
      </div>

      <div>
        <h2 class="mb-3 text-lg font-semibold dark:text-white">Details (Metabox)</h2>
        <div class="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {#each metaFields as field}
            <div class="rounded-lg border p-3 dark:border-gray-700">
              <p class="text-xs text-gray-500">{field.label}</p>
              <p class="font-medium dark:text-white">{rawMeta[field.key]?.[0] || '-'}</p>
            </div>
          {/each}
        </div>
      </div>
    </div>
  {:catch err}
    <p class="text-red-600">Failed to load asset: {err.message}</p>
  {/await}
</div>
