	<script lang="ts">
	// for icon
	import CameraIcon from "@tabler/icons-svelte/icons/camera";
	import ChartBarIcon from "@tabler/icons-svelte/icons/chart-bar";
	import DashboardIcon from "@tabler/icons-svelte/icons/dashboard";
	import DatabaseIcon from "@tabler/icons-svelte/icons/database";
	import FileAiIcon from "@tabler/icons-svelte/icons/file-ai";
	import FileDescriptionIcon from "@tabler/icons-svelte/icons/file-description";
	import FileWordIcon from "@tabler/icons-svelte/icons/file-word";
	import FolderIcon from "@tabler/icons-svelte/icons/folder";
	import HelpIcon from "@tabler/icons-svelte/icons/help";
	import InnerShadowTopIcon from "@tabler/icons-svelte/icons/inner-shadow-top";
	import ListDetailsIcon from "@tabler/icons-svelte/icons/list-details";
	import ReportIcon from "@tabler/icons-svelte/icons/report";
	import SearchIcon from "@tabler/icons-svelte/icons/search";
	import SettingsIcon from "@tabler/icons-svelte/icons/settings";
	import UsersIcon from "@tabler/icons-svelte/icons/users";
	import Archive from "phosphor-svelte/lib/Archive";
	import FrameCorners from "phosphor-svelte/lib/FrameCorners";
	import HandshakeIcon from "phosphor-svelte/lib/Handshake";
	import SquaresFourIcon from "phosphor-svelte/lib/SquaresFour";

	// for main nav
	import * as Sidebar from "#lib/components/ui/sidebar/index.js";
	import NavDocuments from "./nav-documents.svelte";
	import NavMain from "./nav-main.svelte";
	import NavSecondary from "./nav-secondary.svelte";
	import NavUser from "./nav-user.svelte";
	import type { ComponentProps } from "svelte";
	import logo from "#lib/assets/logo.png";

	const data = {
		user: {
			name: "corleon",
			email: "m@example.com",
			avatar: "/avatars/shadcn.jpg",
		},
		navMain: [
			{
				title: "Asset",
				url: "/digital-asset",
				icon: DashboardIcon,
			},
			{
				title: "Lifecycle",
				url: "#",
				icon: ListDetailsIcon,
			},
            {
                title: "Digital Asset",
                url: "/?tab=digital-asset",
                icon: FrameCorners,
				items: [                                                                                                                                                                                                                          
                    { title: "All Assets", url: "/?tab=digital-asset" },                                                                                                                                                                            
                    { title: "Add / Edit Post", url: "/digital-asset/edit" },                                                                                                                                                                       
                    { title: "Taxonomy", url: "/post/digital-asset/taxonomy" },                                                                                                                                                                          
                ],
			},
		],
		navSecondary: [
			{
				title: "Settings",
				url: "#",
				icon: SettingsIcon,
			},
			{
				title: "Get Help",
				url: "#",
				icon: HelpIcon,
			},
			{
				title: "Search",
				url: "#",
				icon: SearchIcon,
			},
		],
	};

	let { ...restProps }: ComponentProps<typeof Sidebar.Root> = $props();
</script>
<Sidebar.Root collapsible="offcanvas" {...restProps}>
        <Sidebar.Header>
            <Sidebar.Menu>
                <Sidebar.MenuItem>
                    <Sidebar.MenuButton class="data-[slot=sidebar-menu-button]:!p-1.5">
    			{#snippet child({ props })}
                            <a href="/" {...props}>
    				<img src={ logo } alt="Radova" class="size-5" />
    				<span class="text-base font-semibold tracking-wide">Corleon</span>
                            </a>
    			{/snippet}
                    </Sidebar.MenuButton>
                </Sidebar.MenuItem>
            </Sidebar.Menu>
        </Sidebar.Header>
  
        <Sidebar.Content>
            <NavMain items={data.navMain} />
			<NavSecondary items={data.navSecondary} />
        </Sidebar.Content>

		
        <Sidebar.Footer>
            <NavUser user={data.user} />
        </Sidebar.Footer>
    </Sidebar.Root>

