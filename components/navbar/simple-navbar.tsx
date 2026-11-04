
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Check,
  Laptop,
  LogOut,
  Moon,
  ShieldCheck,
  Sun,
} from "lucide-react";

import { useAuth } from "@/context/authContext";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function SimpleNavbar() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const displayName =
    user?.name || user?.email || "Administrator";

  const email = user?.email || "";
  const role = user?.role || "Administrator";

  const initials =
    displayName
      .trim()
      .split(/[\s@.]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part: string) => part[0].toUpperCase())
      .join("") || "A";

  const handleLogout = async () => {
    await logout();
    router.replace("/admin/login");
  };

  return (
    <header className="w-full px-4 pt-3 sm:px-6">
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between rounded-full border border-border bg-background px-4 sm:px-6">
        {/* SaySo brand */}
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <ShieldCheck className="size-4" />
          </div>

          <span className="text-lg font-semibold tracking-tight">
            SaySo
          </span>

          <span className="hidden rounded-full border border-border px-2 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline-flex">
            ADMIN
          </span>
        </div>

        {/* Profile menu */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className="flex size-9 items-center justify-center rounded-full outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Open admin menu"
          >
            <Avatar className="size-9">
              <AvatarFallback className="bg-primary/10 text-sm font-medium text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-64">
            <div className="flex items-center gap-3 p-3">
              <Avatar className="size-10 shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  {displayName}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {email}
                </p>
                <p className="mt-1 text-xs capitalize text-muted-foreground">
                  {role}
                </p>
              </div>
            </div>

            <DropdownMenuSeparator />

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

            <DropdownMenuItem
              onClick={handleLogout}
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              <LogOut className="mr-2 size-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>
    </header>
  );
}
