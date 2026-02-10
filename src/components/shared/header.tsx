"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth";
import { ROUTES } from "@/lib/constants";
import {
  User,
  LogOut,
  LayoutDashboard,
  History,
  BookOpen,
  RefreshCw,
  Database,
  GraduationCap,
} from "lucide-react";
import { OpenLoopIndicator } from "@/components/features/tracking/open-loop-indicator";

export function Header() {
  const { isAuthenticated, user, logout, isLoading } = useAuth();

  return (
    <header className="border-b">
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center justify-center gap-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-full px-4 py-2 cursor-pointer">
          <span className="text-2xl" aria-hidden="true">
            🧠
          </span>
          <span className="font-bold text-xl">Pattern Blindness</span>
        </Link>

        <div className="flex items-center gap-2 md:gap-4">
          {/* Always visible links */}
          <Link href="/patterns">
            <Button variant="ghost" size="sm" className="hidden sm:flex">
              <BookOpen className="h-4 w-4 mr-2" />
              Patterns
            </Button>
            <Button variant="ghost" size="icon" className="sm:hidden">
              <BookOpen className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/data-structures">
            <Button variant="ghost" size="sm" className="hidden sm:flex">
              <Database className="h-4 w-4 mr-2" />
              Data Structures
            </Button>
            <Button variant="ghost" size="icon" className="sm:hidden">
              <Database className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/resources">
            <Button variant="ghost" size="sm" className="hidden sm:flex">
              <GraduationCap className="h-4 w-4 mr-2" />
              Resources
            </Button>
            <Button variant="ghost" size="icon" className="sm:hidden">
              <GraduationCap className="h-4 w-4" />
            </Button>
          </Link>

          {isLoading ? (
            <div className="h-10 w-20 bg-muted animate-pulse rounded" />
          ) : isAuthenticated ? (
            <>
              <OpenLoopIndicator />

              <Link href={ROUTES.practice}>
                <Button variant="ghost" size="sm">
                  Practice
                </Button>
              </Link>

              {/* User dropdown for authenticated users */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline max-w-40 truncate">
                      {user?.email?.split("@")[0]}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href={ROUTES.dashboard} className="flex items-center">
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/history" className="flex items-center">
                      <History className="h-4 w-4 mr-2" />
                      History
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/admin/sync" className="flex items-center">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Sync LeetCode
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={logout}
                    className="text-destructive focus:text-destructive"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link href={ROUTES.login}>
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link href={ROUTES.register}>
                <Button size="sm">Get Started</Button>
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
