<script>
  import { Card, Spinner, Button, Input } from 'flowbite-svelte';
  import { getPosts } from '$lib/wp/axios.js';

  let page = $state(1);
  let search = $state('');
  const perPage = 9;

  let postsPromise = $derived(getPosts('posts', page, search, perPage));
</script>

<div class="bg-gradient-to-br from-[#F7F6FF] via-[#F7F6FF] to-[#FDE4E6] p-6 text-[#0E0347] dark:from-[#0B0711] dark:via-[#0B0711] dark:to-[#0E0347] dark:text-[#FFFFFF]">
  <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
    <h1 class="text-h4 font-bold text-[#0E0347] dark:text-[#FFFFFF]">WordPress Posts</h1>
    <Input
      size="sm"
      class="w-64 rounded-full border-[#C4C0D4] bg-white dark:border-[#0035C6] dark:bg-[#150B52] dark:text-white"
      placeholder="Search posts..."
      bind:value={search}
      oninput={() => (page = 1)}
    />
  </div>

  {#await postsPromise}
    <Spinner />
  {:then posts}
    <div class="grid gap-6 md:grid-cols-3">
      {#each posts as post}
        <Card
          img={post._embedded?.['wp:featuredmedia']?.[0]?.source_url}
          class="rounded-2xl border border-[#C4C0D4]/40 bg-white shadow-[0_8px_24px_-12px_rgba(14,3,71,0.25)] dark:border-white/10 dark:bg-[#150B52]"
        >
          <h5 class="mb-2 text-h6 font-bold text-[#0E0347] dark:text-[#FFFFFF]">
            {@html post.title.rendered}
          </h5>

          <div class="mb-3 text-body text-[#0E0347]/80 dark:text-[#C4C0D4]">
            {@html post.content.rendered}
          </div>

          <p class="mb-4 text-body-sm text-[#0B2E8D]/70 dark:text-[#C4C0D4]/70">
            {new Date(post.date).toLocaleDateString()}
          </p>

          <div class="flex gap-2">
            <Button
              size="xs"
              href={`/posts/${post.id}`}
              class="rounded-full bg-[#DB000F] px-4 text-white hover:bg-[#BB080B]"
            >
              Edit
            </Button>
            <Button
              size="xs"
              href={post.link}
              target="_blank"
              class="rounded-full border border-[#0E0347] bg-transparent px-4 text-[#0E0347] hover:bg-[#0E0347] hover:text-white dark:border-white dark:bg-transparent dark:text-white dark:hover:bg-white dark:hover:text-[#0E0347]"
            >
              View
            </Button>
          </div>
        </Card>
      {/each}
    </div>
  {:catch err}
    <p class="text-[#DB000F]">Failed to load posts: {err.message}</p>
  {/await}
</div>
