<script>
  import { goto } from '$app/navigation';
  import { Button, Input, Label, Select } from 'flowbite-svelte';
  import { createUser } from '$lib/wp/axios.js';

  let username = $state('');
  let name = $state('');
  let email = $state('');
  let password = $state('');
  let role = $state('dam_subscriber');
  let saving = $state(false);
  let errorMsg = $state('');

  const roleOptions = [
    { value: 'administrator', name: 'Level 1 - Administrator (Full Access)' },
    { value: 'dam_contributor', name: 'Level 2 - DAM Contributor (Upload & Edit)' },
    { value: 'dam_subscriber', name: 'Level 3 - DAM Subscriber (View & Low-Res)' }
  ];

  async function save(e) {
    e.preventDefault();
    saving = true;
    errorMsg = '';

    try {
      await createUser({
        username,
        name,
        email,
        password,
        roles: [role]
      });
      goto('/crud/users');
    } catch (err) {
      errorMsg = err.response?.data?.message || err.message;
    } finally {
      saving = false;
    }
  }
</script>

<div class="p-4">
  <h1 class="mb-4 text-2xl font-bold dark:text-white">Add User</h1>

  {#if errorMsg}
    <p class="mb-4 rounded-lg bg-red-100 p-3 text-sm text-red-700">{errorMsg}</p>
  {/if}

  <form class="max-w-xl space-y-4" onsubmit={save}>
    <div>
      <Label class="mb-2">Username</Label>
      <Input bind:value={username} required />
    </div>

    <div>
      <Label class="mb-2">Name</Label>
      <Input bind:value={name} required />
    </div>

    <div>
      <Label class="mb-2">Email</Label>
      <Input type="email" bind:value={email} required />
    </div>

    <div>
      <Label class="mb-2">Password</Label>
      <Input type="password" bind:value={password} required />
    </div>

    <div>
      <Label class="mb-2">Hierarchical Role</Label>
      <Select items={roleOptions} bind:value={role} />
    </div>

    <div class="flex gap-2">
      <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Create'}</Button>
      <Button color="alternative" href="/crud/users">Back</Button>
    </div>
  </form>
</div>
