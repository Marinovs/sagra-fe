"use client";

import Image from "next/image";
import { useState, memo } from "react";
import { Dish } from "@/lib/types";
import { useCart } from "@/lib/cart-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
          {dish.available ? "Aggiungi al Carrello" : "Non Disponibile"}
        </Button>
      </div>
    </div>
  );
});
