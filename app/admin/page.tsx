"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CircleDollarSign,
  UtensilsCrossed,
  ClipboardList,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { Dish, Order, OrderStatus } from "@/lib/types";
import { AreaChart, XAxis, YAxis, Tooltip, Area } from "recharts";
import axios from "axios";
import { useRouter } from "next/navigation";

// Toast component (puoi sostituire con una libreria come sonner o shadcn/toast)
function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className="fixed top-4 right-4 z-50 bg-red-600 text-white px-4 py-2 rounded shadow">
      {message}
    </div>
  );
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [mounted, setMounted] = useState(false);
  const [timeRange, setTimeRange] = useState("today");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  // Controllo autenticazione
  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      setError("Non sei autenticato. Effettua il login.");
      setTimeout(() => router.replace("/login"), 2000);
    }
  }, [router]);

  // Move getDishes outside useEffect
  const getDishes = async () => {
    try {
      const resp = await axios.get(process.env.NEXT_PUBLIC_BE_URI + "/dishes");
      setDishes(resp.data);
    } catch (error) {
      setError("Errore nel recupero dei piatti.");
    }
  };

  // Move getOrders outside useEffect
  const getOrders = async () => {
    try {
      const resp = await axios.get(process.env.NEXT_PUBLIC_BE_URI + "/orders", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setOrders(resp.data);
      localStorage.setItem("dishes", JSON.stringify(resp.data));
    } catch (error) {
      setError("Errore nel recupero degli ordini.");
    }
  };

  // Set mounted flag after first render
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch dishes only after mounted is true
  useEffect(() => {
    if (mounted) {
      setLoading(true);
      Promise.all([getOrders(), getDishes()]).finally(() => setLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  // Auto-refresh orders every 3 seconds
  useEffect(() => {
    if (!mounted) return;
    const interval = setInterval(() => {
      getOrders();
    }, 3000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("orders", JSON.stringify(orders));
    }
  }, [orders, mounted]);

  if (!mounted) {
    return null;
  }

  // Loading spinner
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="animate-spin h-12 w-12 text-muted-foreground" />
      </div>
    );
  }

  // Error feedback
  if (error) {
    return (
      <>
        <Toast message={error} onClose={() => setError(null)} />
        <div className="flex items-center justify-center h-96">
          <div className="text-red-600 font-bold">{error}</div>
        </div>
      </>
    );
  }

  // Filter orders based on time range
  const filteredOrders = orders.filter((order) => {
    if (timeRange === "all") return true;
    const orderDate = new Date(order.createdAt);
    const now = new Date();
    switch (timeRange) {
      case "today":
        return orderDate.toDateString() === now.toDateString();
      case "week":
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        return orderDate >= weekAgo;
      case "month":
        const monthAgo = new Date();
        monthAgo.setMonth(now.getMonth() - 1);
        return orderDate >= monthAgo;
      default:
        return true;
    }
  });
  console.log(filteredOrders);

  // Calculate statistics
  const totalRevenue = filteredOrders
    .filter((x) => x.status === OrderStatus.PAGATO)
    .reduce((sum, order) => sum + order.total, 0);
  const orderCount = filteredOrders.length;
  const completedOrders = filteredOrders.filter(
    (order) => order.status === OrderStatus.PAGATO
  ).length;

  // Calculate most ordered dish
  const dishCounts: Record<string, number> = {};

  filteredOrders.forEach((order) => {
    order.items.forEach((item) => {
      dishCounts[item.id] = (dishCounts[item.id] || 0) + item.quantity;
    });
  });

  let mostOrderedDishId = "";
  let maxCount = 0;

  Object.entries(dishCounts).forEach(([dishId, count]) => {
    if (count > maxCount) {
      mostOrderedDishId = dishId;
      maxCount = count;
    }
  });

  const mostOrderedDish = dishes.find(
    (dish) => dish.id === mostOrderedDishId
  ) || {
    name: "Nessun piatto",
    quantity: 0,
  };

  // Generate chart data for orders by hour
  const hourlyOrderData = Array(24).fill(0);

  filteredOrders.forEach((order) => {
    const hour = new Date(order.createdAt).getHours();
    hourlyOrderData[hour]++;
  });

  const chartData = hourlyOrderData.map((count, hour) => ({
    hour: `${hour}:00`,
    count,
  }));

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  // Statistiche aggiuntive

  // Ordine più costoso
  const mostExpensiveOrder = filteredOrders
    .filter((order) => order.status === OrderStatus.PAGATO)
    .reduce(
      (max, order) => (order.total > (max?.total ?? 0) ? order : max),
      null as Order | null
    );

  // Ordine medio per cliente
  const ordersByCustomer: Record<string, Order[]> = {};
  filteredOrders.forEach((order) => {
    if (!order.name) return;
    if (!ordersByCustomer[order.name]) ordersByCustomer[order.name] = [];
    ordersByCustomer[order.name].push(order);
  });
  const avgOrderPerCustomer =
    Object.values(ordersByCustomer).length > 0
      ? (
          filteredOrders.length / Object.values(ordersByCustomer).length
        ).toFixed(2)
      : "N/A";

  // Ora di picco degli ordini
  const peakHour =
    chartData.reduce((max, cur) => (cur.count > max.count ? cur : max), {
      hour: "",
      count: 0,
    }).hour || "N/A";

  // Cliente con più ordini
  let topCustomerId = "";
  let topCustomerCount = 0;
  Object.entries(ordersByCustomer).forEach(([customerId, orders]) => {
    if (orders.length > topCustomerCount) {
      topCustomerId = customerId;
      topCustomerCount = orders.length;
    }
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Panoramica delle vendite e delle statistiche
        </p>
      </div>

      <Tabs
        defaultValue="today"
        className="space-y-4"
        value={timeRange}
        onValueChange={setTimeRange}
      >
        <TabsList>
          <TabsTrigger value="all">Tutti</TabsTrigger>
          <TabsTrigger value="today">Oggi</TabsTrigger>
          <TabsTrigger value="week">Ultima Settimana</TabsTrigger>
          <TabsTrigger value="month">Ultimo Mese</TabsTrigger>
        </TabsList>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Ricavo Totale
              </CardTitle>
              <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(totalRevenue)}
              </div>
              <p className="text-xs text-muted-foreground">
                {filteredOrders.length} ordini totali
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ordini</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orderCount}</div>
              <p className="text-xs text-muted-foreground">
                {completedOrders} completati
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Piatto Più Ordinato
              </CardTitle>
              <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div
                className="text-2xl font-bold truncate"
                title={mostOrderedDish.name}
              >
                {mostOrderedDish.name !== "Nessun piatto"
                  ? mostOrderedDish.name
                  : "N/A"}
              </div>
              <p className="text-xs text-muted-foreground">
                {maxCount > 0 ? `${maxCount} ordinati` : "Nessun dato"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Media per Ordine
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {orderCount > 0
                  ? formatCurrency(totalRevenue / orderCount)
                  : formatCurrency(0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Valore medio degli ordini
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Nuove statistiche */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Ordine più costoso
              </CardTitle>
              <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mostExpensiveOrder
                  ? formatCurrency(mostExpensiveOrder.total)
                  : "N/A"}
              </div>
              <p className="text-xs text-muted-foreground">
                {mostExpensiveOrder
                  ? `ID: ${mostExpensiveOrder.id}`
                  : "Nessun ordine"}
              </p>
              {/* Collapsable dettagli ordine */}
              {mostExpensiveOrder && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm text-blue-600">
                    Mostra dettagli ordine
                  </summary>
                  <div className="mt-2 text-xs space-y-1">
                    <div>
                      <strong>Cliente:</strong>{" "}
                      {mostExpensiveOrder.name || "N/A"}
                    </div>
                    <div>
                      <strong>Stato:</strong> {mostExpensiveOrder.status}
                    </div>
                    <div>
                      <strong>Creato il:</strong>{" "}
                      {new Date(mostExpensiveOrder.createdAt).toLocaleString()}
                    </div>
                    <div>
                      <strong>Totale:</strong>{" "}
                      {formatCurrency(mostExpensiveOrder.total)}
                    </div>
                    <div>
                      <strong>Piatti:</strong>
                      <ul className="ml-4 list-disc">
                        {mostExpensiveOrder.items.map((item, idx) => {
                          const dish = dishes.find((d) => d.id === item.id);
                          return (
                            <li key={idx}>
                              {dish ? dish.name : item.id} x {item.quantity}{" "}
                              {dish && dish.price
                                ? `(${formatCurrency(dish.price)} cad)`
                                : ""}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                </details>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Ordini medi per cliente
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgOrderPerCustomer}</div>
              <p className="text-xs text-muted-foreground">
                Clienti unici: {Object.keys(ordersByCustomer).length}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Ora di picco
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{peakHour}</div>
              <p className="text-xs text-muted-foreground">
                Fascia oraria con più ordini
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cliente top</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {topCustomerId ? topCustomerId : "N/A"}
              </div>
              <p className="text-xs text-muted-foreground">
                {topCustomerId ? `${topCustomerCount} ordini` : "Nessun dato"}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Andamento Ordini</CardTitle>
              <CardDescription>
                Numero di ordini per fascia oraria
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <div style={{ width: "100%", height: 320 }}>
                <AreaChart
                  width={600}
                  height={300}
                  data={chartData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#8884d8"
                    fill="#8884d8"
                  />
                </AreaChart>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Stato Ordini</CardTitle>
              <CardDescription>
                Distribuzione degli ordini per stato
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {Object.values(OrderStatus).map((status) => {
                  const count = filteredOrders.filter(
                    (o) => o.status === status
                  ).length;
                  const percentage =
                    orderCount > 0 ? Math.round((count / orderCount) * 100) : 0;

                  return (
                    <div key={status} className="flex items-center">
                      <div className="space-y-1 flex-1">
                        <p className="text-sm font-medium leading-none">
                          {status === OrderStatus.DA_PAGARE
                            ? "Da Pagare"
                            : status === OrderStatus.PAGATO
                            ? "Pronti"
                            : "Annullati"}
                        </p>
                        <div className="flex items-center text-sm text-muted-foreground">
                          {count} ordini
                        </div>
                      </div>
                      <div className="ml-auto font-medium">{percentage}%</div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </Tabs>
    </div>
  );
}
