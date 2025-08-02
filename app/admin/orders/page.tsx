"use client";

import { useState, useEffect } from "react";
import {
  Order,
  OrderStatus,
  OrderStatusLabels,
  OrderStatusColors,
} from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  Calendar,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import axios from "axios";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<string>(OrderStatus.DA_PAGARE); // Default tab
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<string>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const { toast } = useToast();

  // Move getDishes outside useEffect
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
      console.error("Error fetching dishes:", error);
    }
  };

  // Set mounted flag after first render
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch dishes only after mounted is true
  useEffect(() => {
    if (mounted) {
      getOrders();
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

  const handleUpdateStatus = (orderId: string, newStatus: OrderStatus) => {
    const updatedOrders = orders.map((order) =>
      order.id === orderId
        ? {
            ...order,
            status: newStatus,
            updatedAt: new Date().toISOString(),
          }
        : order
    );

    axios
      .patch(
        `${process.env.NEXT_PUBLIC_BE_URI}/orders/${orderId}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
      .then(() => {
        toast({
          title: "Stato aggiornato",
          description: `Ordine #${orderId} aggiornato a ${OrderStatusLabels[newStatus]}`,
        });
      })
      .catch((error) => {
        toast({
          title: "Errore",
          description: "Non è stato possibile aggiornare l'ordine. Riprova.",
          variant: "destructive",
        });
      });

    setOrders(updatedOrders);
  };

  // Filter and sort orders
  let filteredOrders = [...orders];

  // Filter by status
  if (activeTab !== "all") {
    filteredOrders = filteredOrders.filter(
      (order) => order.status === activeTab
    );
  }

  // Filter by search query
  if (searchQuery) {
    filteredOrders = filteredOrders.filter(
      (order) =>
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.items.some((item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
    );
  }

  // Sort orders
  filteredOrders.sort((a, b) => {
    let comparison = 0;

    if (sortField === "createdAt") {
      comparison =
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else if (sortField === "total") {
      comparison = a.total - b.total;
    } else if (sortField === "items") {
      const totalItemsA = a.items.reduce((sum, item) => sum + item.quantity, 0);
      const totalItemsB = b.items.reduce((sum, item) => sum + item.quantity, 0);
      comparison = totalItemsA - totalItemsB;
    }

    return sortDirection === "asc" ? comparison : -comparison;
  });

  const toggleSortDirection = () => {
    setSortDirection(sortDirection === "asc" ? "desc" : "asc");
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "d MMM yyyy, HH:mm", { locale: it });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestione Ordini</h1>
        <p className="text-muted-foreground">
          Visualizza e gestisci gli ordini ricevuti
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cerca ordini per ID o piatto..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex gap-2">
          <Select value={sortField} onValueChange={setSortField}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Ordina per" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt">Data</SelectItem>
              <SelectItem value="total">Totale</SelectItem>
              <SelectItem value="items">N° Piatti</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon" onClick={toggleSortDirection}>
            {sortDirection === "asc" ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList>
          <TabsTrigger value="all">
            Tutti
            <Badge variant="secondary" className="ml-2">
              {orders.length}
            </Badge>
          </TabsTrigger>
          {Object.values(OrderStatus).map((status) => {
            const count = orders.filter(
              (order) => order.status === status
            ).length;
            return (
              <TabsTrigger key={status} value={status}>
                {OrderStatusLabels[status]}
                <Badge variant="secondary" className="ml-2">
                  {count}
                </Badge>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <Card key={order.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-lg flex items-center">
                        Ordine #{order.code} di {order.name}
                        <Badge
                          className={`ml-2 ${OrderStatusColors[order.status]}`}
                        >
                          {OrderStatusLabels[order.status]}
                        </Badge>
                      </CardTitle>
                      <div className="flex items-center text-sm text-muted-foreground space-x-2 mt-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(order.createdAt)}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {order.status === OrderStatus.DA_PAGARE && (
                        <Button
                          className="bg-green-500 text-white hover:bg-green-600"
                          size="sm"
                          onClick={() =>
                            handleUpdateStatus(order.id, OrderStatus.PAGATO)
                          }
                        >
                          Segna come Pagato
                        </Button>
                      )}

                      {order.status === OrderStatus.DA_PAGARE && (
                        <Button
                          className="bg-red-500 text-white hover:bg-red-600"
                          size="sm"
                          onClick={() =>
                            handleUpdateStatus(order.id, OrderStatus.ANNULLATO)
                          }
                        >
                          Annulla
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div
                        key={`${order.id}-${item.id}-${index}`}
                        className="flex justify-between py-1 border-b last:border-0"
                      >
                        <span>
                          {item.name}{" "}
                          <span className="text-muted-foreground">
                            x{item.quantity}
                          </span>
                        </span>
                        <span>
                          {formatCurrency(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}

                    <div className="flex justify-between font-medium pt-2">
                      <span>Totale</span>
                      <span>{formatCurrency(order.total)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Nessun ordine trovato. Gli ordini appariranno qui quando i
                clienti effettueranno degli ordini.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
