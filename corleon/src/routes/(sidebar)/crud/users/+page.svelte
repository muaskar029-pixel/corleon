<script>
  import {
    Avatar,
    Spinner,
    Table,
    TableBody,
    TableBodyCell,
    TableBodyRow,
    TableHead,
    TableHeadCell
  } from 'flowbite-svelte';
  import { getUsers } from '$lib/wp/axios.js';

  const usersPromise = getUsers();
</script>

<div class="p-4">
  <h1 class="mb-4 text-2xl font-bold dark:text-white">Users</h1>

  {#await usersPromise}
    <Spinner />
  {:then users}
    <Table>
      <TableHead>
        <TableHeadCell>Name</TableHeadCell>
        <TableHeadCell>Username</TableHeadCell>
        <TableHeadCell>Email</TableHeadCell>
        <TableHeadCell>Role</TableHeadCell>
      </TableHead>
      <TableBody>
        {#each users as user}
          <TableBodyRow>
            <TableBodyCell class="flex items-center space-x-3">
              <Avatar src={user.avatar_urls?.['96']} />
              <span>{user.name}</span>
            </TableBodyCell>
            <TableBodyCell>{user.username}</TableBodyCell>
            <TableBodyCell>{user.email}</TableBodyCell>
            <TableBodyCell>{user.roles?.[0] || '-'}</TableBodyCell>
          </TableBodyRow>
        {/each}
      </TableBody>
    </Table>
  {:catch err}
    <p class="text-red-600">Failed to load users: {err.message}</p>
  {/await}
</div>
