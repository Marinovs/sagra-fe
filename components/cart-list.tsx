"use client";

import Image from "next/image";
import { Card, CardContent } from "./ui/card";
import { Trash, Minus, Plus } from "lucide-react";
import { useCart } from "../lib/cart-context";
import { Button } from "./ui/button";

export function CartList() {
  const { items, updateQuantity, removeItem } = useCart();

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const formattedPrice = new Intl.NumberFormat("it-IT", {
          style: "currency",
          currency: "EUR",
        }).format(item.price);

        const formattedTotal = new Intl.NumberFormat("it-IT", {
          style: "currency",
          currency: "EUR",
        }).format(item.price * item.quantity);

        return (
          <Card key={item.id} className="overflow-hidden card">
            <CardContent className="p-0">
              <div className="flex flex-row items-start">
                <div className="relative w-24 h-24 flex-shrink-0">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-3 flex-1">
                  <div className="mb-2">
                    <h3 className="font-playfair font-medium text-lg leading-tight">
                      {item.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {formattedPrice}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="font-medium">{formattedTotal}</div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
