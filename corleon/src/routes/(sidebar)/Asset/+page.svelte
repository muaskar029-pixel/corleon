<script>
  import { onMount } from 'svelte';
  import { Card, Spinner, Button, Badge, Input } from 'flowbite-svelte';
  import { getPosts, deletePost, getCurrentUser } from '$lib/wp/axios.js';
  import PageBanner from '$lib/PageBanner.svelte';
  import PlusIcon from 'phosphor-svelte/lib/PlusIcon';
  import { isAdmin, canEditAssets, canViewAsset } from '../crud/users/roles.js';
  import { Search, Dropdown, DropdownItem } from "flowbite-svelte";
  import { SearchOutline, ChevronDownOutline } from "flowbite-svelte-icons";

  const items = [
    {
      label: "All categories"
    },
    {
      label: "Mockups"
    },
    {
      label: "Templates"
    },
    {
      label: "Design"
    },
    {
      label: "Logos"
    }
  ];

  let selectCategory = $state("All categories");

  let page = $state(1);
  let search = $state('');
  const perPage = 9;

  let currentUser = $state(null);

  onMount(() => {
    currentUser = getCurrentUser();
  });

  let role = $derived(currentUser?.roles?.[0] ?? '');
  let canCreate = $derived(canEditAssets(role));
  let canEdit = $derived(canEditAssets(role));
  let canDelete = $derived(isAdmin(role));

  let assetsPromise = $derived(getPosts('digital_asset', page, search, perPage));

  async function remove(id) {
    if (!confirm('Delete this item?')) return;
    await deletePost(id, 'digital_asset');
    assetsPromise = getPosts('digital_asset', page, search, perPage);
  }

</script>

<!-- base gradient + faint red glow bottom-left so the brand red warms the whole page -->
<div
  class="brand-page"
>
  <PageBanner eyebrow="Asset Library" title="Digital Assets">
    {#snippet actions()}
      {#if canCreate}
        <!-- white CTA: a red button would vanish on the red end of the banner -->
        <Button
          size="sm"
          href="/Asset/create"
          class="shrink-0 gap-2 rounded-full bg-white px-5 font-bold tracking-wide text-[#DB000F] hover:bg-[#F7F6FF] dark:bg-white dark:text-[#DB000F] dark:hover:bg-[#F7F6FF]"
        >
          <PlusIcon size={16} weight="bold" /> Add New
        </Button>
      {/if}
    {/snippet}
  </PageBanner>

  <form class="flex pb-6">
  <div class="relative">
    <Button class="border-primary-700 rounded-e-none border border-e-0 whitespace-nowrap">
      {selectCategory}
      <ChevronDownOutline class="ms-2.5 h-6 w-6" />
    </Button>
    <Dropdown simple class="w-40">
      {#each items as { label } (label)}
        <DropdownItem
          onclick={() => {
            selectCategory = label;
          }}
          class={selectCategory === label ? "underline" : ""}
        >
          {label}
        </DropdownItem>
      {/each}
    </Dropdown>
  </div>
  <Search size="lg" classes={{ input: "rounded-none py-2.5" }} placeholder="Search Mockups, Logos, Design Templates..." />
  <Button class="rounded-s-none p-2!">
    <SearchOutline class="h-6 w-6" />
  </Button>
</form>

  {#await assetsPromise}
    <Spinner />
  {:then assets}
    {@const visibleAssets = assets.filter((a) => canViewAsset(role, a))}
    <!-- auto-rows-fr: every row as tall as the tallest card, so all boxes match -->
    <div class="grid auto-rows-fr gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
      {#each visibleAssets as asset}
        {@const meta = asset.metabox?.all_meta || {}}
        {@const thumb = asset._embedded?.['wp:featuredmedia']?.[0]?.source_url}
        <Card
          size="xl"
          class="h-full overflow-hidden rounded-2xl border border-[#C4C0D4]/40 bg-white shadow-[0_8px_24px_-12px_rgba(14,3,71,0.25)] dark:border-white/10 dark:bg-[#150B52]"
        >
          <!-- fixed 4:3 frame; img is absolute so tall images cannot stretch it -->
          <a href={`/Asset/${asset.id}`} class="relative mx-4 mt-4 block aspect-[4/3] shrink-0 overflow-hidden rounded-xl bg-[#F7F6FF] dark:bg-[#0E0347]">
            {#if thumb}
              <img
                src={thumb}
                alt=""
                loading="lazy"
                class="absolute inset-0 h-full w-full object-cover"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-[#0B0711]/50 via-transparent to-transparent"></div>
            {:else}
              <div class="text-body-sm flex h-full items-center justify-center text-[#C4C0D4]">No image</div>
            {/if}
            {#if meta.resource_type?.[0]}
              <span class="absolute top-3 left-3 rounded-full bg-[#DB000F] px-3 py-1 text-xs font-bold tracking-wide text-white uppercase shadow">
                {meta.resource_type[0]}
              </span>
            {/if}
          </a>

          <div class="flex flex-1 flex-col p-4">
            <a href={`/Asset/${asset.id}`} class="mb-1">
              <h5 class="text-h6 line-clamp-2 leading-snug font-semibold tracking-tight text-[#0E0347] dark:text-white">
                {@html asset.title.rendered}
              </h5>
            </a>
            <p class="mb-3 text-xs font-bold tracking-wider text-[#0B2E8D]/70 uppercase dark:text-[#C4C0D4]/70">
              {new Date(asset.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>


            <div class="text-body-sm mb-4 line-clamp-2 leading-relaxed text-[#0E0347]/70 dark:text-[#C4C0D4]">
              {@html asset.content.rendered}
            </div>

            <div class="mt-auto flex items-center gap-2 border-t border-[#C4C0D4]/40 pt-4 dark:border-[#0035C6]/30">
              <Button size="xs" href={`/Asset/${asset.id}`} class="rounded-full font-bold tracking-wide bg-[#DB000F] px-4 text-white hover:bg-[#BB080B] dark:bg-[#DB000F] dark:hover:bg-[#BB080B]">View</Button>
              {#if canEdit}
                <Button
                  size="xs"
                  href={`/Asset/${asset.id}/edit`}
                  class="rounded-full font-bold tracking-wide border border-[#0E0347] bg-transparent px-4 text-[#0E0347] hover:bg-[#0E0347] hover:text-white dark:border-white dark:bg-transparent dark:text-white dark:hover:bg-white dark:hover:text-[#0E0347]"
                >
                  Edit
                </Button>
              {/if}
              {#if canDelete}
                <Button
                  size="xs"
                  onclick={() => remove(asset.id)}
                  class="ml-auto rounded-full font-bold tracking-wide bg-transparent px-3 text-[#DB000F] hover:bg-[#DB000F]/10 dark:bg-transparent dark:text-[#ff4d58] dark:hover:bg-[#DB000F]/20"
                >
                  Delete
                </Button>
              {/if}
            </div>
          </div>
        </Card>
      {/each}
    </div>

    <div class="mt-8 flex items-center justify-between">
      <Button
        size="sm"
        disabled={page <= 1}
        onclick={() => page--}
        class="rounded-full font-bold tracking-wide border border-[#0E0347] bg-transparent px-5 text-[#0E0347] hover:bg-[#0E0347] hover:text-white dark:border-white dark:bg-transparent dark:text-white dark:hover:bg-white dark:hover:text-[#0E0347]"
      >
        Previous
      </Button>
      <span class="font-heading text-body-sm font-semibold tracking-wide text-[#0E0347] dark:text-[#C4C0D4]">Page {page}</span>
      <Button
        size="sm"
        disabled={assets.length < perPage}
        onclick={() => page++}
        class="rounded-full font-bold tracking-wide border border-[#0E0347] bg-transparent px-5 text-[#0E0347] hover:bg-[#0E0347] hover:text-white dark:border-white dark:bg-transparent dark:text-white dark:hover:bg-white dark:hover:text-[#0E0347]"
      >
        Next
      </Button>
    </div>
  {:catch err}
    <p class="text-[#DB000F]">Failed to load digital assets: {err.message}</p>
  {/await}
</div>
