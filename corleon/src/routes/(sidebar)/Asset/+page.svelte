<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { Card, Spinner, Button, Badge, Input } from 'flowbite-svelte';
  import { getPosts, deletePost, getCurrentUser, logoutJwt } from '$lib/wp/axios.js';

  let page = $state(1);
  let search = $state('');
  const perPage = 9;

  let currentUser = $state(null);

  onMount(() => {
    currentUser = getCurrentUser();
  });

  let role = $derived(currentUser?.roles?.[0] || 'administrator');
  let canCreate = $derived(role === 'administrator' || role === 'dam_contributor');
  let canEdit = $derived(role === 'administrator' || role === 'dam_contributor');
  let canDelete = $derived(role === 'administrator');

  function canViewAsset(asset) {
    if (role === 'administrator') return true;

    const terms = asset._embedded?.['wp:term']?.flat() || [];
    const accessTerms = terms
      .filter((t) => t.taxonomy === 'access_level')
      .map((t) => t.slug.toLowerCase());

    if (role === 'dam_contributor') {
      return !accessTerms.includes('restricted') && !accessTerms.includes('confidential');
    }

    return (
      !accessTerms.includes('internal') &&
      !accessTerms.includes('restricted') &&
      !accessTerms.includes('confidential')
    );
  }

  let assetsPromise = $derived(getPosts('digital_asset', page, search, perPage));

  async function remove(id) {
    if (!confirm('Delete this item?')) return;
    await deletePost(id, 'digital_asset');
    assetsPromise = getPosts('digital_asset', page, search, perPage);
  }

  function handleLogout() {
    logoutJwt();
    goto('/authentication/sign-in');
  }
</script>

<div class="p-4">
  <div class="mb-4 flex flex-wrap items-center justify-between gap-2">
    <div>
      <h1 class="text-2xl font-bold dark:text-white">Digital Assets</h1>
      {#if currentUser}
        <p class="text-xs text-gray-500">
          Logged in as: <strong>{currentUser.name}</strong> ({role})
          <button class="ml-2 text-red-600 underline" onclick={handleLogout}>Logout</button>
        </p>
      {:else}
        <p class="text-xs text-gray-500">
          <a href="/authentication/sign-in" class="text-blue-600 underline">Sign in with JWT</a>
        </p>
      {/if}
    </div>

    <div class="flex gap-2">
      <Input
        size="sm"
        placeholder="Search assets..."
        bind:value={search}
        oninput={() => (page = 1)}
      />
      {#if canCreate}
        <Button size="sm" href="/Asset/create" class="shrink-0">+ Add New</Button>
      {/if}
    </div>
  </div>

  {#await assetsPromise}
    <Spinner />
  {:then assets}
    {@const visibleAssets = assets.filter(canViewAsset)}
    <div class="grid gap-4 md:grid-cols-3">
      {#each visibleAssets as asset}
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
            {#if canEdit}
              <Button size="xs" color="alternative" href={`/Asset/${asset.id}/edit`}>Edit</Button>
            {/if}
            {#if canDelete}
              <Button size="xs" color="red" onclick={() => remove(asset.id)}>Delete</Button>
            {/if}
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
