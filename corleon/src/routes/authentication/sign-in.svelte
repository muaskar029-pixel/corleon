<script lang="ts">
  import { goto } from '$app/navigation';
  import { Button, Card, Input, Label } from 'flowbite-svelte';
  import { loginJwt } from '$lib/wp/axios.js';

  let username = $state('');
  let password = $state('');
  let loading = $state(false);
  let errorMsg = $state('');

  async function handleLogin(e: Event) {
    e.preventDefault();
    loading = true;
    errorMsg = '';

    try {
      await loginJwt(username, password);
      goto('/Asset');
    } catch (err: any) {
      errorMsg = err.response?.data?.message || err.message || 'Login failed';
    } finally {
      loading = false;
    }
  }
</script>

<main class="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 dark:bg-gray-900">
  <a href="/" class="mb-6 flex items-center text-2xl font-semibold dark:text-white">
    <img src="/images/corleon-svelte-icon-logo.png" class="mr-3 h-10" alt="Corleon Logo" />
    <span>Corleon</span>
  </a>
  <Card class="w-full max-w-md p-6">
    <h1 class="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
      Sign in with WordPress JWT
    </h1>

    {#if errorMsg}
      <div class="mb-4 rounded-lg bg-red-100 p-3 text-sm text-red-700 dark:bg-red-900 dark:text-red-200">
        {@html errorMsg}
      </div>
    {/if}

    <form class="space-y-4" onsubmit={handleLogin}>
      <div>
        <Label for="username" class="mb-2">Username or Email</Label>
        <Input
          id="username"
          bind:value={username}
          placeholder="Enter WordPress username"
          required
        />
      </div>

      <div>
        <Label for="password" class="mb-2">Password</Label>
        <Input
          id="password"
          type="password"
          bind:value={password}
          placeholder="••••••••"
          required
        />
      </div>

      <Button type="submit" class="w-full" disabled={loading}>
        {loading ? 'Signing in...' : 'Sign in'}
      </Button>
    </form>
  </Card>
</main>
