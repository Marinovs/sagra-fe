"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, ShoppingCart, ChefHat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/theme-toggle";
import { useCart } from "@/lib/cart-context";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

export function NavBar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const { items } = useCart();

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/", label: "Menu" },
    { href: "/cart", label: "Carrello" },
    // { href: "/admin", label: "Admin" },
  ];

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-200 ${
        isScrolled
          ? "bg-background/95 backdrop-blur-sm border-b"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            {/* <Image
              src="https://i.ibb.co/JR4Gq5qy/365887081-6387153461352730-7481390912065758104-n.png"
              alt="Pro Loco Gioiese"
              width={64}
              height={64}
            /> */}
            <Link href="/" className="flex items-center space-x-2">
              <span className="font-playfair font-bold text-xl">
                Pro Loco Gioiese
              </span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname === link.href
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <ThemeToggle />
            <Link href="/cart">
              <Button variant="outline" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                    {totalItems}
                  </Badge>
                )}
              </Button>
            </Link>
          </nav>

          <div className="flex md:hidden items-center space-x-2">
            <ThemeToggle />
            {/* <Link href="/cart">
              <Button
                variant="outline"
                size="icon"
                className="relative w-10 h-10"
              >
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                    {totalItems}
                  </Badge>
                )}
              </Button>
            </Link> */}
            {/* <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="w-10 h-10">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[350px]">
                <div className="flex items-center space-x-2 mb-8">
                  <ChefHat className="h-6 w-6" />
                  <span className="font-playfair font-bold text-xl">
                    Sagra Antichi Sapori
                  </span>
                </div>
                <nav className="flex flex-col space-y-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`text-lg font-medium transition-colors hover:text-primary ${
                        pathname === link.href
                          ? "text-primary"
                          : "text-muted-foreground"
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                  <div className="pt-4 border-t">
                    <ThemeToggle />
                  </div>
                </nav>
              </SheetContent>
            </Sheet> */}
          </div>
        </div>
      </div>
    </header>
  );
}
