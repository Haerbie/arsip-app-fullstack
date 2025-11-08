"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { useSession } from "@/lib/auth-client"
import {
  IconDashboard,
  IconFolder,
  IconFileText,
  IconTags,
  IconTag,
  IconHash,
  IconBuilding,
  IconUsers,
  IconFileBarChart,
  IconSettings,
  IconHelp,
  IconSearch,
  IconHome,
  IconSignOut,
} from "@tabler/icons-react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { getMenuItems } from "@/lib/auth-utils"
import { Button } from "@/components/ui/button"

// Icon mapping
const iconMap = {
  LayoutDashboard: IconDashboard,
  Folder: IconFolder,
  FileText: IconFileText,
  Tags: IconTags,
  Tag: IconTag,
  Hash: IconHash,
  Building: IconBuilding,
  Users: IconUsers,
  FileBarChart: IconFileBarChart,
  Settings: IconSettings,
  Help: IconHelp,
  Search: IconSearch,
  Home: IconHome,
  SignOut: IconSignOut,
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession()

  const userData = session?.user ? {
    name: session.user.name || "User",
    email: session.user.email,
    avatar: session.user.image || "/codeguide-logo.png",
    role: session.user.role as string,
  } : {
    name: "Guest",
    email: "guest@example.com",
    avatar: "/codeguide-logo.png",
    role: "user",
  }

  // Get role-based menu items
  const menuItems = React.useMemo(() => {
    return getMenuItems(userData.role as any)
  }, [userData.role])

  // Transform menu items for NavMain component
  const navMainItems = menuItems.map(item => {
    if (item.items) {
      return {
        title: item.title,
        url: "#",
        icon: iconMap[item.items[0]?.icon as keyof typeof iconMap] || IconFolder,
        items: item.items.map(subItem => ({
          title: subItem.title,
          url: subItem.href,
          icon: iconMap[subItem.icon as keyof typeof iconMap],
        })),
      }
    }
    return {
      title: item.title,
      url: item.href,
      icon: iconMap[item.icon as keyof typeof iconMap] || IconFolder,
    }
  })

  const navSecondaryItems = [
    {
      title: "Beranda",
      url: "/",
      icon: IconHome,
    },
    {
      title: "Cari",
      url: "#",
      icon: IconSearch,
    },
    {
      title: "Bantuan",
      url: "#",
      icon: IconHelp,
    },
  ]

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/sign-out", { method: "POST" })
      window.location.href = "/sign-in"
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/dashboard">
                <Image src="/codeguide-logo.png" alt="Arsip App" width={32} height={32} className="rounded-lg" />
                <span className="text-base font-semibold font-parkinsans">Arsip App</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMainItems} />
        <NavSecondary items={navSecondaryItems} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <div className="space-y-2">
          <NavUser user={userData} />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="w-full justify-start"
          >
            <IconSignOut className="mr-2 h-4 w-4" />
            Keluar
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
