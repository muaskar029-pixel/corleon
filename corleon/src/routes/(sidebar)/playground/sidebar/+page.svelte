<script lang="ts">
  import { Card } from 'flowbite-svelte';

  let { data } = $props();
</script>

<div class="p-4">
  <h1 class="mb-4 text-2xl font-bold dark:text-white">Digital Assets (WPGraphQL)</h1>

  {#if data.errors}
    <p class="mb-4 rounded-lg bg-red-100 p-3 text-sm text-red-700">
      GraphQL Error: {data.errors[0]?.message}
    </p>
  {/if}

  {#if data.assets.length > 0}
    <div class="grid gap-4 md:grid-cols-3">
      {#each data.assets as asset}
        <Card img={asset.featuredImage?.node?.sourceUrl}>
          <h5 class="mb-2 text-xl font-bold dark:text-white">
            {@html asset.title}
          </h5>

          <div class="mb-3 text-sm text-gray-700 dark:text-gray-400">
            {@html asset.content}
          </div>

          <p class="text-xs text-gray-500">
            {new Date(asset.date).toLocaleDateString()}
          </p>
        </Card>
      {/each}
    </div>
  {:else}
    <p class="text-gray-500">No digital assets found.</p>
  {/if}
</div>
