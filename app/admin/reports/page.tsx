"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dish,
  DishCategories,
  DishCategory,
  Order,
  OrderStatus,
} from "@/lib/types";
import axios from "axios";
import { it } from "date-fns/locale";
import { format } from "date-fns";

export default function AdminReportsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [mounted, setMounted] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd")
  );

  useEffect(() => setMounted(true), []);

  const getOrders = async () => {
    const resp = await axios.get(process.env.NEXT_PUBLIC_BE_URI + "/orders", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    setOrders(resp.data);
  };

  const getDishes = async () => {
    const resp = await axios.get(process.env.NEXT_PUBLIC_BE_URI + "/dishes");
    setDishes(resp.data);
  };

  useEffect(() => {
    if (!mounted) return;
    getOrders();
    getDishes();
    const interval = setInterval(getOrders, 5000);
    return () => clearInterval(interval);
  }, [mounted]);

  const ordersForDay = useMemo(() => {
    return orders.filter(
      (o) => format(new Date(o.createdAt), "yyyy-MM-dd") === selectedDate
    );
  }, [orders, selectedDate]);

  const perDish = useMemo(() => {
    const totals = new Map<string, { qty: number; revenue: number }>();
    const details = new Map<
      string,
      Array<{
        orderId: string;
        code: string;
        name: string;
        qty: number;
        time: string;
        status: OrderStatus;
      }>
    >();
    for (const order of ordersForDay) {
      if (order.status === OrderStatus.ANNULLATO) continue;
      for (const item of order.items) {
        const tPrev = totals.get(item.id) || { qty: 0, revenue: 0 };
        totals.set(item.id, {
          qty: tPrev.qty + item.quantity,
          revenue: tPrev.revenue + item.price * item.quantity,
        });
        const list = details.get(item.id) || [];
        list.push({
          orderId: order.id,
          code: order.code,
          name: order.name,
          qty: item.quantity,
          time: format(new Date(order.createdAt), "HH:mm"),
          status: order.status,
        });
        details.set(item.id, list);
      }
    }
    return Array.from(totals.entries())
      .map(([id, v]) => ({
        id,
        name: dishes.find((d) => d.id === id)?.name || id,
        qty: v.qty,
        revenue: v.revenue,
        lines: (details.get(id) || []).sort((a, b) =>
          a.time.localeCompare(b.time)
        ),
      }))
      .sort((a, b) => b.qty - a.qty);
  }, [ordersForDay, dishes]);

  const perCategory = useMemo(() => {
    const totals = new Map<string, { qty: number; revenue: number }>();
    const byDish = new Map<
      string,
      Map<string, { name: string; qty: number; revenue: number }>
    >();
    for (const order of ordersForDay) {
      if (order.status === OrderStatus.ANNULLATO) continue;
      for (const item of order.items) {
        const dish = dishes.find((d) => d.id === item.id);
        if (!dish) continue;
        const cat = dish.category;
        const tPrev = totals.get(cat) || { qty: 0, revenue: 0 };
        totals.set(cat, {
          qty: tPrev.qty + item.quantity,
          revenue: tPrev.revenue + item.price * item.quantity,
        });

        const catMap = byDish.get(cat) || new Map();
        const dPrev = catMap.get(item.id) || {
          name: dish.name,
          qty: 0,
          revenue: 0,
        };
        catMap.set(item.id, {
          name: dish.name,
          qty: dPrev.qty + item.quantity,
          revenue: dPrev.revenue + item.price * item.quantity,
        });
        byDish.set(cat, catMap);
      }
    }
    return Array.from(totals.entries())
      .map(([cat, v]) => ({
        category: cat as DishCategory,
        label: DishCategories[cat as DishCategory]?.label || cat,
        qty: v.qty,
        revenue: v.revenue,
        dishes: Array.from((byDish.get(cat) || new Map()).values()).sort(
          (a, b) => b.qty - a.qty
        ),
      }))
      .sort((a, b) => b.qty - a.qty);
  }, [ordersForDay, dishes]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR",
    }).format(amount || 0);

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Report Giornalieri
        </h1>
        <p className="text-muted-foreground">
          Ordini per piatto e per categoria in una data specifica
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div>
          <label className="text-sm text-muted-foreground">Giorno</label>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-[220px]"
          />
        </div>
        <Badge variant="secondary">
          {ordersForDay.length} ordini in data{" "}
          {format(new Date(selectedDate), "d MMM yyyy", { locale: it })}
        </Badge>
      </div>

      <Tabs defaultValue="dish" className="space-y-6">
        <TabsList>
          <TabsTrigger value="dish">Per Piatto</TabsTrigger>
          <TabsTrigger value="category">Per Categoria</TabsTrigger>
        </TabsList>

        <TabsContent value="dish">
          <Card>
            <CardHeader>
              <CardTitle>Ordini per Piatto</CardTitle>
            </CardHeader>
            <CardContent>
              {perDish.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  Nessun ordine per questo giorno.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {perDish.map((d) => (
                    <div key={d.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold truncate">{d.name}</div>
                        <Badge variant="outline">x{d.qty}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Ricavo: {formatCurrency(d.revenue)}
                      </div>
                      <details className="mt-2">
                        <summary className="cursor-pointer text-sm text-blue-600">
                          Dettagli ordini
                        </summary>
                        <div className="mt-2 space-y-1 text-sm">
                          {d.lines.map((ln, i) => (
                            <div
                              key={`${d.id}-${ln.orderId}-${i}`}
                              className="flex justify-between"
                            >
                              <span className="truncate mr-2">
                                {ln.time} • #{ln.code} • {ln.name}
                              </span>
                              <span className="text-muted-foreground">
                                x{ln.qty}
                              </span>
                            </div>
                          ))}
                        </div>
                      </details>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="category">
          <Card>
            <CardHeader>
              <CardTitle>Ordini per Categoria</CardTitle>
            </CardHeader>
            <CardContent>
              {perCategory.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  Nessun ordine per questo giorno.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {perCategory.map((c) => (
                    <div key={c.category} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold">{c.label}</div>
                        <Badge variant="outline">x{c.qty}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Ricavo: {formatCurrency(c.revenue)}
                      </div>
                      <details className="mt-2">
                        <summary className="cursor-pointer text-sm text-blue-600">
                          Dettaglio piatti
                        </summary>
                        <div className="mt-2 space-y-1 text-sm">
                          {c.dishes.map((d, i) => (
                            <div
                              key={`${c.category}-${d.name}-${i}`}
                              className="flex justify-between"
                            >
                              <span className="truncate mr-2">{d.name}</span>
                              <span className="text-muted-foreground">
                                x{d.qty}
                              </span>
                            </div>
                          ))}
                        </div>
                      </details>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
