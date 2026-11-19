<script lang="ts">
  import { AppsMenu, UserMenu, NotificationList, mapUsersWithAvatars } from '$lib';
  import { DarkMode, Dropdown, DropdownItem, NavBrand, NavLi, NavUl, Navbar, Search, DropdownDivider } from 'flowbite-svelte';
  import {
    ArchiveSolid,
    ArrowRightToBracketOutline,
    CogOutline,
    DollarOutline,
    InboxOutline,
    ProfileCardOutline,
    SalePercentOutline,
    ShoppingBagSolid,
    UsersGroupSolid,
    AnnotationSolid,
    CameraPhotoOutline,
    DownloadSolid,
    HeartSolid,
    ChevronDownOutline
  } from 'flowbite-svelte-icons';
  import '../../app.css';
  import Users from '../data/users.json';
  import type { NotificationProps } from '$lib/types';

  type NotificationData = Omit<NotificationProps, 'children'> & {
    content: string;
  };

  interface Props {
    drawerHidden?: boolean;
    list?: boolean;
  }

  let { drawerHidden = $bindable(false), list = false }: Props = $props();

  const menu = [
    { name: 'Sales', href: '/', icon: ShoppingBagSolid },
    { name: 'Users', href: '/', icon: UsersGroupSolid },
    { name: 'Inbox', href: '/', icon: InboxOutline },
    { name: 'Profile', href: '/', icon: ProfileCardOutline },
    { name: 'Settings', href: '/settings', icon: CogOutline },
    { name: 'Prouducts', href: '/', icon: ArchiveSolid },
    { name: 'Pricing', href: '/pages/pricing', icon: DollarOutline },
    { name: 'Billing', href: '/', icon: SalePercentOutline },
    { name: 'Logout', href: '/', icon: ArrowRightToBracketOutline }
  ];
  const menuItems = ['Dashboard', 'Settings', 'Earnings'];

  // for avatar
  const users = mapUsersWithAvatars(Users);

  const notifications: NotificationData[] = [
    {
      src: users[0].avatar,
      Icon: DownloadSolid,
      when: 'a few moments ago',
      color: 'purple',
      content: `New message from <span class="font-semibold text-gray-900 dark:text-white">Bonnie Green</span>: "Hey, what's up? All set for the presentation?"`
    },
    {
      src: users[1].avatar,
      Icon: UsersGroupSolid,
      when: '10 minutes ago',
      color: 'gray',
      content: `<span class="font-semibold text-gray-900 dark:text-white">Jese leos</span> and <span class="font-medium text-gray-900 dark:text-white">5 others</span> started following you.`
    },
    {
      src: users[3].avatar,
      Icon: HeartSolid,
      when: '44 minutes ago',
      color: 'red',
      content: `<span class="font-semibold text-gray-900 dark:text-white">Joseph Mcfall</span> and <span class="font-medium text-gray-900 dark:text-white">141 others</span> love your story. See it and view more stories.`
    },
    {
      src: users[4].avatar,
      Icon: AnnotationSolid,
      when: '1 hour ago',
      color: 'green',
      content: `<span class="font-semibold text-gray-900 dark:text-white">Leslie Livingston</span> mentioned you in a comment: <span class="text-primary-700 dark:text-primary-500 font-medium">@bonnie.green</span> what do you say?`
    },
    {
      src: users[5].avatar,
      Icon: CameraPhotoOutline,
      when: '3 hours ago',
      color: 'purple',
      content: `<span class="font-semibold text-gray-900 dark:text-white">Robert Brown</span> posted a new video: Glassmorphism - learn how to implement the new design trend.`
    }
  ];
</script>

<Navbar class="mx-10 sm:mx-0">
  <NavBrand href="/" class="mx-10">
    <img src="/images/corleon-svelte-icon-logo.png" class="me-2.5 h-6 sm:h-8" alt="Corleon Logo" />
    <span class="font-heading ml-px self-center text-xl font-extrabold tracking-tight whitespace-nowrap text-[#0E0347] sm:text-2xl dark:text-white"> Corleon </span>
  </NavBrand>
  <div class="hidden lg:block lg:ps-3">
    {#if list}
      <NavUl class="ml-2" activeUrl="/" activeClass="text-primary-600 dark:text-primary-500">
        <NavLi href="/">Home</NavLi>
        <NavLi href="#top">Messages</NavLi>
        <NavLi href="#top">Profile</NavLi>
        <NavLi href="#top">Settings</NavLi>
        <NavLi class="cursor-pointer">
          Dropdown
          <ChevronDownOutline class="ms-0 inline" />
        </NavLi>
        <Dropdown class="z-20 w-44">
          <DropdownItem href="#top">Item 1</DropdownItem>
          <DropdownItem href="#top">Item 2</DropdownItem>
          <DropdownItem href="#top">Item 3</DropdownItem>
        </Dropdown>
      </NavUl>
    {:else}
      <form>
        <Search
          size="md"
          class="mt-1 w-96"
          classes={{
            input: 'rounded-full border-[#C4C0D4] bg-[#F7F6FF] text-[#0E0347] focus:border-[#DB000F] focus:ring-[#DB000F] dark:border-white/10 dark:bg-[#0B0711] dark:text-white dark:focus:border-[#DB000F] dark:focus:ring-[#DB000F]',
            icon: 'text-[#0B2E8D]/60 dark:text-[#C4C0D4]/70'
          }}
        />
      </form>
    {/if}
  </div>
  <div class="ms-auto flex items-center text-[#0B2E8D] sm:order-2 dark:text-[#C4C0D4]">
    <NotificationList {notifications} />
    <AppsMenu {menu} />
    <DarkMode />
    <UserMenu {...users[4]} {menuItems}>
      <DropdownDivider />
      <DropdownItem>Sign out</DropdownItem>
    </UserMenu>
  </div>
</Navbar>
