"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShoppingCart, ArrowLeft } from "lucide-react";

import { NavBar } from "@/components/nav-bar";
import { Footer } from "@/components/footer";
import { MobileFooter } from "@/components/mobile-footer";
import { CartList } from "@/components/cart-list";
import { CartSummary } from "@/components/cart-summary";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-context";

export default function CartPage() {
  const { items, total } = useCart(); // Assicurati che useCart esponga setItems
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [localCart, setLocalCart] = useState<any[]>([]);

  // Set mounted flag after first render
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const hasItems = items.length > 0 || localCart.length > 0;
  return (
    <main className="min-h-screen bg-background flex flex-col">
      <NavBar />
      <div className="container mx-auto px-4 py-8 flex-grow pb-48">
        <h1 className="text-3xl font-bold tracking-tight mb-8">
          Il Tuo Carrello
        </h1>

        {hasItems ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <CartList />
            </div>
            <div className="lg:col-span-1">
              <CartSummary items={items.length > 0 ? items : localCart} />
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="inline-flex justify-center items-center w-20 h-20 rounded-full bg-muted mb-4">
              <ShoppingCart className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">
              Il tuo carrello è vuoto
            </h2>
            <p className="text-muted-foreground mb-8">
              Aggiungi qualche piatto dal nostro menù per iniziare a ordinare
            </p>
            <Button onClick={() => router.push("/")}>Sfoglia il Menu</Button>
          </div>
        )}
      </div>
      <div className="block sm:hidden">
        <MobileFooter />
      </div>
      <div className="hidden sm:block">
        <Footer />
      </div>
    </main>
  );
}
