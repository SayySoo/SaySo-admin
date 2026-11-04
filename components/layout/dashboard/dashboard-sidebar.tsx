
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  LayoutDashboard,
  ClipboardList,
  Tags,
  Users,
  Settings,
  LogOut,
  Building,
} from "lucide-react";

import { useAuth } from "@/context/authContext";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { PRODUCT_IMAGES } from "@/public/image/image";

const navigation = [
  {
    title: "Dashboard",
    url: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Complaints",
    url: "/admin/complaints",
    icon: ClipboardList,
  },
  {
    title: "Categories",
    url: "/admin/categories",
    icon: Tags,
  },
  {
    title: "Department",
    url: "/admin/department",
    icon: Building
  },
  {
    title: "Staff",
    url: "/admin/staff",
    icon: Users,
  },
  
];

/* const accountNavigation = [
  
  {
    title: "Settings",
    url: "/admin/settings",
    icon: Settings,
  },
];
 */
export function DashboardSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  const isRouteActive = (url: string) => {
    return pathname === url || pathname.startsWith(`${url}/`);
  };

  return (
    <Sidebar
  collapsible="none"
  variant="sidebar"
  className="!h-svh !min-h-svh"
>
      {/* Brand */}
      <SidebarHeader className="p-2">
        <Link
          href="/admin/dashboard"
          className="flex items-center gap-3 px-2 py-1.5"
        >
         <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl">
            <Image
              src={PRODUCT_IMAGES.LOGO}
              alt="CampusFix"
              className="size-10 object-contain"
              width={100}
              height={100}
              priority
            />
          </div>

          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold tracking-tight">
              SaySo
            </h1>
            <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              Administration
            </p>
          </div>
        </Link>
      </SidebarHeader>

      <Separator />

      {/* Navigation */}
      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupLabel>
            Workspace
          </SidebarGroupLabel>

          <SidebarMenu>
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = isRouteActive(item.url);

              return (
                <SidebarMenuItem  key={item.url}>
                  <SidebarMenuButton
                    
                    isActive={isActive}
                    tooltip={item.title}
                    className="w-full mt-2"
                  >
                    <Link
                      href={item.url}
                      className="flex items-center gap-2.5"
                    >
                      <Icon className="size-4 shrink-0" />
                      <span className="truncate">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>

       {/*  <SidebarGroup>
          <SidebarGroupLabel>
            Account
          </SidebarGroupLabel>

          <SidebarMenu>
            {accountNavigation.map((item) => {
              const Icon = item.icon;

              return (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    
                    isActive={isRouteActive(item.url)}
                    tooltip={item.title}
                  >
                    <Link
                      href={item.url}
                      className="flex items-center gap-2.5"
                    >
                      <Icon className="size-4 shrink-0" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup> */}
      </SidebarContent>

      {/* Logout */}
      <SidebarFooter className="p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={logout}
              tooltip="Logout"
              className="w-full"
            >
              <LogOut className="size-4 shrink-0" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
