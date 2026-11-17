<script>
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import { Button, Input, Label, Select, Spinner } from 'flowbite-svelte';
  import { getUserById, updateUser } from '$lib/wp/axios.js';

  const id = page.params.id;

  let username = $state('');
  let name = $state('');
  let email = $state('');
  let password = $state('');
  let role = $state('dam_subscriber');
  let loading = $state(true);
  let saving = $state(false);
  let errorMsg = $state('');

  const roleOptions = [
    { value: 'administrator', name: 'Level 1 - Administrator (Full Access)' },
    { value: 'dam_contributor', name: 'Level 2 - DAM Contributor (Upload & Edit)' },
    { value: 'dam_subscriber', name: 'Level 3 - DAM Subscriber (View & Low-Res)' }
  ];

  getUserById(id)
    .then((data) => {
      username = data.username || '';
      name = data.name || '';
      email = data.email || '';
      role = data.roles?.[0] || 'dam_subscriber';
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
        name,
        email,
        roles: [role]
      };
      if (password) payload.password = password;

      await updateUser(id, payload);
      goto('/crud/users');
    } catch (err) {
      errorMsg = err.response?.data?.message || err.message;
    } finally {
      saving = false;
    }
  }
</script>

<div class="p-4">
  <h1 class="mb-4 text-2xl font-bold dark:text-white">Edit User #{id}</h1>

  {#if errorMsg}
    <p class="mb-4 rounded-lg bg-red-100 p-3 text-sm text-red-700">{errorMsg}</p>
  {/if}

  {#if loading}
    <Spinner />
  {:else}
    <form class="max-w-xl space-y-4" onsubmit={save}>
      <div>
        <Label class="mb-2">Username</Label>
        <Input value={username} readonly />
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
        <Label class="mb-2">New Password (optional)</Label>
        <Input type="password" bind:value={password} />
      </div>

      <div>
        <Label class="mb-2">Hierarchical Role</Label>
        <Select items={roleOptions} bind:value={role} />
      </div>

      <div class="flex gap-2">
        <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
        <Button color="alternative" href="/crud/users">Cancel</Button>
      </div>
    </form>
  {/if}
</div>
