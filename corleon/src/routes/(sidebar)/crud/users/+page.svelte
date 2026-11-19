<script>
  import { Avatar, Button, Input } from 'flowbite-svelte';
  import UserPlusIcon from 'phosphor-svelte/lib/UserPlusIcon';
  import PencilSimpleIcon from 'phosphor-svelte/lib/PencilSimpleIcon';
  import TrashIcon from 'phosphor-svelte/lib/TrashIcon';
  import { getUsers, deleteUser } from '$lib/wp/axios.js';
  import PageBanner from '$lib/PageBanner.svelte';
  import { roleOf } from './roles.js';

  let usersPromise = $state(getUsers());
  let search = $state('');

  // client-side filter: getUsers() already returns the whole list
  const matches = (user, q) =>
    [user.name, user.username, user.email].some((v) => v?.toLowerCase().includes(q.trim().toLowerCase()));

  async function remove(id) {
    if (!confirm('Delete this user?')) return;
    await deleteUser(id);
    usersPromise = getUsers();
  }
</script>

<div class="brand-page">
  <PageBanner eyebrow="User Management" title="Manage Users">
    {#snippet meta()}
      {#await usersPromise then users}
        <p class="text-body-sm text-[#C4C0D4]">{users.length} user terdaftar</p>
      {/await}
    {/snippet}
    {#snippet actions()}
      <Input
        size="sm"
        class="rounded-full border-white/20 bg-white/10 text-white placeholder:text-white/60 focus:border-white focus:ring-white dark:border-white/20 dark:bg-white/10 dark:text-white"
        placeholder="Search users..."
        bind:value={search}
      />
      <Button
        size="sm"
        href="/crud/users/create"
        class="shrink-0 gap-2 rounded-full bg-white px-5 font-bold tracking-wide text-[#DB000F] hover:bg-[#F7F6FF] dark:bg-white dark:text-[#DB000F] dark:hover:bg-[#F7F6FF]"
      >
        <UserPlusIcon size={16} weight="bold" /> Add User
      </Button>
    {/snippet}
  </PageBanner>

  <div class="overflow-hidden rounded-2xl border border-[#C4C0D4]/40 bg-white shadow-[0_8px_24px_-12px_rgba(14,3,71,0.25)] dark:border-white/10 dark:bg-[#150B52]">
    {#await usersPromise}
      <!-- skeleton rows -->
      <div class="space-y-3 p-6">
        {#each { length: 5 } as _}
          <div class="h-12 animate-pulse rounded-xl bg-[#0E0347]/10 dark:bg-white/5"></div>
        {/each}
      </div>
    {:then users}
      {@const visible = users.filter((u) => matches(u, search))}
      <div class="overflow-x-auto">
        <table class="text-body-sm w-full text-left">
          <thead class="bg-[#F7F6FF] font-bold tracking-wider text-[#0B2E8D] uppercase dark:bg-[#0E0347] dark:text-[#C4C0D4]">
            <tr>
              <th class="px-6 py-3">User</th>
              <th class="px-6 py-3">Email</th>
              <th class="px-6 py-3">Access Level</th>
              <th class="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {#each visible as user (user.id)}
              {@const role = roleOf(user.roles?.[0] || 'subscriber')}
              <tr class="border-t border-[#C4C0D4]/40 dark:border-white/10">
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <Avatar src={user.avatar_urls?.['96']} size="sm" />
                    <div class="min-w-0">
                      <p class="text-body truncate font-bold text-[#0E0347] dark:text-white">{user.name}</p>
                      <p class="truncate text-[#0B2E8D]/70 dark:text-[#C4C0D4]/70">@{user.username}</p>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 text-[#0E0347] dark:text-[#C4C0D4]">{user.email}</td>
                <td class="px-6 py-4">
                  <span class="inline-block rounded-full px-3 py-1 font-bold whitespace-nowrap {role.badge}">
                    {#if role.level}Level {role.level} · {/if}{role.name}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <div class="flex justify-end gap-2">
                    <Button
                      size="xs"
                      href={`/crud/users/${user.id}/edit`}
                      class="gap-1.5 rounded-full border border-[#0E0347] bg-transparent px-4 font-bold tracking-wide text-[#0E0347] hover:bg-[#0E0347] hover:text-white dark:border-white dark:bg-transparent dark:text-white dark:hover:bg-white dark:hover:text-[#0E0347]"
                    >
                      <PencilSimpleIcon size={14} weight="bold" /> Edit
                    </Button>
                    <Button
                      size="xs"
                      onclick={() => remove(user.id)}
                      class="gap-1.5 rounded-full bg-transparent px-3 font-bold tracking-wide text-[#DB000F] hover:bg-[#DB000F]/10 dark:bg-transparent dark:text-[#ff4d58] dark:hover:bg-[#DB000F]/20"
                    >
                      <TrashIcon size={14} weight="bold" /> Delete
                    </Button>
                  </div>
                </td>
              </tr>
            {:else}
              <tr>
                <td colspan="4" class="px-6 py-12 text-center text-[#0B2E8D]/70 dark:text-[#C4C0D4]/70">
                  {search ? 'Tidak ada user yang cocok.' : 'Belum ada user.'}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {:catch err}
      <div class="m-6 rounded-2xl border border-[#DB000F]/30 bg-[#A10000]/10 p-6 text-[#DB000F] dark:bg-[#A10000]/30 dark:text-white">
        <p class="text-h6 font-bold">User gagal dimuat</p>
        <p class="text-body-sm mt-1">{err.message}</p>
      </div>
    {/await}
  </div>
</div>
