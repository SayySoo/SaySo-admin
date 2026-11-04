
"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";

import {
  Check,
  Laptop,
  LogOut,
  Moon,
  Sun,
} from "lucide-react";

import { useAuth } from "@/context/authContext";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

const pageTitles: Record<string, string> = {
  "/admin/dashboard": "Dashboard",
  "/admin/complaints": "Complaints",
  "/admin/categories": "Categories",
  "/admin/staff": "Staff",
  "/admin/settings": "Settings",
};

export function DashboardNavbar() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  const [mounted, setMounted] = useState(false);

  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  const initials =
    user?.name
      ?.trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase() || "A";

  const currentPage =
    pageTitles[pathname] ??
    Object.entries(pageTitles).find(
      ([path]) =>
        path !== "/admin/dashboard" &&
        pathname.startsWith(`${path}/`)
    )?.[1] ??
    "Dashboard";

  return (
    <header className="sticky top-0 z-20 flex h-18 items-center justify-between border-b border-border bg-background px-4 sm:px-6">

      {/* Left: Sidebar and Page Information */}
      <div className="flex min-w-0 items-center gap-3">
      

      

        <div className="min-w-0">
          <p className="truncate text-xs text-muted-foreground">
            SaySo / Administration
          </p>

          <h2 className="truncate text-sm font-semibold tracking-tight">
            {currentPage}
          </h2>
        </div>
      </div>

      {/* Right: Admin Profile */}
      <DropdownMenu>
        <DropdownMenuTrigger
          className="flex size-9 items-center justify-center rounded-full outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Open admin profile menu"
        >
          <Avatar className="size-9">
            <AvatarFallback className="bg-muted text-sm text-muted-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-64">

          {/* Admin Details */}
        <Link href={`/admin-profile/${user?.sub}`}>
          <div className="flex items-center gap-3 p-3">
            <Avatar className="size-10 shrink-0">
              <AvatarFallback>
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                {user?.name || "Administrator"}
              </p>

              <p className="truncate text-xs text-muted-foreground">
                {user?.email || "No email available"}
              </p>

              <p className="mt-1 text-xs capitalize text-muted-foreground">
                {user?.role || "Admin"}
              </p>
            </div>
          </div>
        
        </Link>

          <DropdownMenuSeparator />

          {/* Appearance */}
          <div className="px-3 py-2 text-xs font-medium text-muted-foreground">
            Appearance
          </div>

          <DropdownMenuItem onClick={() => setTheme("light")}>
            <Sun className="mr-2 size-4" />
            Light theme

            {mounted && theme === "light" && (
              <Check className="ml-auto size-4" />
            )}
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => setTheme("dark")}>
            <Moon className="mr-2 size-4" />
            Dark theme

            {mounted && theme === "dark" && (
              <Check className="ml-auto size-4" />
            )}
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => setTheme("system")}>
            <Laptop className="mr-2 size-4" />
            System theme

            {mounted && theme === "system" && (
              <Check className="ml-auto size-4" />
            )}
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Logout */}
          <DropdownMenuItem
            onClick={() => logout()}
            className="cursor-pointer"
          >
            <LogOut className="mr-2 size-4" />
            Log out
          </DropdownMenuItem>

        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
