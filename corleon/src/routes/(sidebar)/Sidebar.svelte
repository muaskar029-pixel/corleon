<script lang="ts">
  import { afterNavigate } from '$app/navigation';
  import { page } from '$app/state';
  import { Sidebar, SidebarDropdownWrapper, SidebarGroup, SidebarItem, SidebarWrapper, SidebarButton, uiHelpers } from 'flowbite-svelte';
  import {
    AngleDownOutline,
    AngleUpOutline,
    ClipboardListSolid,
    CogOutline,
    FileChartBarSolid,
    GithubSolid,
    LayersSolid,
    LifeSaverSolid,
    LockSolid,
    WandMagicSparklesOutline,
    ChartPieOutline,
    RectangleListSolid,
    TableColumnSolid,
    GridSolid,
    FireOutline,
    BookOpenOutline
  } from 'flowbite-svelte-icons';

  interface Props {
    drawerHidden: boolean;
    docsRoute: string[];
  }
  let { drawerHidden = $bindable(false), docsRoute }: Props = $props();
  const closeDrawer = () => {
    drawerHidden = true;
  };

  // icons sit inside the <a> (aClass adds group/link), so they can react to its hover and active state
  let iconClass =
    'shrink-0 w-5 h-5 text-[#0B2E8D]/60 transition group-hover/link:text-[#DB000F] group-aria-[current=page]/link:text-white dark:text-[#C4C0D4]/70 dark:group-hover/link:text-white';
  let itemClass = 'w-full';
  let linkClass = 'group/link w-full';
  let groupClass = 'pt-2 space-y-1 mb-3';
  // shared by plain links and dropdown buttons so every row looks the same
  const rowClass = 'rounded-xl p-2.5 text-body font-normal text-[#0E0347] transition hover:bg-[#DB000F]/10 hover:text-[#DB000F] dark:text-[#C4C0D4] dark:hover:bg-white/5 dark:hover:text-white';
  const sidebarClasses = {
    div: 'h-full px-1 py-1 overflow-y-auto bg-white dark:bg-[#0B0711]',
    nonactive: rowClass,
    active: 'rounded-xl p-2.5 text-body font-bold bg-[#DB000F] text-white hover:bg-[#BB080B] dark:bg-[#DB000F] dark:text-white dark:hover:bg-[#BB080B]'
  };
  const dropdownClasses = {
    btn: `group/link ${rowClass}`,
    svg: 'h-3 w-3 text-[#0B2E8D]/60 dark:text-[#C4C0D4]/70'
  };

  const sidebarUi = uiHelpers();
  let isOpen = $state(false);
  const closeSidebar = sidebarUi.close;
  $effect(() => {
    isOpen = sidebarUi.isOpen;
  });

  afterNavigate(() => {
    // this fixes https://github.com/themesberg/flowbite-svelte/issues/364
    document.getElementById('svelte')?.scrollTo({ top: 0 });
    closeDrawer();
  });

  let posts = [
    { name: 'Dashboard', Icon: ChartPieOutline, href: '/dashboard' },
    { name: 'Digital Asset', Icon: LayersSolid, href: '/Asset' },
    {
      name: 'Layouts',
      Icon: TableColumnSolid,
      children: {
        Stacked: '/layouts/stacked',
        Sidebar: '/layouts/sidebar'
      }
    },
    {
      name: 'CRUD',
      Icon: RectangleListSolid,
      children: {
        Products: '/crud/products',
        Users: '/crud/users'
      }
    },
    { name: 'Settings', Icon: CogOutline, href: '/settings' },
    {
      name: 'Pages',
      Icon: FileChartBarSolid,
      children: {
        Pricing: '/pages/pricing',
        Maintenance: '/errors/400',
        '404 not found': '/errors/404',
        '500 server error': '/errors/500'
      }
    },
    {
      name: 'Authentication',
      Icon: LockSolid,
      children: {
        'Sign in': '/authentication/sign-in',
        'Sign up': '/authentication/sign-up',
        'Forgot password': '/authentication/forgot-password',
        'Reset password': '/authentication/reset-password',
        'Profile lock': '/authentication/profile-lock'
      }
    },
    {
      name: 'Playground',
      Icon: WandMagicSparklesOutline,
      children: {
        Stacked: '/playground/stacked',
        Sidebar: '/playground/sidebar'
      }
    }
  ];

  let links = [
    {
      label: 'GitHub Repository',
      href: 'https://github.com/themesberg/flowbite-svelte-admin-dashboard',
      Icon: GithubSolid
    },
    {
      label: 'Flowbite Svelte',
      href: 'https://flowbite-svelte.com/docs/pages/quickstart',
      Icon: ClipboardListSolid
    },
    {
      label: 'Components',
      href: '/components/productdrawer',
      Icon: LayersSolid
    },
    {
      label: 'Support',
      href: 'https://github.com/themesberg/flowbite-svelte-admin-dashboard/issues',
      Icon: LifeSaverSolid
    }
  ];
</script>

<SidebarButton breakpoint="lg" onclick={sidebarUi.toggle} class="fixed top-[22px] z-40 mb-2 text-[#0E0347] hover:bg-[#DB000F]/10 dark:text-[#C4C0D4] dark:hover:bg-white/5" />
<Sidebar
  breakpoint="lg"
  backdrop={false}
  {isOpen}
  {closeSidebar}
  params={{ x: -50, duration: 50 }}
  activeUrl={page.url.pathname}
  class="top-0 left-0 mt-[69px] h-screen w-64 border-r border-[#C4C0D4]/40 bg-white transition-transform lg:block dark:border-white/10 dark:bg-[#0B0711]"
  classes={sidebarClasses}
>
  <h4 class="sr-only">Main menu</h4>
  <SidebarWrapper class="scrolling-touch h-full max-w-2xs overflow-y-auto bg-white px-3 pt-20 lg:sticky lg:me-0 lg:block lg:h-[calc(100vh-4rem)] lg:pt-5 dark:bg-[#0B0711]">
    <SidebarGroup class={groupClass}>
      {#each posts as { name, Icon, children, href } (name)}
        {#if children}
          <SidebarDropdownWrapper label={name} classes={dropdownClasses}>
            {#snippet arrowdown()}
              <AngleDownOutline strokeWidth="3.3" size="sm" />
            {/snippet}
            {#snippet arrowup()}
              <AngleUpOutline strokeWidth="3.3" size="sm" />
            {/snippet}
            {#snippet icon()}
              <Icon class={iconClass} />
            {/snippet}
            {#each Object.entries(children) as [title, href]}
              <SidebarItem label={title} {href} spanClass="ml-9" class={itemClass} aClass={linkClass} />
            {/each}
          </SidebarDropdownWrapper>
        {:else}
          <SidebarItem label={name} {href} spanClass="ml-3" class={itemClass} aClass={linkClass}>
            {#snippet icon()}
              <Icon class={iconClass} />
            {/snippet}
          </SidebarItem>
        {/if}
      {/each}
    </SidebarGroup>
    <SidebarGroup class={groupClass}>
      <SidebarDropdownWrapper label="Docs" classes={dropdownClasses}>
        {#snippet arrowdown()}
          <AngleDownOutline strokeWidth="3.3" size="sm" />
        {/snippet}
        {#snippet arrowup()}
          <AngleUpOutline strokeWidth="3.3" size="sm" />
        {/snippet}
        {#snippet icon()}
          <BookOpenOutline class={iconClass} />
        {/snippet}
        {#each docsRoute as doc}
          <SidebarItem label={doc} href={`/api-check/${doc}`} spanClass="ml-3" class={itemClass} aClass={linkClass}>
            {#snippet icon()}
              <FireOutline class={iconClass} />
            {/snippet}
          </SidebarItem>
        {/each}
      </SidebarDropdownWrapper>
      <SidebarItem label="About" spanClass="ml-3" href="/about" class={itemClass} aClass={linkClass}>
        {#snippet icon()}
          <GridSolid class={iconClass} />
        {/snippet}
      </SidebarItem>
    </SidebarGroup>

    <SidebarGroup class={groupClass}>
      {#each links as { label, href, Icon } (label)}
        <SidebarItem {label} {href} spanClass="ml-3" class={itemClass} aClass={linkClass}>
          {#snippet icon()}
            <Icon class={iconClass} />
          {/snippet}
        </SidebarItem>
      {/each}
    </SidebarGroup>
  </SidebarWrapper>
</Sidebar>
