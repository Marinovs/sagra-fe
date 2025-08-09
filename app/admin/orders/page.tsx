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
  Calendar,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Printer,
  X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import axios from "axios";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<string>(OrderStatus.DA_PAGARE); // Default tab
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
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

  const handlePrintOrder = async (order: Order) => {
    try {
      toast({
        title: "Stampa in corso...",
        description: "Invio ordine alla stampante...",
      });

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BE_URI}/orders/${order.id}/print`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      toast({
        title: "Stampa completata",
        description: `Ordine #${order.code} inviato alla stampante con successo`,
      });
    } catch (error) {
      console.error("Errore durante la stampa:", error);
      toast({
        title: "Errore stampa",
        description: "Non è stato possibile stampare l'ordine. Riprova.",
        variant: "destructive",
      });
    }
  };

  // Filter and sort orders
  let filteredOrders = [...orders];

  // Filter by status
  if (activeTab !== "all") {
    filteredOrders = filteredOrders.filter(
      (order) => order.status === activeTab
    );
  }

  // Filter by selected dates or date range
  if (selectedDates.length > 0) {
    filteredOrders = filteredOrders.filter((order) => {
      const orderDate = format(new Date(order.createdAt), "yyyy-MM-dd");
      return selectedDates.includes(orderDate);
    });
  } else if (startDate || endDate) {
    filteredOrders = filteredOrders.filter((order) => {
      const orderDate = format(new Date(order.createdAt), "yyyy-MM-dd");
      const isAfterStart = !startDate || orderDate >= startDate;
      const isBeforeEnd = !endDate || orderDate <= endDate;
      return isAfterStart && isBeforeEnd;
    });
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

  // Get unique dates from orders
  const getAvailableDates = () => {
    const dates = orders.map((order) =>
      format(new Date(order.createdAt), "yyyy-MM-dd")
    );
    return [...new Set(dates)].sort().reverse(); // Most recent first
  };

  // Add/remove date from selected dates
  const toggleDateSelection = (date: string) => {
    setSelectedDates((prev) =>
      prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date]
    );
  };

  // Clear all date filters
  const clearDateFilters = () => {
    setSelectedDates([]);
    setStartDate("");
    setEndDate("");
  };

  // Apply date range filter
  const applyDateRange = () => {
    if (startDate || endDate) {
      setSelectedDates([]); // Clear individual date selections when using range
    }
  };

  // Handle single date selection
  const selectSingleDate = (date: string) => {
    setSelectedDates([date]);
    setStartDate("");
    setEndDate("");
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
        <div className="flex-grow space-y-4">
          {/* Date Range Selector */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Data inizio:
              </label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Data fine:
              </label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Azioni:
              </label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={applyDateRange}
                  disabled={!startDate && !endDate}
                >
                  Applica Periodo
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearDateFilters}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4 mr-1" />
                  Pulisci
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Date Selection */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">
              Selezione rapida (giorni con ordini):
            </div>
            <div className="flex flex-wrap gap-2">
              {getAvailableDates().map((date) => {
                const isSelected = selectedDates.includes(date);
                const orderCount = orders.filter(
                  (order) =>
                    format(new Date(order.createdAt), "yyyy-MM-dd") === date
                ).length;

                return (
                  <Button
                    key={date}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => selectSingleDate(date)}
                    className="flex items-center gap-2"
                  >
                    {format(new Date(date), "d MMM yyyy", { locale: it })}
                    <Badge variant="secondary" className="ml-1">
                      {orderCount}
                    </Badge>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Active Filters Display */}
          {(selectedDates.length > 0 || startDate || endDate) && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm text-muted-foreground">
                Filtri attivi:
              </span>
              {selectedDates.length > 0 && (
                <Badge variant="outline">
                  Giorno:{" "}
                  {format(new Date(selectedDates[0]), "d MMM yyyy", {
                    locale: it,
                  })}
                </Badge>
              )}
              {startDate && (
                <Badge variant="outline">
                  Da:{" "}
                  {format(new Date(startDate), "d MMM yyyy", { locale: it })}
                </Badge>
              )}
              {endDate && (
                <Badge variant="outline">
                  A: {format(new Date(endDate), "d MMM yyyy", { locale: it })}
                </Badge>
              )}
            </div>
          )}
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

                      {order.status === OrderStatus.PAGATO && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePrintOrder(order)}
                          className="flex items-center gap-2"
                        >
                          <Printer className="h-4 w-4" />
                          Stampa
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
