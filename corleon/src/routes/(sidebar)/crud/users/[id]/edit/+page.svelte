<script>
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import { Button, Input, Label } from 'flowbite-svelte';
  import FloppyDiskIcon from 'phosphor-svelte/lib/FloppyDiskIcon';
  import XIcon from 'phosphor-svelte/lib/XIcon';
  import ArrowLeftIcon from 'phosphor-svelte/lib/ArrowLeftIcon';
  import PageBanner from '$lib/PageBanner.svelte';
  import { roles } from '../../roles.js';
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

<div class="brand-page">
  <PageBanner eyebrow="Edit User" title={name || `User #${id}`}>
    {#snippet actions()}
      <Button
        size="sm"
        href="/crud/users"
        class="gap-2 rounded-full border border-white bg-transparent px-5 font-bold tracking-wide text-white hover:bg-white hover:text-[#0E0347] dark:bg-transparent dark:hover:bg-white"
      >
        <ArrowLeftIcon size={16} weight="bold" /> Back
      </Button>
    {/snippet}
  </PageBanner>

  {#if errorMsg}
    <div class="text-body-sm mb-6 max-w-4xl rounded-2xl border border-[#DB000F]/30 bg-[#A10000]/10 p-4 text-[#DB000F] dark:bg-[#A10000]/30 dark:text-white">
      <span class="font-bold">Gagal:</span> {errorMsg}
    </div>
  {/if}

  {#if loading}
    <div class="h-96 max-w-4xl animate-pulse rounded-2xl bg-[#0E0347]/10 dark:bg-white/5"></div>
  {:else}
    <form class="brand-form max-w-4xl space-y-6" onsubmit={save}>
      <section class="rounded-2xl border border-[#C4C0D4]/40 bg-white p-6 shadow-[0_8px_24px_-12px_rgba(14,3,71,0.25)] dark:border-white/10 dark:bg-[#150B52]">
        <h2 class="text-body-sm mb-4 font-bold tracking-wider text-[#DB000F] uppercase">Akun</h2>
        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <Label class="mb-2">Username <span class="font-normal text-[#0B2E8D]/50 dark:text-[#C4C0D4]/50">(tidak bisa diubah)</span></Label>
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
            <Label class="mb-2">New Password <span class="font-normal text-[#0B2E8D]/50 dark:text-[#C4C0D4]/50">(kosongkan jika tidak diganti)</span></Label>
            <Input type="password" bind:value={password} />
          </div>
        </div>
      </section>

      <section class="rounded-2xl border border-[#C4C0D4]/40 bg-white p-6 shadow-[0_8px_24px_-12px_rgba(14,3,71,0.25)] dark:border-white/10 dark:bg-[#150B52]">
        <h2 class="text-body-sm mb-4 font-bold tracking-wider text-[#DB000F] uppercase">Level Akses</h2>
        <!-- radio cards: the native radio is visually hidden, the whole card is the click target -->
        <div class="grid gap-3 sm:grid-cols-3">
          {#each roles as r (r.value)}
            <label
              class="cursor-pointer rounded-xl border border-[#C4C0D4]/60 p-4 transition has-checked:border-[#DB000F] has-checked:bg-[#DB000F]/5 has-focus-visible:ring-2 has-focus-visible:ring-[#DB000F] dark:border-white/10 dark:has-checked:border-[#DB000F] dark:has-checked:bg-[#DB000F]/15"
            >
              <input type="radio" name="role" value={r.value} bind:group={role} class="sr-only" />
              <span class="text-body-sm block font-bold text-[#DB000F]">Level {r.level}</span>
              <span class="text-body block font-bold">{r.name}</span>
              <span class="text-body-sm block font-normal text-[#0B2E8D]/70 dark:text-[#C4C0D4]/70">{r.desc}</span>
            </label>
          {/each}
        </div>
      </section>

      <div class="flex justify-end gap-3">
        <Button
          href="/crud/users"
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
