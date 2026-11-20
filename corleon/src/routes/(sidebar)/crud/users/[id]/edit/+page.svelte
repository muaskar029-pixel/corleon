<script>
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import { Avatar, Button, Input, Label, Textarea } from 'flowbite-svelte';
  import FloppyDiskIcon from 'phosphor-svelte/lib/FloppyDiskIcon';
  import XIcon from 'phosphor-svelte/lib/XIcon';
  import ArrowLeftIcon from 'phosphor-svelte/lib/ArrowLeftIcon';
  import PageBanner from '$lib/PageBanner.svelte';
  import { onMount } from 'svelte';
  import NoAccess from '$lib/NoAccess.svelte';
  import { roles, isAdmin } from '../../roles.js';
  import { getUserById, updateUser, getCurrentUser } from '$lib/wp/axios.js';

  const id = page.params.id;

  let username = $state('');
  let name = $state('');
  let firstName = $state('');
  let lastName = $state('');
  let nickname = $state('');
  let email = $state('');
  let url = $state('');
  let description = $state('');
  let avatar = $state('');
  let password = $state('');
  let role = $state('dam_subscriber');
  let loading = $state(true);
  let saving = $state(false);
  let errorMsg = $state('');

  // undefined until mounted (localStorage is browser-only), then the logged-in user or null
  let me = $state(undefined);
  let admin = $derived(isAdmin(me?.roles?.[0]));
  let isSelf = $derived(me?.id === Number(id));
  // admins edit anyone; everyone else only their own profile
  let allowed = $derived(admin || isSelf);
  let backHref = $derived(admin ? '/crud/users' : '/');

  onMount(() => {
    me = getCurrentUser();
    if (!allowed) {
      loading = false;
      return;
    }
    loadUser();
  });

  const loadUser = () =>
    getUserById(id)
    .then((data) => {
      username = data.username || '';
      name = data.name || '';
      firstName = data.first_name || '';
      lastName = data.last_name || '';
      nickname = data.nickname || '';
      email = data.email || '';
      url = data.url || '';
      description = data.description || '';
      avatar = data.avatar_urls?.[96] || '';
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
        first_name: firstName,
        last_name: lastName,
        nickname,
        email,
        url,
        description
      };
      // WordPress rejects role changes from non-admins, so only admins send it
      if (admin) payload.roles = [role];
      if (password) payload.password = password;

      const saved = await updateUser(id, payload);
      // editing yourself: navbar reads wp_user from localStorage, keep it in sync
      if (getCurrentUser()?.id === saved.id) localStorage.setItem('wp_user', JSON.stringify(saved));
      goto(backHref);
    } catch (err) {
      errorMsg = err.response?.data?.message || err.message;
    } finally {
      saving = false;
    }
  }
</script>

<div class="brand-page">
  <PageBanner eyebrow={isSelf ? 'My Profile' : 'Edit User'} title={name || `User #${id}`}>
    {#snippet actions()}
      <Button
        size="sm"
        href={backHref}
        class="gap-2 rounded-full border border-white bg-transparent px-5 font-bold tracking-wide text-white hover:bg-white hover:text-[#0E0347] dark:bg-transparent dark:hover:bg-white"
      >
        <ArrowLeftIcon size={16} weight="bold" /> Back
      </Button>
    {/snippet}
  </PageBanner>

  {#if errorMsg}
    <div class="text-body-sm mb-6 max-w-4xl rounded-2xl border border-[#DB000F]/30 bg-[#A10000]/10 p-4 text-[#DB000F] dark:bg-[#A10000]/30 dark:text-white">
      <span class="font-bold">Error:</span> {errorMsg}
    </div>
  {/if}

  {#if loading}
    <div class="h-96 max-w-4xl animate-pulse rounded-2xl bg-[#0E0347]/10 dark:bg-white/5"></div>
  {:else if !allowed}
    <NoAccess message="You can only edit your own profile." backHref={me ? backHref : '/authentication/sign-in'} backLabel={me ? 'Back' : 'Sign in'} />
  {:else}
    <form class="brand-form max-w-4xl space-y-6" onsubmit={save}>
      <section class="rounded-2xl border border-[#C4C0D4]/40 bg-white p-6 shadow-[0_8px_24px_-12px_rgba(14,3,71,0.25)] dark:border-white/10 dark:bg-[#150B52]">
        <h2 class="text-body-sm mb-4 font-bold tracking-wider text-[#DB000F] uppercase">Account</h2>
        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <Label class="mb-2">Username <span class="font-normal text-[#0B2E8D]/50 dark:text-[#C4C0D4]/50">(cannot be changed)</span></Label>
            <Input value={username} readonly />
          </div>
          <div>
            <Label class="mb-2">Display Name</Label>
            <Input bind:value={name} required />
          </div>
          <div>
            <Label class="mb-2">First Name</Label>
            <Input bind:value={firstName} />
          </div>
          <div>
            <Label class="mb-2">Last Name</Label>
            <Input bind:value={lastName} />
          </div>
          <div>
            <Label class="mb-2">Nickname</Label>
            <Input bind:value={nickname} required />
          </div>
          <div>
            <Label class="mb-2">Email</Label>
            <Input type="email" bind:value={email} required />
          </div>
          <div>
            <Label class="mb-2">Website</Label>
            <Input type="url" bind:value={url} />
          </div>
          <div>
            <Label class="mb-2">New Password <span class="font-normal text-[#0B2E8D]/50 dark:text-[#C4C0D4]/50">(leave blank to keep current)</span></Label>
            <Input type="password" bind:value={password} />
          </div>
        </div>
      </section>

      <section class="rounded-2xl border border-[#C4C0D4]/40 bg-white p-6 shadow-[0_8px_24px_-12px_rgba(14,3,71,0.25)] dark:border-white/10 dark:bg-[#150B52]">
        <h2 class="text-body-sm mb-4 font-bold tracking-wider text-[#DB000F] uppercase">About</h2>
        <div class="grid gap-6 sm:grid-cols-[1fr_auto]">
          <div>
            <Label class="mb-2">Biographical Info</Label>
            <Textarea rows={5} class="w-full" bind:value={description} />
          </div>
          <div class="text-center">
            <Label class="mb-2">Profile Picture</Label>
            <Avatar size="xl" src={avatar} class="mx-auto" />
            <a href="https://gravatar.com" target="_blank" rel="noopener" class="text-body-sm mt-2 block text-[#DB000F] underline">Change on Gravatar</a>
          </div>
        </div>
      </section>

      {#if admin}
      <section class="rounded-2xl border border-[#C4C0D4]/40 bg-white p-6 shadow-[0_8px_24px_-12px_rgba(14,3,71,0.25)] dark:border-white/10 dark:bg-[#150B52]">
        <h2 class="text-body-sm mb-4 font-bold tracking-wider text-[#DB000F] uppercase">Access Level</h2>
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
      {/if}

      <div class="flex justify-end gap-3">
        <Button
          href={backHref}
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
