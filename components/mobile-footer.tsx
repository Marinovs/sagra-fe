"use client";
import { useCart } from "@/lib/cart-context";
import { ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // Add this import

export const MobileFooter = () => {
  const cart = useCart(); // Get cart context
  const cartCount = Array.isArray(cart.items) ? cart.items.length : 0;
  const router = useRouter(); // Initialize router

  // State for last order
  const [lastOrder, setLastOrder] = useState<{
    id?: string;
    date?: string;
  } | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("lastOrder");
        if (stored) {
          setLastOrder(JSON.parse(stored));
        }
      } catch {
        setLastOrder(null);
      }
    }
  }, []);

  return (
    <div className="fixed bottom-0 left-0 w-full z-50">
      <div className="grid grid-cols-2 gap-2 border-t border-[#f3e7e8] bg-[#fcf8f8] px-4 pb-3 pt-2 shadow-[0_-2px_12px_0_rgba(153,77,81,0.07)] dark:bg-[#3c2d2f] dark:border-[#2d181a]">
        {/* Menu */}
        <button
          className="flex flex-1 flex-col items-center justify-end gap-1 rounded-xl py-1 transition-all hover:bg-[#f3e7e8] active:scale-95 focus:outline-none dark:hover:bg-[#231415]"
          onClick={() => router.push("/menu")}
        >
          <div className="text-[#1b0e0e] flex h-8 items-center justify-center dark:text-[#f3e7e8]">
            {/* House icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24px"
              height="24px"
              fill="currentColor"
              viewBox="0 0 256 256"
            >
              <path d="M224,115.55V208a16,16,0,0,1-16,16H168a16,16,0,0,1-16-16V168a8,8,0,0,0-8-8H112a8,8,0,0,0-8,8v40a16,16,0,0,1-16,16H48a16,16,0,0,1-16-16V115.55a16,16,0,0,1,5.17-11.78l80-75.48.11-.11a16,16,0,0,1,21.53,0,1.14,1.14,0,0,0,.11.11l80,75.48A16,16,0,0,1,224,115.55Z"></path>
            </svg>
          </div>
          <span className="text-[#1b0e0e] text-xs font-semibold leading-normal tracking-[0.015em] dark:text-[#f3e7e8]">
            Menu
          </span>
        </button>
        {/* Carrello */}
        <button
          className={`flex flex-1 flex-col items-center justify-end gap-1 rounded-xl py-1 transition-all relative ${
            cartCount > 0
              ? "bg-[#994d51] text-[#fff] shadow-lg dark:bg-[#e8b4b7] dark:text-[#191011]"
              : "text-[#994d51] hover:bg-[#f3e7e8] dark:text-white dark:hover:bg-[#231415]"
          } active:scale-95 focus:outline-none`}
          onClick={() => router.push("/cart")}
        >
          <div
            className={`flex h-8 items-center justify-center ${
              cartCount > 0
                ? "text-[#fff] dark:text-[#191011]"
                : "text-[#994d51] dark:text-white"
            }`}
          >
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center shadow">
                {cartCount}
              </span>
            )}
          </div>
          <span
            className={`text-xs font-semibold leading-normal tracking-[0.015em] ${
              cartCount > 0
                ? "text-[#fff] dark:text-[#191011]"
                : "text-[#994d51] dark:text-white"
            }`}
          >
            Carrello
          </span>
        </button>
      </div>
    </div>
  );
};
