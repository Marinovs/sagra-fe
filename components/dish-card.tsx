"use client";

import Image from "next/image";
import { useState, memo } from "react";
import { Dish } from "@/lib/types";
import { useCart } from "@/lib/cart-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Calendar } from "lucide-react";

interface DishCardProps {
  dish: Dish;
}

export const DishCard = memo(function DishCard({ dish }: DishCardProps) {
  const { addItem } = useCart();

  const handleAddToCart = () => {
    if (!dish.available) return;

    addItem(dish);
    // Salva il carrello aggiornato nel localStorage solo lato client
    if (typeof window !== "undefined") {
      try {
        const cartKey = "cart";
        // Recupera il carrello attuale dal localStorage o crea un array vuoto
        const currentCart = JSON.parse(localStorage.getItem(cartKey) || "[]");
        // Aggiungi il nuovo piatto
        currentCart.push(dish);
        // Salva il nuovo carrello
        localStorage.setItem(cartKey, JSON.stringify(currentCart));
      } catch (e) {
        // Gestione errori opzionale
        console.error("Errore nel salvataggio del carrello su localStorage", e);
      }
    }
  };

  const formattedPrice = new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(dish.price);

  // Optionally, you can map dish.category to a display string if needed
  const category = dish.category || "";

  // Compute closest available date label if availableDates are provided
  const closestAvailable: { label: string; relative: boolean } | null = (() => {
    if (!dish.availableDates || dish.availableDates.length === 0) return null;
    const dates = [...dish.availableDates].sort();
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const todayStr = `${yyyy}-${mm}-${dd}`;
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const tyyyy = tomorrow.getFullYear();
    const tmm = String(tomorrow.getMonth() + 1).padStart(2, "0");
    const tdd = String(tomorrow.getDate()).padStart(2, "0");
    const tomorrowStr = `${tyyyy}-${tmm}-${tdd}`;

    const upcoming = dates.filter((d) => d >= todayStr);
    const chosen = upcoming.length > 0 ? upcoming[0] : dates[dates.length - 1];

  if (chosen === todayStr) return { label: "oggi", relative: true };
  if (chosen === tomorrowStr) return { label: "domani", relative: true };

    try {
      const label = new Date(chosen).toLocaleDateString("it-IT", {
        day: "2-digit",
        month: "2-digit",
      });
  return { label, relative: false };
    } catch {
  return { label: "-", relative: false };
    }
  })();

  return (
    <div
      className="flex flex-col bg-white rounded-2xl shadow-md max-w-xs mx-auto overflow-hidden transition-all duration-200 hover:shadow-xl border border-[#f3e6e7]"
      style={{
        fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif',
        minWidth: 260,
      }}
    >
      {/* Immagine rettangolare arrotondata in alto */}
      <div className="w-full h-full aspect-square relative rounded-xl overflow-hidden flex items-center justify-center ">
        <Image
          src={`/images/webp/${dish.name}.webp`}
          alt={dish.name}
          fill
          className="object-scale-down drop-shadow-2xl"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={false}
          loading="lazy"
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
        />
        {/* Badge prezzo sovrapposto in alto a destra */}
        <span className="absolute top-3 right-3 bg-[#e8b4b7] text-[#191011] text-lg font-extrabold px-4 py-2 rounded-full shadow border border-white">
          {formattedPrice}
        </span>
      </div>
      {/* Testo e bottone */}
      <div className="flex flex-col items-center text-center gap-1 w-full px-5 py-4">
        <p className="text-[#191011] text-lg font-extrabold leading-tight mb-1 w-full">
          {dish.name}
        </p>
        {(dish.availableDates?.length || dish.availableOn) && (
          <div className="flex items-center gap-2 w-full mb-3 bg-primary/5 rounded-lg px-3 py-2">
            <Calendar className="h-6 w-6 text-primary" />
            <div className="flex flex-wrap gap-2">
              {(() => {
                const dates =
                  dish.availableDates && dish.availableDates.length > 0
                    ? [...dish.availableDates].sort()
                    : dish.availableOn
                    ? [dish.availableOn]
                    : [];
                if (!dates.length) return null;

                const today = new Date();
                const yyyy = today.getFullYear();
                const mm = String(today.getMonth() + 1).padStart(2, "0");
                const dd = String(today.getDate()).padStart(2, "0");
                const todayStr = `${yyyy}-${mm}-${dd}`;

                const visible = dates.slice(0, 3);
                const hidden = dates.slice(3);

                const fmt = (d: string) =>
                  new Date(d).toLocaleDateString("it-IT", {
                    day: "2-digit",
                    month: "2-digit",
                  });

                return (
                  <>
                    {visible.map((d) => {
                      const isToday = d === todayStr;
                      return (
                        <span
                          key={d}
                          className={cn(
                            "px-3 py-1.5 rounded-full text-base font-semibold border",
                            isToday
                              ? "bg-primary text-primary-foreground border-primary/70 shadow-sm"
                              : "bg-primary/10 text-primary border-primary/30"
                          )}
                          title={isToday ? "Oggi" : undefined}
                        >
                          {isToday ? "Oggi" : fmt(d)}
                        </span>
                      );
                    })}
                    {hidden.length > 0 && (
                      <span
                        className="px-3 py-1.5 rounded-full text-base font-semibold bg-primary/10 text-primary border border-primary/30"
                        title={hidden.map(fmt).join(", ")}
                      >
                        +{hidden.length}
                      </span>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        )}
        <Button
          onClick={handleAddToCart}
          disabled={!dish.available}
          className={cn(
            "w-full mt-2 font-bold rounded-xl py-2 text-base shadow transition",
            dish.available
              ? "bg-[#e8b4b7] text-[#191011] hover:bg-[#f5e3e4]"
              : "bg-gray-300 text-gray-500 cursor-not-allowed hover:bg-gray-300"
          )}
          variant="ghost"
        >
          {dish.availableDates && dish.availableDates.length > 0
            ? `Disponibile ${closestAvailable?.relative ? "" : "il "}${closestAvailable?.label ?? "-"}`
            : dish.available
            ? "Aggiungi al Carrello"
            : "Non Disponibile"}
        </Button>
      </div>
    </div>
  );
});
