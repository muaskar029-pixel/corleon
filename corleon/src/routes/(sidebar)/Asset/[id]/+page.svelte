<script>
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import { Button } from 'flowbite-svelte';
  import PencilSimpleIcon from 'phosphor-svelte/lib/PencilSimpleIcon';
  import ArrowLeftIcon from 'phosphor-svelte/lib/ArrowLeftIcon';
  import { getPostById, getCurrentUser } from '$lib/wp/axios.js';
  import PageBanner from '$lib/PageBanner.svelte';
  import NoAccess from '$lib/NoAccess.svelte';
  import { fieldGroups } from '../fields.js';
  import { canEditAssets, canViewAsset } from '../../crud/users/roles.js';

  const id = page.params.id;
  const assetPromise = getPostById(id, 'digital_asset');

  // localStorage is browser-only, so the role is read after mount
  let role = $state('');
  onMount(() => (role = getCurrentUser()?.roles?.[0] ?? ''));

  const formatDate = (d) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
</script>

<div
  class="brand-page"
>
  {#await assetPromise}
    <!-- skeleton in the same shape as the loaded page -->
    <div class="mb-8 h-32 animate-pulse rounded-2xl bg-[#0E0347]/10 dark:bg-white/5"></div>
    <div class="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
      <div class="aspect-[4/3] animate-pulse rounded-2xl bg-[#0E0347]/10 dark:bg-white/5"></div>
      <div class="h-96 animate-pulse rounded-2xl bg-[#0E0347]/10 dark:bg-white/5"></div>
    </div>
  {:then asset}
    {@const imageUrl = asset._embedded?.['wp:featuredmedia']?.[0]?.source_url}
    {@const rawMeta = asset.metabox?.all_meta || {}}
    {@const terms = asset._embedded?.['wp:term']?.flat() || []}
    <!-- group terms by taxonomy slug, e.g. { access_level: [...], country: [...] } -->
    {@const termGroups = Object.entries(terms.reduce((acc, t) => ((acc[t.taxonomy] ??= []).push(t), acc), {}))}
    {@const value = (key) => rawMeta[key]?.[0]}
    {@const groups = fieldGroups
      .map((g) => ({ ...g, fields: g.fields.filter((f) => value(f.key)) }))
      .filter((g) => g.fields.length > 0)}

    {#if !canViewAsset(role, asset)}
      <NoAccess message="Your access level cannot view this asset." backHref="/Asset" backLabel="Back to assets" />
    {:else}
    <PageBanner eyebrow="Asset Details" titleHtml={asset.title.rendered}>
      {#snippet meta()}
        <p class="text-body-sm text-[#C4C0D4]">Published {formatDate(asset.date)}</p>
      {/snippet}
      {#snippet actions()}
        {#if canEditAssets(role)}
          <Button
            size="sm"
            href={`/Asset/${id}/edit`}
            class="gap-2 rounded-full bg-white px-5 font-bold tracking-wide text-[#DB000F] hover:bg-[#F7F6FF] dark:bg-white dark:text-[#DB000F] dark:hover:bg-[#F7F6FF]"
          >
            <PencilSimpleIcon size={16} weight="bold" /> Edit
          </Button>
        {/if}
        <Button
          size="sm"
          href="/Asset"
          class="gap-2 rounded-full border border-white bg-transparent px-5 font-bold tracking-wide text-white hover:bg-white hover:text-[#0E0347] dark:bg-transparent dark:hover:bg-white"
        >
          <ArrowLeftIcon size={16} weight="bold" /> Back
        </Button>
      {/snippet}
    </PageBanner>

    <div class="grid items-start gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
      <!-- left: full image (object-contain, never cropped) -->
      <div class="space-y-4 rounded-2xl border border-[#C4C0D4]/40 bg-white p-4 shadow-[0_8px_24px_-12px_rgba(14,3,71,0.25)] dark:border-white/10 dark:bg-[#150B52]">
        <div class="relative aspect-[4/3] overflow-hidden rounded-xl bg-[#F7F6FF] dark:bg-[#0E0347]">
          {#if imageUrl}
            <img src={imageUrl} alt="" class="absolute inset-0 h-full w-full object-contain" />
          {:else}
            <div class="text-body-sm flex h-full items-center justify-center text-[#C4C0D4]">No image</div>
          {/if}
        </div>
      </div>

      <!-- right: description + grouped details; empty fields are hidden -->
      <div class="space-y-6 rounded-2xl border border-[#C4C0D4]/40 bg-white p-6 shadow-[0_8px_24px_-12px_rgba(14,3,71,0.25)] dark:border-white/10 dark:bg-[#150B52]">
        {#if asset.content.rendered.trim()}
          <div class="wp-content text-body leading-relaxed text-[#0E0347] dark:text-white">
            {@html asset.content.rendered}
          </div>
        {/if}

        <section>
          <h3 class="text-body-sm mb-2 font-bold tracking-wider text-[#DB000F] uppercase">Classification</h3>
          {#if termGroups.length === 0}
            <p class="text-body-sm text-[#0B2E8D]/70 dark:text-[#C4C0D4]/70">No classification yet.</p>
          {/if}
          <div class="grid gap-3 sm:grid-cols-2">
            {#each termGroups as [taxonomy, items]}
              <div class="rounded-xl border border-[#C4C0D4]/40 bg-[#F7F6FF] p-3 dark:border-white/10 dark:bg-[#0E0347]">
                <!-- slug -> label: access_level -> Access level -->
                <p class="text-body-sm mb-1.5 text-[#0B2E8D] capitalize dark:text-[#C4C0D4]">{taxonomy.replace(/[_-]/g, ' ')}</p>
                <div class="flex flex-wrap gap-1.5">
                  {#each items as term}
                    <span class="text-body-sm rounded-full bg-[#0B2E8D]/10 px-3 py-0.5 font-bold text-[#0B2E8D] dark:bg-[#0035C6]/30 dark:text-white">
                      {term.name}
                    </span>
                  {/each}
                </div>
              </div>
            {/each}
          </div>
        </section>

        <div>
          <h2 class="text-h5 mb-4 font-bold text-[#0E0347] dark:text-white">Asset Details</h2>
          {#if groups.length === 0}
            <p class="text-body-sm text-[#0B2E8D]/70 dark:text-[#C4C0D4]/70">No details for this asset yet.</p>
          {/if}
          <div class="space-y-5">
            {#each groups as group}
              <section>
                <h3 class="text-body-sm mb-2 font-bold tracking-wider text-[#DB000F] uppercase">{group.name}</h3>
                <div class="grid gap-3 sm:grid-cols-2">
                  {#each group.fields as field}
                    <div class="rounded-xl border border-[#C4C0D4]/40 bg-[#F7F6FF] p-3 dark:border-white/10 dark:bg-[#0E0347] {field.type === 'textarea' ? 'sm:col-span-2' : ''}">
                      <p class="text-body-sm text-[#0B2E8D] dark:text-[#C4C0D4]">{field.label}</p>
                      <p class="text-body font-bold break-words text-[#0E0347] dark:text-white">{value(field.key)}</p>
                    </div>
                  {/each}
                </div>
              </section>
            {/each}
          </div>
        </div>
      </div>
    </div>
    {/if}
  {:catch err}
    <div class="rounded-2xl border border-[#DB000F]/30 bg-[#A10000]/10 p-6 text-[#DB000F] dark:bg-[#A10000]/30 dark:text-white">
      <p class="text-h6 font-bold">Failed to load asset</p>
      <p class="text-body-sm mt-1">{err.message}</p>
    </div>
  {/await}
</div>
