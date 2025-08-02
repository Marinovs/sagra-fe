"use client";

import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
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
} from "./ui/alert-dialog";
// Update the import path if the file is in a different location, e.g.:
import { useToast } from "../hooks/use-toast";
import { useState } from "react";
import axios from "axios";
import { useCart } from "../lib/cart-context";
import { Button } from "./ui/button";

export function CartSummary(props: { items?: any[] }) {
  // Usa items dalla prop se presente, altrimenti dal context
  const context = useCart();
  const items = props.items ?? context.items;
  const total =
    props.items && props.items.length > 0
      ? props.items.reduce(
          (sum, item) => sum + item.price * (item.quantity ?? 1),
          0
        )
      : context.total;
  const clearCart = () => {
    context.clearCart();
    if (typeof window !== "undefined") {
      localStorage.setItem("cart", "[]");
    }
  };
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  if (!items || items.length === 0) {
    return null;
  }

  const formattedTotal = new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(total);

  const handleConfirmOrder = async () => {
    try {
      // Create order object
      const order = {
        items: [...items],
        name,
      };

      // Send order to backend
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BE_URI}/orders`,
        order
      );

      if (response.status !== 201) {
        throw new Error("Failed to confirm order");
      }

      const data = await response.data;

      // Clear the cart
      clearCart();

      // Show success toast
      toast({
        title: "Ordine confermato!",
        description: `Il tuo ordine #${data.id} è stato ricevuto.`,
      });

      // Redirect to receipt page
      router.push(`/receipt/${data.id}`);
    } catch (error) {
      console.error("Error confirming order:", error);
      toast({
        title: "Errore",
        description: "Non è stato possibile confermare l'ordine. Riprova.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Riepilogo Ordine</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pb-8">
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>
                {item.name} x{item.quantity}
              </span>
              <span>
                {new Intl.NumberFormat("it-IT", {
                  style: "currency",
                  currency: "EUR",
                }).format(item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>
        <div className="border-t pt-4">
          <div className="flex justify-between font-medium">
            <span>Totale</span>
            <span>{formattedTotal}</span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Il pagamento avverrà alla cassa al momento del ritiro
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button className="w-full">Conferma Ordine</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Conferma il tuo ordine</AlertDialogTitle>
              <AlertDialogDescription>
                {"Inserisci il tuo nome per completare l'ordine."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-4 px-4">
              <input
                type="text"
                placeholder="Nome"
                value={name}
                required
                onChange={(e) => setName(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Annulla</AlertDialogCancel>
              <AlertDialogAction disabled={!name} onClick={handleConfirmOrder}>
                Conferma
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Button variant="outline" className="w-full" onClick={clearCart}>
          Svuota Carrello
        </Button>
      </CardFooter>
    </Card>
  );
}
