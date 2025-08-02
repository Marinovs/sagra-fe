"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import axios from "axios";
import Image from "next/image";
import { Dish, DishCategories, DishCategory } from "../lib/types";
import { useCart } from "@/lib/cart-context";

// Dynamic import for DishCard
const DishCard = dynamic(
  () => import("./dish-card").then((mod) => ({ default: mod.DishCard })),
  {
    loading: () => (
      <div className="h-48 bg-gray-100 animate-pulse rounded-lg"></div>
    ),
  }
);

export function MenuSectionMobile() {
  const { addItem } = useCart();
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showCategories, setShowCategories] = useState<boolean>(true);
  const [filteredDishes, setFilteredDishes] = useState<Dish[]>([]);
  const [viewMode, setViewMode] = useState<"card" | "compact">("card");

  useEffect(() => {
    async function fetchDishes() {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BE_URI}/dishes`
      );
      setDishes(response.data);
      setFilteredDishes(response.data);
      setLoading(false);
    }
    console.log("Fetching dishes for mobile menu section");
    fetchDishes();
  }, []);

  const categories = Object.keys(DishCategories) as DishCategory[];

  const handleCategoryClick = (category: string) => {
    setActiveCategory(category);
    if (category === "all") {
      setFilteredDishes(dishes);
    } else {
      const filtered = dishes.filter((dish) => dish.category === category);
      console.log(dishes);
      console.log(`Filtered dishes for ${category}:`, filtered);
      setFilteredDishes(filtered);
    }
    setShowCategories(false);
  };

  const handleBackToCategories = () => {
    setShowCategories(true);
    setActiveCategory("all");
  };

  return (
    <section className="mb-24 px-2 py-4 min-h-[80vh]">
      {showCategories ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 animate-fade-in">
          {categories.map((category) => (
            <button
              key={category}
              className="flex flex-col h-full bg-white rounded-2xl shadow-md transition-all duration-200 hover:shadow-xl border border-[#f3e6e7] dark:border-[#355a35]"
              onClick={() => handleCategoryClick(category)}
              type="button"
              style={{ minHeight: 170 }}
            >
              <div className="w-full h-full aspect-square relative rounded-xl overflow-hidden flex items-center justify-center">
                <Image
                  src={`/images/webp/${
                    DishCategories[category as DishCategory].image
                  }`}
                  alt={DishCategories[category as DishCategory].label}
                  fill
                  className="object-scale-down drop-shadow-xl"
                  sizes="80vw"
                  priority={false}
                  loading="lazy"
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                />
              </div>
              <p className="text-[#191011] text-lg md:text-3xl font-extrabold leading-tight mb-1  w-full">
                {DishCategories[category as DishCategory].label}
              </p>
            </button>
          ))}
        </div>
      ) : (
        <div className="animate-fade-in">
          <div className="flex w-full justify-between items-center mb-4">
            <div className="flex w-full">
              <button
                className="px-5 py-2 rounded-full bg-[#994d51] text-white font-semibold shadow-lg hover:bg-[#7a3a3d] dark:bg-[#b7e8b4] dark:text-[#191011] dark:hover:bg-[#e8f3e7] transition"
                onClick={handleBackToCategories}
                type="button"
              >
                ← Torna alle categorie
              </button>
            </div>

            {/* Toggle visualizzazione */}
            <div className="flex items-center gap-3 ">
              <button
                className={`px-3 py-1 rounded-full text-sm font-semibold border transition flex items-center justify-center ${
                  viewMode === "card"
                    ? "bg-[#994d51] text-white border-[#994d51] dark:bg-[#b7e8b4] dark:text-[#191011] dark:border-[#b7e8b4]"
                    : "bg-white text-[#994d51] border-[#994d51] dark:bg-[#254025] dark:text-[#b7e8b4] dark:border-[#b7e8b4]"
                }`}
                onClick={() => setViewMode("card")}
                type="button"
                aria-label="Vista a schede"
              >
                {/* Icona griglia */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  fill="none"
                  viewBox="0 0 20 20"
                >
                  <rect
                    x="3"
                    y="3"
                    width="6"
                    height="6"
                    rx="2"
                    fill="currentColor"
                  />
                  <rect
                    x="11"
                    y="3"
                    width="6"
                    height="6"
                    rx="2"
                    fill="currentColor"
                  />
                  <rect
                    x="3"
                    y="11"
                    width="6"
                    height="6"
                    rx="2"
                    fill="currentColor"
                  />
                  <rect
                    x="11"
                    y="11"
                    width="6"
                    height="6"
                    rx="2"
                    fill="currentColor"
                  />
                </svg>
              </button>
              <button
                className={`px-3 py-1 rounded-full text-sm font-semibold border transition flex items-center justify-center ${
                  viewMode === "compact"
                    ? "bg-[#994d51] text-white border-[#994d51] dark:bg-[#b7e8b4] dark:text-[#191011] dark:border-[#b7e8b4]"
                    : "bg-white text-[#994d51] border-[#994d51] dark:bg-[#254025] dark:text-[#b7e8b4] dark:border-[#b7e8b4]"
                }`}
                onClick={() => setViewMode("compact")}
                type="button"
                aria-label="Vista compatta"
              >
                {/* Icona lista */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  fill="none"
                  viewBox="0 0 20 20"
                >
                  <rect
                    x="4"
                    y="5"
                    width="12"
                    height="2"
                    rx="1"
                    fill="currentColor"
                  />
                  <rect
                    x="4"
                    y="9"
                    width="12"
                    height="2"
                    rx="1"
                    fill="currentColor"
                  />
                  <rect
                    x="4"
                    y="13"
                    width="12"
                    height="2"
                    rx="1"
                    fill="currentColor"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            {filteredDishes.length === 0 ? (
              <p className="text-center text-gray-400 dark:text-gray-500 text-lg">
                Nessun piatto disponibile.
              </p>
            ) : viewMode === "card" ? (
              filteredDishes.map((dish) => (
                <div key={dish.id}>
                  <DishCard dish={dish} />
                </div>
              ))
            ) : (
              <div className="flex flex-col gap-2">
                {filteredDishes.map((dish) => (
                  <div
                    key={dish.id}
                    className="flex items-center bg-white rounded-xl border border-[#f1e9ea] px-3 py-2 shadow-sm dark:bg-[#254025] dark:border-[#355a35]"
                  >
                    <div className="relative w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden  mr-3">
                      <Image
                        src={`/images/webp/${dish.name}.webp`}
                        alt={dish.name}
                        fill
                        className="object-cover"
                        sizes="56px"
                        priority={false}
                        loading="lazy"
                        placeholder="blur"
                        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-[#191011] truncate dark:text-[#e8f3e7]">
                        {dish.name}
                      </div>
                      <div className="text-xs text-[#8b5b5d] truncate dark:text-[#b7e8b4]">
                        {dish.description}
                      </div>
                    </div>
                    <div className="flex flex-col items-end ml-3">
                      <div className="text-sm font-bold text-[#994d51] mb-1 dark:text-[#b7e8b4]">
                        {new Intl.NumberFormat("it-IT", {
                          style: "currency",
                          currency: "EUR",
                        }).format(dish.price)}
                      </div>
                      <button
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                          dish.available
                            ? "bg-[#e8b4b7] text-[#191011] hover:bg-[#f5e3e4] dark:bg-[#994d51] dark:text-white dark:hover:bg-[#7a3a3d]"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400"
                        }`}
                        onClick={() => {
                          // Check if dish is available before adding to cart
                          if (!dish.available) return;

                          // Aggiungi al carrello anche qui
                          if (typeof window !== "undefined") {
                            try {
                              const cartKey = "cart";
                              const currentCart = JSON.parse(
                                localStorage.getItem(cartKey) || "[]"
                              );
                              currentCart.push(dish);
                              localStorage.setItem(
                                cartKey,
                                JSON.stringify(currentCart)
                              );
                            } catch (e) {
                              // eslint-disable-next-line no-console
                              console.error(
                                "Errore nel salvataggio del carrello su localStorage",
                                e
                              );
                            }
                          }
                          if (
                            typeof window !== "undefined" &&
                            window.dispatchEvent
                          ) {
                            window.dispatchEvent(new Event("cart-updated"));
                          }
                        }}
                        disabled={!dish.available}
                        type="button"
                      >
                        {dish.available ? "Aggiungi" : "Non Disp."}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
