<script lang="ts">
  import '../../app.css';
  import Navbar from './Navbar.svelte';
  import Sidebar from './Sidebar.svelte';
  import type { LayoutProps } from './$types';

  interface Route {
    path: string;
  }

  let { children, data }: LayoutProps = $props();
  const routes: Route[] = data.posts.adminDashboard;
  const docsRoute = routes.filter((route) => route.path !== '').map((route) => route.path);

  let drawerHidden = $state(false);
</script>

<header class="fixed top-0 z-40 mx-auto w-full flex-none border-b border-[#C4C0D4]/40 bg-white/90 backdrop-blur dark:border-white/10 dark:bg-[#0B0711]/90">
  <Navbar bind:drawerHidden />
</header>
<div class="overflow-hidden lg:flex">
  <Sidebar bind:drawerHidden {docsRoute} />
  <div class="relative h-full w-full overflow-y-auto pt-[70px] lg:ml-64">
    {@render children()}
  </div>
</div>
