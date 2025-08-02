"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  ChefHat,
  ClipboardList,
  UtensilsCrossed,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import axios from "axios";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Admin password (in a real app, this would be handled by a proper authentication system)
  const ADMIN_PASSWORD = "admin123";

  useEffect(() => {
    setMounted(true);

    // Check if user is authenticated
    const isAuth = localStorage.getItem("token") !== null;
    console.log("Is authenticated:", isAuth);
    setIsAuthenticated(isAuth);

    // If not authenticated and not on login page, redirect to login
    if (!isAuth && pathname !== "/admin/login") {
      router.push("/admin/login");
    }
  }, [pathname, router]);

  if (!mounted) {
    return null;
  }

  // Skip layout if on login page
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: BarChart3 },
    { href: "/admin/dishes", label: "Gestione Piatti", icon: UtensilsCrossed },
    { href: "/admin/orders", label: "Ordini", icon: ClipboardList },
  ];

  const handleLogout = () => {
    localStorage.removeItem("adminAuthenticated");
    setIsAuthenticated(false);
    router.push("/admin/login");
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar - desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r bg-card">
        <div className="p-6 border-b">
          <Link href="/admin" className="flex items-center space-x-2">
            <ChefHat className="h-6 w-6" />
            <span className="font-bold text-xl">Admin Panel</span>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className="w-full justify-start"
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Logout
          </Button>
          <ThemeToggle />
        </div>
      </aside>

      {/* Mobile header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur-sm">
        <div className="container flex h-14 items-center">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-2">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px] sm:w-[300px]">
              <div className="flex items-center space-x-2 mb-6">
                <ChefHat className="h-6 w-6" />
                <span className="font-bold text-xl">Admin Panel</span>
              </div>
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <Link key={item.href} href={item.href}>
                      <Button
                        variant={isActive ? "default" : "ghost"}
                        className="w-full justify-start"
                      >
                        <Icon className="h-5 w-5 mr-2" />
                        {item.label}
                      </Button>
                    </Link>
                  );
                })}
                <Button
                  variant="outline"
                  className="w-full justify-start mt-4"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
          <Link href="/admin" className="flex items-center space-x-2">
            <ChefHat className="h-5 w-5" />
            <span className="font-semibold">Admin</span>
          </Link>
          <div className="ml-auto flex items-center space-x-2">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 md:p-8 p-4 pt-20 md:pt-8 flex flex-col">
        {children}
      </main>
    </div>
  );
}
