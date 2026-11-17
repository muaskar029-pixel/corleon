<script>
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import { Button, Input, Label, Textarea, Select, Spinner, Checkbox } from 'flowbite-svelte';
  import { getPostById, updatePost, uploadMedia, getTaxonomies } from '$lib/wp/axios.js';

  const id = page.params.id;

  let title = $state('');
  let content = $state('');
  let taxonomies = $state([]);
  let selectedTerms = $state({});
  let imageUrl = $state('');
  let imageFile = $state(null);
  let loading = $state(true);
  let saving = $state(false);
  let errorMsg = $state('');

  const resourceOptions = [
    { value: 'photo', name: 'Photo' },
    { value: 'video', name: 'Video' },
    { value: 'document', name: 'Document' },
    { value: 'audio', name: 'Audio' }
  ];

  const statusOptions = [
    { value: 'active', name: 'Active' },
    { value: 'none active', name: 'None Active' }
  ];

  const licenseOptions = [
    { value: 'public_domain', name: 'Public Domain' },
    { value: 'cc_by', name: 'Creative Common (CC-BY)' },
    { value: 'copyrighted', name: 'Copyrighted (All Rights Reserved)' }
  ];

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

  const cleanHtml = (html = '') => html.replace(/<[^>]+>/g, '').trim();

  Promise.all([getPostById(id, 'digital_asset'), getTaxonomies('digital_asset')])
    .then(([data, taxList]) => {
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

<div class="p-4">
  <h1 class="mb-4 text-2xl font-bold dark:text-white">Edit Digital Asset #{id}</h1>

  {#if errorMsg}
    <p class="mb-4 rounded-lg bg-red-100 p-3 text-sm text-red-700 dark:bg-red-900 dark:text-red-200">
      Error: {errorMsg}
    </p>
  {/if}

  {#if loading}
    <Spinner />
  {:else}
    <form class="max-w-4xl space-y-6" onsubmit={save}>
      <div class="grid gap-4 md:grid-cols-2">
        <div>
          <Label class="mb-2">Title</Label>
          <Input bind:value={title} required />
        </div>

        <div>
          <Label class="mb-2">Cover Image</Label>
          {#if imageUrl}
            <img src={imageUrl} alt="Thumbnail" class="mb-2 h-24 rounded-lg object-cover" />
          {/if}
          <input
            type="file"
            accept="image/*"
            class="block w-full text-sm text-gray-900 dark:text-gray-300"
            onchange={(e) => (imageFile = e.currentTarget.files?.[0])}
          />
        </div>
      </div>

      <div>
        <Label class="mb-2">Description / Content</Label>
        <Textarea rows={4} bind:value={content} />
      </div>

      {#if taxonomies.length > 0}
        <div>
          <h2 class="mb-3 text-lg font-semibold dark:text-white">Taxonomies</h2>
          <div class="grid gap-4 sm:grid-cols-2">
            {#each taxonomies as tax}
              <div class="rounded-lg border p-3 dark:border-gray-700">
                <Label class="mb-2 block font-semibold">{tax.name}</Label>
                <div class="flex flex-wrap gap-3">
                  {#each tax.terms as term}
                    <Checkbox bind:group={selectedTerms[tax.rest_base]} value={term.id}>
                      {term.name}
                    </Checkbox>
                  {/each}
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/if}

      <div>
        <h2 class="mb-3 text-lg font-semibold dark:text-white">Details (Metabox)</h2>
        <div class="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          <div>
            <Label class="mb-1">Resource Type</Label>
            <Select items={resourceOptions} bind:value={metabox.resource_type} placeholder="Choose Resource Type" />
          </div>

          <div>
            <Label class="mb-1">Date</Label>
            <Input type="date" bind:value={metabox.date} />
          </div>

          <div>
            <Label class="mb-1">Status</Label>
            <Select items={statusOptions} bind:value={metabox.status} />
          </div>

          <div>
            <Label class="mb-1">Asset License</Label>
            <Select items={licenseOptions} bind:value={metabox.asset_license} placeholder="Choose License" />
          </div>

          <div>
            <Label class="mb-1">Location</Label>
            <Input bind:value={metabox.location} />
          </div>

          <div>
            <Label class="mb-1">Screen</Label>
            <Input bind:value={metabox.screen} />
          </div>

          <div>
            <Label class="mb-1">Editor</Label>
            <Input bind:value={metabox.editor} />
          </div>

          <div>
            <Label class="mb-1">Photographer</Label>
            <Input bind:value={metabox.photographer} />
          </div>

          <div>
            <Label class="mb-1">File Size</Label>
            <Input bind:value={metabox.file_size} />
          </div>

          <div>
            <Label class="mb-1">Keyword - Other</Label>
            <Input bind:value={metabox.keyword_other} />
          </div>

          <div>
            <Label class="mb-1">Named person(s)</Label>
            <Input bind:value={metabox.named_person} />
          </div>

          <div>
            <Label class="mb-1">Credit</Label>
            <Input bind:value={metabox.credit} />
          </div>

          <div>
            <Label class="mb-1">Notes</Label>
            <Input bind:value={metabox.note} />
          </div>

          <div>
            <Label class="mb-1">Keywords - Recognised</Label>
            <Input bind:value={metabox.recognised} />
          </div>

          <div>
            <Label class="mb-1">Keywords - Landmark</Label>
            <Input bind:value={metabox.landmark} />
          </div>

          <div>
            <Label class="mb-1">Source</Label>
            <Input bind:value={metabox.source} />
          </div>

          <div>
            <Label class="mb-1">Duration</Label>
            <Input bind:value={metabox.duration} />
          </div>

          <div>
            <Label class="mb-1">Sample rate</Label>
            <Input bind:value={metabox.sample} />
          </div>

          <div>
            <Label class="mb-1">Audio bitrate</Label>
            <Input bind:value={metabox.audio_bitrate} />
          </div>

          <div>
            <Label class="mb-1">Frame rate</Label>
            <Input bind:value={metabox.frame_rate} />
          </div>

          <div>
            <Label class="mb-1">Video bitrate</Label>
            <Input bind:value={metabox.video_bitrate} />
          </div>

          <div>
            <Label class="mb-1">Original File name</Label>
            <Input bind:value={metabox.original_filename} readonly />
          </div>

          <div>
            <Label class="mb-1">File Hash</Label>
            <Input bind:value={metabox.file_hash} readonly />
          </div>

          <div>
            <Label class="mb-1">Image Dimensions</Label>
            <Input bind:value={metabox.image_dimensions} readonly />
          </div>

          <div>
            <Label class="mb-1">Mime Type</Label>
            <Input bind:value={metabox.mime_type} readonly />
          </div>
        </div>

        <div class="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <Label class="mb-1">Caption</Label>
            <Textarea rows={4} maxlength={400} bind:value={metabox.caption} />
          </div>

          <div>
            <Label class="mb-1">Document extract</Label>
            <Textarea rows={4} maxlength={400} bind:value={metabox.document_extract} readonly />
          </div>
        </div>
      </div>

      <div class="flex gap-2">
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save'}
        </Button>
        <Button color="alternative" href={`/Asset/${id}`}>Cancel</Button>
      </div>
    </form>
  {/if}
</div>
