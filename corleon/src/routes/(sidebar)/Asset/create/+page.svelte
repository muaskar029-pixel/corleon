<script>
  import { goto } from '$app/navigation';
  import { Button, Input, Label, Textarea, Select, Checkbox } from 'flowbite-svelte';
  import { createPost, uploadMedia, getTaxonomies } from '$lib/wp/axios.js';

  let title = $state('');
  let content = $state('');
  let imageFile = $state(null);
  let saving = $state(false);
  let errorMsg = $state('');
  let taxonomies = $state([]);
  let selectedTerms = $state({});

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

  getTaxonomies('digital_asset')
    .then((taxList) => {
      taxonomies = taxList;
      const initialTerms = {};
      for (const tax of taxList) {
        initialTerms[tax.rest_base] = [];
      }
      selectedTerms = initialTerms;
    })
    .catch((err) => {
      errorMsg = err.response?.data?.message || err.message;
    });

  async function save(e) {
    e.preventDefault();
    saving = true;
    errorMsg = '';

    try {
      const payload = {
        title,
        content,
        status: 'publish',
        metabox,
        ...selectedTerms
      };

      if (imageFile) {
        const media = await uploadMedia(imageFile);
        payload.featured_media = media.id;
      }

      await createPost(payload, 'digital_asset');
      goto('/Asset');
    } catch (err) {
      errorMsg = err.response?.data?.message || err.message;
    } finally {
      saving = false;
    }
  }
</script>

<div class="bg-gradient-to-br from-[#F7F6FF] via-[#F7F6FF] to-[#FDE4E6] p-6 text-[#0E0347] dark:from-[#0B0711] dark:via-[#0B0711] dark:to-[#0E0347] dark:text-[#FFFFFF]">
  <h1 class="mb-6 text-h4 font-bold text-[#0E0347] dark:text-[#FFFFFF]">Create Digital Asset</h1>

  {#if errorMsg}
    <p class="mb-4 rounded-xl bg-[#A10000]/10 p-3 text-body-sm text-[#DB000F] dark:bg-[#A10000]/30 dark:text-white">
      Error: {errorMsg}
    </p>
  {/if}

  <form class="max-w-4xl space-y-6 rounded-2xl border border-[#C4C0D4]/40 bg-white p-6 shadow-[0_8px_24px_-12px_rgba(14,3,71,0.25)] dark:border-white/10 dark:bg-[#150B52]" onsubmit={save}>
    <div class="grid gap-4 md:grid-cols-2">
      <div>
        <Label class="mb-2">Title</Label>
        <Input bind:value={title} required />
      </div>

      <div>
        <Label class="mb-2">Cover Image</Label>
        <input
          type="file"
          accept="image/*"
          class="block w-full text-body-sm text-[#0E0347] dark:text-[#C4C0D4]"
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
        <h2 class="mb-3 text-h6 font-bold text-[#0E0347] dark:text-white">Taxonomies</h2>
        <div class="grid gap-4 sm:grid-cols-2">
          {#each taxonomies as tax}
            <div class="rounded-xl border border-[#C4C0D4]/40 bg-[#F7F6FF] p-3 dark:border-[#0035C6]/30 dark:bg-[#0E0347]">
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
      <h2 class="mb-3 text-h6 font-bold text-[#0E0347] dark:text-white">Details (Metabox)</h2>
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

    <div class="flex gap-3">
      <Button type="submit" disabled={saving} class="rounded-full bg-[#DB000F] px-6 text-white hover:bg-[#BB080B]">
        {saving ? 'Saving...' : 'Create'}
      </Button>
      <Button href="/Asset" class="rounded-full border border-[#0E0347] bg-transparent px-6 text-[#0E0347] hover:bg-[#0E0347] hover:text-white dark:border-white dark:bg-transparent dark:text-white dark:hover:bg-white dark:hover:text-[#0E0347]">
        Back
      </Button>
    </div>
  </form>
</div>
