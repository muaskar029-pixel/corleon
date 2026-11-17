<script>
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import { Button, Input, Label, Textarea, Spinner } from 'flowbite-svelte';
  import { getPostById, updatePost, uploadMedia } from '$lib/wp/axios.js';

  const id = page.params.id;

  let title = $state('');
  let content = $state('');
  let imageUrl = $state('');
  let imageFile = $state(null);
  let loading = $state(true);
  let saving = $state(false);
  let errorMsg = $state('');

  const cleanHtml = (html = '') => html.replace(/<[^>]+>/g, '').trim();

  getPostById(id, 'posts')
    .then((data) => {
      title = cleanHtml(data.title?.rendered);
      content = cleanHtml(data.content?.rendered);
      imageUrl = data._embedded?.['wp:featuredmedia']?.[0]?.source_url || '';
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
      const payload = { title, content };

      if (imageFile) {
        const media = await uploadMedia(imageFile);
        payload.featured_media = media.id;
      }

      await updatePost(id, payload, 'posts');
      goto('/posts');
    } catch (err) {
      errorMsg = err.response?.data?.message || err.message;
    } finally {
      saving = false;
    }
  }
</script>

<div class="p-4">
  <h1 class="mb-4 text-2xl font-bold dark:text-white">Edit Post #{id}</h1>

  {#if errorMsg}
    <p class="mb-4 rounded-lg bg-red-100 p-3 text-sm text-red-700 dark:bg-red-900 dark:text-red-200">
      Error: {errorMsg}
    </p>
  {/if}

  {#if loading}
    <Spinner />
  {:else}
    <form class="max-w-xl space-y-4" onsubmit={save}>
      <div>
        <Label class="mb-2">Title</Label>
        <Input bind:value={title} required />
      </div>

      <div>
        <Label class="mb-2">Description / Content</Label>
        <Textarea rows={5} bind:value={content} />
      </div>

      <div>
        <Label class="mb-2">Thumbnail Image</Label>
        {#if imageUrl}
          <img src={imageUrl} alt="Thumbnail" class="mb-2 h-36 rounded-lg object-cover" />
        {/if}
        <input
          type="file"
          accept="image/*"
          class="block w-full text-sm text-gray-900 dark:text-gray-300"
          onchange={(e) => (imageFile = e.currentTarget.files?.[0])}
        />
      </div>

      <div class="flex gap-2">
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save'}
        </Button>
        <Button color="alternative" href="/posts">Back</Button>
      </div>
    </form>
  {/if}
</div>
