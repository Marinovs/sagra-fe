"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Dish, DishCategories, DishCategory } from "@/lib/types";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { DishForm } from "@/components/dish-form";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import axios from "axios";

export default function AdminDishesPage() {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  // Move getDishes outside useEffect
  const getDishes = async () => {
    try {
      const resp = await axios.get(process.env.NEXT_PUBLIC_BE_URI + "/dishes");
      setDishes(resp.data);
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
      getDishes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("dishes", JSON.stringify(dishes));
    }
  }, [dishes, mounted]);

  // Reset alla pagina 1 quando si cerca
  useEffect(() => {
    if (searchQuery) {
      setPage(1);
    }
  }, [searchQuery]);

  if (!mounted) {
    return null;
  }

  const handleSaveDish = async (dish: Dish) => {
    if (editingDish) {
      // Update existing dish
      axios
        .put(`${process.env.NEXT_PUBLIC_BE_URI}/dishes/${dish.id}`, dish, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
        .then(() => {
          setDishes(dishes.map((d) => (d.id === dish.id ? dish : d)));
          setEditDialogOpen(false); // Close edit dialog
          toast({
            title: "Piatto aggiornato",
            description: `${dish.name} è stato aggiornato con successo.`,
          });
        })
        .catch((error) => {
          toast({
            title: "Errore",
            description: "Non è stato possibile aggiornare il piatto. Riprova.",
            variant: "destructive",
          });
        });
    } else {
      console.log("Adding new dish:", dish);
      await axios
        .post(`${process.env.NEXT_PUBLIC_BE_URI}/dishes`, dish, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
        .then((response) => {
          setDishes([...dishes, dish]);
          setAddDialogOpen(false); // Close add dialog
          toast({
            title: "Piatto aggiunto",
            description: `${dish.name} è stato aggiunto con successo.`,
          });
        });
    }
    setEditingDish(null);
  };

  const handleDeleteDish = (id: string) => {
    axios
      .delete(`${process.env.NEXT_PUBLIC_BE_URI}/dishes/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then(() => {
        setDishes(dishes.filter((dish) => dish.id !== id));
        toast({
          title: "Piatto eliminato",
          description: "Il piatto è stato eliminato con successo.",
        });
      })
      .catch((error) => {
        toast({
          title: "Errore",
          description: "Non è stato possibile eliminare il piatto. Riprova.",
          variant: "destructive",
        });
      });
  };

  const handleToggleAvailability = (id: string, available: boolean) => {
    axios
      .put(
        `${process.env.NEXT_PUBLIC_BE_URI}/dishes/${id}`,
        { available },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
      .then(() => {
        toast({
          title: "Disponibilità aggiornata",
          description: `La disponibilità del piatto è stata aggiornata con successo.`,
        });
      })
      .catch((error) => {
        toast({
          title: "Errore",
          description:
            "Non è stato possibile aggiornare la disponibilità del piatto.",
          variant: "destructive",
        });
      });

    setDishes(
      dishes.map((dish) => (dish.id === id ? { ...dish, available } : dish))
    );

    const dish = dishes.find((d) => d.id === id);
    toast({
      title: available ? "Piatto disponibile" : "Piatto non disponibile",
      description: `${dish?.name} è ora ${
        available ? "disponibile" : "non disponibile"
      }.`,
    });
  };

  // Filter dishes based on search query and category
  const filteredDishes = dishes.filter((dish) => {
    const matchesSearch =
      dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dish.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  // Paginazione - se c'è una ricerca attiva, mostra tutti i risultati
  const pageCount = searchQuery
    ? 1
    : Math.ceil(filteredDishes.length / itemsPerPage);
  const paginatedDishes = searchQuery
    ? filteredDishes
    : filteredDishes.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestione Piatti</h1>
          <p className="text-muted-foreground">
            Aggiungi, modifica o elimina piatti dal menu
          </p>
        </div>

        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nuovo Piatto
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogTitle className="text-lg font-semibold leading-none tracking-tight mb-4">
              Aggiungi Nuovo Piatto
            </DialogTitle>
            <DishForm onSave={handleSaveDish} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cerca piatti..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(val) => {
            setActiveTab(val);
            setPage(1); // resetta la pagina quando si cambia categoria
          }}
          className="w-full sm:w-auto"
        >
          <TabsList className="flex flex-wrap gap-2 bg-muted p-2 rounded-lg shadow-sm">
            <TabsTrigger
              value="all"
              className={`text-xs px-3 py-1 rounded-full transition-colors ${
                activeTab === "all"
                  ? "bg-primary text-primary-foreground shadow"
                  : "bg-background hover:bg-accent"
              }`}
            >
              Tutti
            </TabsTrigger>
            {Object.entries(DishCategories).map(([category, catObj]) => (
              <TabsTrigger
                key={category}
                value={category}
                className={`text-xs px-3 py-1 rounded-full transition-colors flex items-center gap-1 ${
                  activeTab === category
                    ? "bg-primary text-primary-foreground shadow"
                    : "bg-background hover:bg-accent"
                }`}
              >
                {/* Se vuoi aggiungere un'icona per categoria, puoi farlo qui */}
                {/* <span>{catObj.icon}</span> */}
                {catObj.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {paginatedDishes.map((dish) => (
          <Card key={dish.id} className={dish.available ? "" : "opacity-60"}>
            <div className="flex flex-col w-full justify-center items-center">
              <div className="flex w-full h-fit justify-end p-2">
                <div className="bg-primary text-primary-foreground text-sm font-medium py-1 px-2 rounded">
                  {formatCurrency(dish.price)}
                </div>
              </div>
              <Image
                src={`/images/webp/${dish.name}.webp`}
                alt={dish.name}
                width={300}
                height={300}
              />
            </div>

            <CardHeader className="p-4 pb-0">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">{dish.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {DishCategories[dish.category]?.label}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Label htmlFor={`available-${dish.id}`} className="text-xs">
                    {dish.available ? "Disponibile" : "Non disponibile"}
                  </Label>
                  <Switch
                    id={`available-${dish.id}`}
                    checked={dish.available}
                    onCheckedChange={(checked) =>
                      handleToggleAvailability(dish.id, checked)
                    }
                  />
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4">
              <p className="text-sm">{dish.description}</p>
            </CardContent>

            <CardFooter className="p-4 pt-0 flex justify-between">
              <Dialog
                open={editDialogOpen && editingDish?.id === dish.id}
                onOpenChange={(open) => {
                  setEditDialogOpen(open);
                  if (!open) setEditingDish(null);
                }}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingDish(dish);
                      setEditDialogOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Modifica
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogTitle className="text-lg font-semibold leading-none tracking-tight mb-4">
                    Modifica Piatto
                  </DialogTitle>
                  {editingDish && editingDish.id === dish.id && (
                    <DishForm dish={editingDish} onSave={handleSaveDish} />
                  )}
                </DialogContent>
              </Dialog>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Elimina
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Conferma eliminazione</AlertDialogTitle>
                    <AlertDialogDescription>
                      Sei sicuro di voler eliminare {dish.name}? Questa azione
                      non può essere annullata.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annulla</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDeleteDish(dish.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Elimina
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardFooter>
          </Card>
        ))}

        {filteredDishes.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">
              Nessun piatto trovato. Prova a modificare i filtri o aggiungi un
              nuovo piatto.
            </p>
          </div>
        )}
      </div>

      {/* Controlli paginazione */}
      {pageCount > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4">
          <button
            className="px-3 py-1 rounded border text-sm disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            &lt; Precedente
          </button>
          <span className="mx-2 text-sm">
            Pagina {page} di {pageCount}
          </span>
          <button
            className="px-3 py-1 rounded border text-sm disabled:opacity-50"
            onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
            disabled={page === pageCount}
          >
            Successiva &gt;
          </button>
        </div>
      )}
    </div>
  );
}
