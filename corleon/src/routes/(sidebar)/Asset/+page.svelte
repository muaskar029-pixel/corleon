<script>
  import { Card, Spinner, Button, Badge, Input } from 'flowbite-svelte';
  import { getPosts, deletePost } from '$lib/wp/axios.js';

  let page = $state(1);
  let search = $state('');
  const perPage = 9;

  let assetsPromise = $derived(getPosts('digital_asset', page, search, perPage));

  async function remove(id) {
    if (!confirm('Delete this item?')) return;
    await deletePost(id, 'digital_asset');
    assetsPromise = getPosts('digital_asset', page, search, perPage);
  }
</script>

<div class="p-4">
  <div class="mb-4 flex items-center justify-between">
    <h1 class="text-2xl font-bold dark:text-white">Digital Assets</h1>

    <div class="flex gap-2">
      <Input
        size="sm"
        placeholder="Search assets..."
        bind:value={search}
        oninput={() => (page = 1)}
      />
      <Button size="sm" href="/Asset/create" class="shrink-0">+ Add New</Button>
    </div>
  </div>

  {#await assetsPromise}
    <Spinner />
  {:then assets}
    <div class="grid gap-4 md:grid-cols-3">
      {#each assets as asset}
        {@const meta = asset.metabox?.all_meta || {}}
        {@const terms = asset._embedded?.['wp:term']?.flat() || []}
        <Card img={asset._embedded?.['wp:featuredmedia']?.[0]?.source_url}>
          <div class="mb-2 flex items-center justify-between">
            <h5 class="text-xl font-bold dark:text-white">
              {@html asset.title.rendered}
            </h5>
            {#if meta.resource_type?.[0]}
              <Badge>{meta.resource_type[0]}</Badge>
            {/if}
          </div>

          {#if terms.length > 0}
            <div class="mb-2 flex flex-wrap gap-1">
              {#each terms as term}
                <Badge color="indigo">{term.name}</Badge>
              {/each}
            </div>
          {/if}

          <div class="mb-3 text-sm text-gray-700 dark:text-gray-400">
            {@html asset.content.rendered}
          </div>

          <p class="mb-4 text-xs text-gray-500">
            {new Date(asset.date).toLocaleDateString()}
          </p>

          <div class="flex gap-2">
            <Button size="xs" href={`/Asset/${asset.id}`}>View</Button>
            <Button size="xs" color="alternative" href={`/Asset/${asset.id}/edit`}>Edit</Button>
            <Button size="xs" color="red" onclick={() => remove(asset.id)}>Delete</Button>
          </div>
        </Card>
      {/each}
    </div>

    <div class="mt-6 flex items-center justify-between">
      <Button size="sm" color="alternative" disabled={page <= 1} onclick={() => page--}>
        Previous
      </Button>
      <span class="text-sm text-gray-600 dark:text-gray-400">Page {page}</span>
      <Button size="sm" color="alternative" disabled={assets.length < perPage} onclick={() => page++}>
        Next
      </Button>
    </div>
  {:catch err}
    <p class="text-red-600">Failed to load digital assets: {err.message}</p>
  {/await}
</div>
