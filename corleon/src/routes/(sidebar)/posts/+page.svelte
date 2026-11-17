<script>
  import { Card, Spinner, Button, Input } from 'flowbite-svelte';
  import { getPosts } from '$lib/wp/axios.js';

  let page = $state(1);
  let search = $state('');
  const perPage = 9;

  let postsPromise = $derived(getPosts('posts', page, search, perPage));
</script>

<h1 class="mb-4 text-2xl font-bold dark:text-white">WordPress Posts</h1>

{#await postsPromise}
  <Spinner />
{:then posts}
  <div class="grid gap-4 md:grid-cols-3">
    {#each posts as post}
      <Card img={post._embedded?.['wp:featuredmedia']?.[0]?.source_url}>
        <h5 class="mb-2 text-xl font-bold dark:text-white">
          {@html post.title.rendered}
        </h5>

        <div class="mb-2 text-sm text-gray-700 dark:text-gray-400">
          {@html post.content.rendered}
        </div>

        <p class="mb-4 text-xs text-gray-500">
          {new Date(post.date).toLocaleDateString()}
        </p>

        <div class="flex gap-2">
          <Button size="xs" href={`/posts/${post.id}`}>Edit</Button>
          <Button size="xs" color="alternative" href={post.link} target="_blank">View</Button>
        </div>
      </Card>
    {/each}
  </div>
{:catch err}
  <p class="text-red-600">Failed to load posts: {err.message}</p>
{/await}
