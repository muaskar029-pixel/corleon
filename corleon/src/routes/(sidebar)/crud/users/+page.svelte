<script>
  import {
    Avatar,
    Badge,
    Button,
    Spinner,
    Table,
    TableBody,
    TableBodyCell,
    TableBodyRow,
    TableHead,
    TableHeadCell
  } from 'flowbite-svelte';
  import { getUsers, deleteUser } from '$lib/wp/axios.js';

  let usersPromise = $state(getUsers());

  const roleHierarchy = {
    administrator: { level: 1, label: 'Level 1 - Administrator', color: 'red' },
    dam_contributor: { level: 2, label: 'Level 2 - DAM Contributor', color: 'blue' },
    dam_subscriber: { level: 3, label: 'Level 3 - DAM Subscriber', color: 'green' }
  };

  async function remove(id) {
    if (!confirm('Delete this user?')) return;
    await deleteUser(id);
    usersPromise = getUsers();
  }
</script>

<div class="p-4">
  <div class="mb-4 flex items-center justify-between">
    <h1 class="text-2xl font-bold dark:text-white">Manage Users</h1>
    <Button size="sm" href="/crud/users/create">+ Add User</Button>
  </div>

  {#await usersPromise}
    <Spinner />
  {:then users}
    <Table>
      <TableHead>
        <TableHeadCell>Name</TableHeadCell>
        <TableHeadCell>Username</TableHeadCell>
        <TableHeadCell>Email</TableHeadCell>
        <TableHeadCell>Access Level (Role)</TableHeadCell>
        <TableHeadCell>Actions</TableHeadCell>
      </TableHead>
      <TableBody>
        {#each users as user}
          {@const roleKey = user.roles?.[0] || 'subscriber'}
          {@const roleInfo = roleHierarchy[roleKey] || { label: roleKey, color: 'indigo' }}
          <TableBodyRow>
            <TableBodyCell class="flex items-center space-x-3">
              <Avatar src={user.avatar_urls?.['96']} />
              <span class="font-medium dark:text-white">{user.name}</span>
            </TableBodyCell>
            <TableBodyCell>{user.username}</TableBodyCell>
            <TableBodyCell>{user.email}</TableBodyCell>
            <TableBodyCell>
              <Badge color={roleInfo.color}>{roleInfo.label}</Badge>
            </TableBodyCell>
            <TableBodyCell class="space-x-2">
              <Button size="xs" color="alternative" href={`/crud/users/${user.id}/edit`}>Edit</Button>
              <Button size="xs" color="red" onclick={() => remove(user.id)}>Delete</Button>
            </TableBodyCell>
          </TableBodyRow>
        {/each}
      </TableBody>
    </Table>
  {:catch err}
    <p class="text-red-600">Failed to load users: {err.message}</p>
  {/await}
</div>
