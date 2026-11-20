<script>
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import { Button, Input, Label, Textarea, Select, Checkbox } from 'flowbite-svelte';
  import FloppyDiskIcon from 'phosphor-svelte/lib/FloppyDiskIcon';
  import XIcon from 'phosphor-svelte/lib/XIcon';
  import { getPostById, updatePost, uploadMedia, getTaxonomies, getCurrentUser } from '$lib/wp/axios.js';
  import PageBanner from '$lib/PageBanner.svelte';
  import NoAccess from '$lib/NoAccess.svelte';
  import { fieldGroups } from '../../fields.js';
  import { isAdmin, canEditAssets, canViewAsset } from '../../../crud/users/roles.js';

  const id = page.params.id;

  // localStorage is browser-only, so the role is read after mount
  let role = $state('');
  onMount(() => (role = getCurrentUser()?.roles?.[0] ?? ''));
  let asset = $state.raw(null);

  let title = $state('');
  let content = $state('');
  let taxonomies = $state([]);
  let selectedTerms = $state({});
  let imageUrl = $state('');
  let imageFile = $state(null);
  let loading = $state(true);
  let saving = $state(false);
  let errorMsg = $state('');

  let metabox = $state({
    resource_type: '',
    date: '',
    location: '',
    screen: '',
    editor: '',
    photographer: '',
    file_size: '',
    caption: '',
    keyword_other: '',
    named_person: '',
    credit: '',
    note: '',
    document_extract: '',
    recognised: '',
    landmark: '',
    source: '',
    status: 'active',
    duration: '',
    sample: '',
    audio_bitrate: '',
    frame_rate: '',
    video_bitrate: '',
    original_filename: '',
    file_hash: '',
    image_dimensions: '',
    asset_license: '',
    mime_type: ''
  });

  // every form segment is its own card so sections read as separate blocks
  const card =
    'rounded-2xl border border-[#C4C0D4]/40 bg-white p-6 shadow-[0_8px_24px_-12px_rgba(14,3,71,0.25)] dark:border-white/10 dark:bg-[#150B52]';

  const cleanHtml = (html = '') => html.replace(/<[^>]+>/g, '').trim();

  Promise.all([getPostById(id, 'digital_asset'), getTaxonomies('digital_asset')])
    .then(([data, taxList]) => {
      asset = data;
      title = cleanHtml(data.title?.rendered);
      content = cleanHtml(data.content?.rendered);
      imageUrl = data._embedded?.['wp:featuredmedia']?.[0]?.source_url || '';

      const rawMeta = data.metabox?.all_meta || {};
      for (const key of Object.keys(metabox)) {
        if (rawMeta[key]) {
          metabox[key] = rawMeta[key][0] ?? '';
        }
      }

      taxonomies = taxList;
      const initialTerms = {};
      for (const tax of taxList) {
        initialTerms[tax.rest_base] = data[tax.rest_base] || [];
      }
      selectedTerms = initialTerms;
    })
    .catch((err) => {
      errorMsg = err.response?.data?.message || err.message;
    })
    .finally(() => {
      loading = false;
    });

  async function save(e) {
    e.preventDefault();
    saving = true;
    errorMsg = '';

    try {
      const payload = {
        title,
        content,
        metabox,
        ...selectedTerms
      };

      if (imageFile) {
        const media = await uploadMedia(imageFile);
        payload.featured_media = media.id;
      }

      await updatePost(id, payload, 'digital_asset');
      goto(`/Asset/${id}`);
    } catch (err) {
      errorMsg = err.response?.data?.message || err.message;
    } finally {
      saving = false;
    }
  }
</script>

<div
  class="brand-page"
>
  <PageBanner eyebrow="Edit Asset" title={title || `Asset #${id}`}>
    {#snippet actions()}
      <Button
        size="sm"
        href={`/Asset/${id}`}
        class="gap-2 rounded-full border border-white bg-transparent px-5 font-bold tracking-wide text-white hover:bg-white hover:text-[#0E0347] dark:bg-transparent dark:hover:bg-white"
      >
        <XIcon size={16} weight="bold" /> Cancel
      </Button>
    {/snippet}
  </PageBanner>

  {#if errorMsg}
    <div class="text-body-sm mb-6 rounded-2xl border border-[#DB000F]/30 bg-[#A10000]/10 p-4 text-[#DB000F] dark:bg-[#A10000]/30 dark:text-white">
      <span class="font-bold">Error:</span> {errorMsg}
    </div>
  {/if}

  {#if loading}
    <div class="h-[32rem] animate-pulse rounded-2xl bg-[#0E0347]/10 dark:bg-white/5"></div>
  {:else if asset && !(canEditAssets(role) && canViewAsset(role, asset))}
    <NoAccess message="Your access level cannot edit this asset." backHref="/Asset" backLabel="Back to assets" />
  {:else}
    <form class="brand-form space-y-6" onsubmit={save}>
      <section class="{card} grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <!-- cover: 4:3 frame, whole image visible -->
        <div>
          <Label class="mb-2">Cover Image</Label>
          <div class="relative mb-3 aspect-[4/3] overflow-hidden rounded-xl bg-[#F7F6FF] dark:bg-[#0E0347]">
            {#if imageUrl}
              <img src={imageUrl} alt="" class="absolute inset-0 h-full w-full object-contain" />
            {:else}
              <div class="text-body-sm flex h-full items-center justify-center text-[#C4C0D4]">No image</div>
            {/if}
          </div>
          <!-- native file input is hidden (its built-in button gets clipped); the label is the clickable button -->
          <label class="inline-flex cursor-pointer items-center gap-3 rounded-full focus-within:ring-2 focus-within:ring-[#DB000F]">
            <input type="file" accept="image/*" class="sr-only" onchange={(e) => (imageFile = e.currentTarget.files?.[0])} />
            <span class="text-body-sm shrink-0 rounded-full bg-[#0E0347] px-4 py-1.5 font-bold text-white dark:bg-white dark:text-[#0E0347]">Choose File</span>
            <span class="text-body-sm truncate font-normal text-[#0E0347] dark:text-white">{imageFile?.name ?? 'No file chosen'}</span>
          </label>
        </div>

        <div class="space-y-4">
          <div>
            <Label class="mb-2">Title</Label>
            <Input bind:value={title} required />
          </div>
          <div>
            <Label class="mb-2">Description / Content</Label>
            <Textarea rows={6} bind:value={content} class="w-full" />
          </div>
        </div>
      </section>

      {#if taxonomies.length > 0}
        <section class={card}>
          <h2 class="text-body-sm mb-3 font-bold tracking-wider text-[#DB000F] uppercase">Classification</h2>
          <div class="grid gap-4 sm:grid-cols-2">
            {#each taxonomies as tax}
              <!-- only admins may change who can see an asset -->
              {@const locked = tax.slug === 'access_level' && !isAdmin(role)}
              <div class="rounded-xl border border-[#C4C0D4]/40 bg-[#F7F6FF] p-3 dark:border-white/10 dark:bg-[#0E0347]">
                <Label class="mb-2 block">
                  {tax.name}
                  {#if locked}<span class="ml-1 font-normal text-[#0B2E8D]/50 dark:text-[#C4C0D4]/50">(admin only)</span>{/if}
                </Label>
                <div class="flex flex-wrap gap-3">
                  {#each tax.terms as term}
                    <Checkbox bind:group={selectedTerms[tax.rest_base]} value={term.id} disabled={locked}>
                      {term.name}
                    </Checkbox>
                  {:else}
                    <p class="text-body-sm text-[#0B2E8D]/50 dark:text-[#C4C0D4]/50">No options yet</p>
                  {/each}
                </div>
              </div>
            {/each}
          </div>
        </section>
      {/if}

      {#each fieldGroups as group}
        <section class={card}>
          <h2 class="text-body-sm mb-3 font-bold tracking-wider text-[#DB000F] uppercase">{group.name}</h2>
          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {#each group.fields as field}
              <div class={field.type === 'textarea' ? 'sm:col-span-2 lg:col-span-3' : ''}>
                <Label class="mb-1">
                  {field.label}
                  {#if field.readonly}<span class="ml-1 font-normal text-[#0B2E8D]/50 dark:text-[#C4C0D4]/50">(auto)</span>{/if}
                </Label>
                {#if field.type === 'select'}
                  <Select items={field.items} bind:value={metabox[field.key]} placeholder={field.placeholder} />
                {:else if field.type === 'textarea'}
                  <Textarea rows={4} maxlength={400} bind:value={metabox[field.key]} readonly={field.readonly} class="w-full" />
                {:else}
                  <Input type={field.type === 'date' ? 'date' : 'text'} bind:value={metabox[field.key]} readonly={field.readonly} />
                {/if}
              </div>
            {/each}
          </div>
        </section>
      {/each}

      <!-- sticky action bar: Save stays reachable without scrolling to the end of the long form -->
      <div
        class="sticky bottom-4 z-10 flex justify-end gap-3 rounded-2xl border border-[#C4C0D4]/40 bg-white/90 px-6 py-4 shadow-[0_8px_24px_-12px_rgba(14,3,71,0.35)] backdrop-blur dark:border-white/10 dark:bg-[#150B52]/90"
      >
        <Button
          href={`/Asset/${id}`}
          class="gap-2 rounded-full border border-[#0E0347] bg-transparent px-6 font-bold tracking-wide text-[#0E0347] hover:bg-[#0E0347] hover:text-white dark:border-white dark:bg-transparent dark:text-white dark:hover:bg-white dark:hover:text-[#0E0347]"
        >
          <XIcon size={16} weight="bold" /> Cancel
        </Button>
        <Button
          type="submit"
          disabled={saving}
          class="gap-2 rounded-full bg-[#DB000F] px-6 font-bold tracking-wide text-white hover:bg-[#BB080B] dark:bg-[#DB000F] dark:hover:bg-[#BB080B]"
        >
          <FloppyDiskIcon size={16} weight="bold" />
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </form>
  {/if}
</div>
