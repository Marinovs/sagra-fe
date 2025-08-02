"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { NavBar } from "@/components/nav-bar";
import { Footer } from "@/components/footer";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Receipt, ArrowLeft, Printer } from "lucide-react";
import Link from "next/link";
import { Order } from "@/lib/types";
import { Separator } from "@/components/ui/separator";
import axios from "axios";
import { notFound } from "next/navigation";
import jsPDF from "jspdf";
import React from "react";
import { MobileFooter } from "@/components/mobile-footer";

export default function ReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Unwrap params using React.use()
  const resolvedParams = React.use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchOrder() {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BE_URI}/orders/${resolvedParams.id}`
        );
        const data = await response.data;
        if (!data || Object.keys(data).length === 0) {
          setOrder(null);
        } else {
          setOrder(data);
        }
      } catch (error) {
        console.log("Error fetching order:", error);
        setOrder(null);
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [resolvedParams.id, router]);

  if (loading) {
    return null;
  }

  if (!order) {
    if (typeof window !== "undefined") {
      notFound();
    }
    return null;
  }

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    const doc = new jsPDF();

    // Background gradient simulation (draw colored rectangles)
    doc.setFillColor(255, 248, 230); // yellow-50
    doc.rect(0, 0, 210, 297, "F");
    doc.setFillColor(255, 237, 213); // orange-50
    doc.rect(0, 0, 210, 60, "F");
    doc.setFillColor(255, 251, 235); // yellow-100
    doc.rect(0, 237, 210, 60, "F");

    // Header
    doc.setFont("helvetica", "bold");
    doc.setTextColor(234, 88, 12); // orange-700
    doc.setFontSize(22);
    doc.text("Scontrino Digitale", 105, 22, { align: "center" });

    // Subtitle
    doc.setFontSize(13);
    doc.setTextColor(251, 146, 60); // orange-400
    doc.setFont("helvetica", "normal");
    doc.text("Sagra Antichi Sapori", 105, 30, { align: "center" });

    // Order code
    doc.setDrawColor(251, 146, 60); // orange-400
    doc.setLineWidth(0.7);
    // Dashed rectangles are not natively supported in jsPDF, so we use a solid border instead
    doc.rect(60, 38, 90, 14, "D");
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(234, 88, 12); // orange-700
    doc.text(`#${order.code}`, 105, 48, { align: "center" });

    // Codice Ordine label
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120, 53, 15); // muted-foreground
    doc.text("Codice Ordine", 105, 36, { align: "center" });

    // Nome
    if (order.name) {
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(234, 88, 12); // orange-700
      doc.text(order.name, 105, 60, { align: "center" });
    }

    // Data e Ora
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120, 53, 15); // muted-foreground
    doc.text("Data e Ora:", 20, 72);
    doc.setTextColor(71, 85, 105); // slate-600
    doc.text(formattedDate, 45, 72);

    // Separator
    doc.setDrawColor(253, 186, 116); // orange-200
    doc.setLineWidth(0.5);
    doc.line(20, 76, 190, 76);

    // Items
    let y = 84;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(234, 88, 12); // orange-700
    doc.text("Prodotto", 20, y);
    doc.text("Quantità", 100, y, { align: "center" });
    doc.text("Totale", 190, y, { align: "right" });

    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105); // slate-600

    order.items.forEach((item) => {
      doc.text(item.name, 20, y);
      doc.text(`x${item.quantity}`, 100, y, { align: "center" });
      doc.setTextColor(234, 88, 12); // orange-700
      doc.text(
        new Intl.NumberFormat("it-IT", {
          style: "currency",
          currency: "EUR",
        }).format(item.price * item.quantity),
        190,
        y,
        { align: "right" }
      );
      doc.setTextColor(71, 85, 105); // reset for next
      y += 6;
    });

    // Separator
    y += 2;
    doc.setDrawColor(253, 186, 116); // orange-200
    doc.line(20, y, 190, y);

    // Totale
    y += 10;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(194, 65, 12); // orange-800
    doc.text("Totale", 20, y);
    doc.text(formattedTotal, 190, y, { align: "right" });

    // Footer
    y += 16;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(234, 88, 12); // orange-700
    doc.text("Mostra questo codice alla cassa per il pagamento", 105, y, {
      align: "center",
    });
    y += 7;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(120, 53, 15); // muted-foreground

    doc.save(`scontrino_${order.code}.pdf`);
  };

  const formattedDate = new Date(order.createdAt).toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const formattedTotal = new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(order.total);

  return (
    <main className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-yellow-100 dark:from-[#181112] dark:via-[#1b0e0e] dark:to-[#181112] flex flex-col">
      <div className="print:hidden">
        <NavBar />
      </div>

      <div className="container mx-auto px-4 py-8 flex-grow print:py-0 flex flex-col items-center pb-48">
        <div className="w-full max-w-md mx-auto">
          <Card className="border-2 border-orange-300 dark:border-[#2d181a] shadow-xl rounded-xl print:border-black print:shadow-none bg-white/90 dark:bg-[#3c2d2f]/90">
            <CardHeader className="text-center border-b pb-6 bg-gradient-to-r from-orange-100 to-yellow-50 dark:from-[#231415] dark:to-[#1b0e0e] rounded-t-xl dark:border-[#2d181a]">
              <div className="flex justify-center mb-2">
                <Receipt className="h-12 w-12 text-orange-500 dark:text-white" />
              </div>
              <CardTitle className="text-3xl font-extrabold text-orange-700 dark:text-white drop-shadow">
                Scontrino Digitale
              </CardTitle>
              <CardDescription className="text-orange-600 dark:text-[#f3e7e8] font-medium">
                Sagra Antichi Sapori
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6 pt-6">
              <div className="text-center">
                <div className="text-2xl font-extrabold border-2 border-dashed border-orange-400 dark:border-[#e8b4b7] py-3 px-6 inline-block bg-orange-50 dark:bg-[#231415] rounded-lg shadow-sm text-orange-700 dark:text-white">
                  #{order.code}
                </div>
                <p className="text-sm text-muted-foreground mt-2 tracking-wide">
                  Codice Ordine
                </p>
                {order.name && (
                  <p className="mt-2 text-base font-semibold text-orange-700 dark:text-white">
                    {order.name}
                  </p>
                )}
              </div>

              <div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Data e Ora</span>
                  <span>{formattedDate}</span>
                </div>
              </div>

              <Separator className="bg-orange-200 dark:bg-[#2d181a]" />

              <div className="space-y-2">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-1 border-b border-orange-100 dark:border-[#2d181a] pb-3 mb-2"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-semibold text-orange-700 dark:text-white">
                          {item.name}
                        </span>
                        <span className="text-muted-foreground ml-2">
                          x{item.quantity}
                        </span>
                      </div>
                      <span className="font-medium text-orange-600 dark:text-white">
                        {new Intl.NumberFormat("it-IT", {
                          style: "currency",
                          currency: "EUR",
                        }).format(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="bg-orange-200 dark:bg-[#2d181a]" />

              <div className="flex justify-between font-bold text-xl text-orange-800 dark:text-white">
                <span>Totale</span>
                <span>{formattedTotal}</span>
              </div>
            </CardContent>

            <CardFooter className="flex-col space-y-4 border-t border-orange-100 dark:border-[#2d181a] pt-6 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-[#231415] dark:to-[#1b0e0e] rounded-b-xl">
              <p className="text-center text-base text-orange-700 dark:text-white font-semibold">
                <strong>
                  Mostra questo codice alla cassa per il pagamento
                </strong>
              </p>

              <Button
                variant="outline"
                className="w-full print:hidden flex items-center border-orange-400 dark:border-[#e8b4b7] text-orange-700 dark:text-white hover:bg-orange-100 dark:hover:bg-[#231415]"
                onClick={handleDownloadPdf}
              >
                <Printer className="h-4 w-4 mr-2" />
                Scarica Scontrino
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      <div className="block sm:hidden">
        <MobileFooter />
      </div>
      <div className="hidden sm:block">
        <Footer />
      </div>
    </main>
  );
}
