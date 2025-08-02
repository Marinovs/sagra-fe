"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { DishCategories, DishCategory, Dish } from "@/lib/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import axios from "axios";

// Dynamic import for DishCard
const DishCard = dynamic(
  () =>
    import("@/components/dish-card").then((mod) => ({ default: mod.DishCard })),
  {
    loading: () => (
      <div className="h-48 bg-gray-100 animate-pulse rounded-lg"></div>
    ),
  }
);

export function MenuSection() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Prevent double fetch in React 18 StrictMode (dev only)
    if (typeof window !== "undefined" && (window as any).__menu_section_fetched)
      return;
    if (typeof window !== "undefined")
      (window as any).__menu_section_fetched = true;

    let cancelled = false;
    async function fetchDishes() {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BE_URI}/dishes`
        );
        if (!cancelled) {
          setDishes(response.data);
          setLoading(false);
        }
      } catch (error) {
        if (!cancelled) console.error("Error fetching dishes:", error);
      }
    }
    fetchDishes();
    return () => {
      cancelled = true;
    };
  }, []);

  const categories = Object.keys(DishCategories) as DishCategory[];

  const filteredDishes =
    activeCategory === "all"
      ? dishes
      : dishes.filter((dish) => dish.category === activeCategory);

  if (loading) {
    return <p className="text-center">Caricamento...</p>;
  }

  return (
    <section className="mb-16">
      <h2 className="text-3xl font-playfair font-bold tracking-tight mb-8 text-center px-4">
        Il Nostro Menu
      </h2>

      <Tabs
        defaultValue="all"
        className="w-full"
        onValueChange={setActiveCategory}
      >
        <div className="px-0 sm:px-4 mb-8">
          <ScrollArea className="w-full whitespace-nowrap">
            <TabsList className="flex flex-col sm:grid sm:grid-cols-3 h-fit gap-2 sm:gap-0 overflow-x-auto sm:overflow-x-visible">
              <TabsTrigger value="all" className="text-sm px-4 min-w-[100px]">
                Tutti
              </TabsTrigger>
              {categories.map((category) => (
                <TabsTrigger
                  key={category}
                  value={category}
                  className="text-sm px-4 min-w-[100px]"
                >
                  {DishCategories[category].label}
                </TabsTrigger>
              ))}
            </TabsList>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>

        <TabsContent value="all" className="space-y-8 px-2 sm:px-4">
          {categories.map((category) => {
            const dishesInCategory = dishes.filter(
              (dish) => dish.category === category
            );
            if (dishesInCategory.length === 0) return null;

            return (
              <div key={category} className="mb-12">
                <h3 className="text-2xl font-playfair font-bold mb-6 border-b-2 pb-2">
                  {DishCategories[category].label}
                </h3>
                <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {dishesInCategory.map((dish) => (
                    <DishCard key={dish.id} dish={dish} />
                  ))}
                </div>
              </div>
            );
          })}
        </TabsContent>

        {categories.map((category) => (
          <TabsContent key={category} value={category} className="px-2 sm:px-4">
            <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDishes.map((dish) => (
                <DishCard key={dish.id} dish={dish} />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </section>
  );
}
