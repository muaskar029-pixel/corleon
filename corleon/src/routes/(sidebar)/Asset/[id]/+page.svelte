<script>
  import { page } from '$app/state';
  import { Button } from 'flowbite-svelte';
  import PencilSimpleIcon from 'phosphor-svelte/lib/PencilSimpleIcon';
  import ArrowLeftIcon from 'phosphor-svelte/lib/ArrowLeftIcon';
  import { getPostById } from '$lib/wp/axios.js';
  import PageBanner from '../PageBanner.svelte';
  import { fieldGroups } from '../fields.js';

  const id = page.params.id;
  const assetPromise = getPostById(id, 'digital_asset');

  const formatDate = (d) => new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
</script>

<div
  class="bg-[radial-gradient(circle_at_0%_100%,rgba(219,0,15,0.10),transparent_45%),linear-gradient(135deg,#F7F6FF,#F7F6FF,#FDE4E6)] p-6 text-[#0E0347] dark:bg-[radial-gradient(circle_at_0%_100%,rgba(219,0,15,0.16),transparent_45%),linear-gradient(135deg,#0B0711,#0B0711,#0E0347)] dark:text-[#FFFFFF]"
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
    {@const value = (key) => rawMeta[key]?.[0]}
    {@const groups = fieldGroups
      .map((g) => ({ ...g, fields: g.fields.filter((f) => value(f.key)) }))
      .filter((g) => g.fields.length > 0)}

    <PageBanner eyebrow="Detail Asset" titleHtml={asset.title.rendered}>
      {#snippet meta()}
        <p class="text-body-sm text-[#C4C0D4]">Dipublikasikan {formatDate(asset.date)}</p>
      {/snippet}
      {#snippet actions()}
        <Button
          size="sm"
          href={`/Asset/${id}/edit`}
          class="gap-2 rounded-full bg-white px-5 font-bold tracking-wide text-[#DB000F] hover:bg-[#F7F6FF] dark:bg-white dark:text-[#DB000F] dark:hover:bg-[#F7F6FF]"
        >
          <PencilSimpleIcon size={16} weight="bold" /> Edit
        </Button>
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
      <!-- left: full image (object-contain, never cropped) + taxonomy terms -->
      <div class="space-y-4 rounded-2xl border border-[#C4C0D4]/40 bg-white p-4 shadow-[0_8px_24px_-12px_rgba(14,3,71,0.25)] dark:border-white/10 dark:bg-[#150B52]">
        <div class="relative aspect-[4/3] overflow-hidden rounded-xl bg-[#F7F6FF] dark:bg-[#0E0347]">
          {#if imageUrl}
            <img src={imageUrl} alt="" class="absolute inset-0 h-full w-full object-contain" />
          {:else}
            <div class="text-body-sm flex h-full items-center justify-center text-[#C4C0D4]">No image</div>
          {/if}
        </div>
        {#if terms.length > 0}
          <div class="flex flex-wrap gap-1.5">
            {#each terms as term}
              <span class="text-body-sm rounded-full bg-[#0B2E8D]/10 px-3 py-0.5 font-medium text-[#0B2E8D] dark:bg-[#0035C6]/30 dark:text-[#C4C0D4]">
                {term.name}
              </span>
            {/each}
          </div>
        {/if}
      </div>

      <!-- right: description + grouped details; empty fields are hidden -->
      <div class="space-y-6 rounded-2xl border border-[#C4C0D4]/40 bg-white p-6 shadow-[0_8px_24px_-12px_rgba(14,3,71,0.25)] dark:border-white/10 dark:bg-[#150B52]">
        {#if asset.content.rendered.trim()}
          <div class="wp-content text-body leading-relaxed text-[#0E0347] dark:text-white">
            {@html asset.content.rendered}
          </div>
        {/if}

        <div>
          <h2 class="text-h5 mb-4 font-bold text-[#0E0347] dark:text-white">Detail Asset</h2>
          {#if groups.length === 0}
            <p class="text-body-sm text-[#0B2E8D]/70 dark:text-[#C4C0D4]/70">Belum ada detail untuk asset ini.</p>
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
  {:catch err}
    <div class="rounded-2xl border border-[#DB000F]/30 bg-[#A10000]/10 p-6 text-[#DB000F] dark:bg-[#A10000]/30 dark:text-white">
      <p class="text-h6 font-bold">Asset gagal dimuat</p>
      <p class="text-body-sm mt-1">{err.message}</p>
    </div>
  {/await}
</div>
