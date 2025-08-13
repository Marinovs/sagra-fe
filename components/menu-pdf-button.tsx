"use client";

import { useState } from "react";
import jsPDF from "jspdf";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Dish, DishCategories, DishCategory } from "@/lib/types";
import { Download } from "lucide-react";

export function MenuPdfButton() {
  const [loading, setLoading] = useState(false);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR",
    }).format(amount);

  const fetchDishes = async (): Promise<Dish[]> => {
    const res = await axios.get(`${process.env.NEXT_PUBLIC_BE_URI}/dishes`);
    return res.data as Dish[];
  };

  const generatePdf = async () => {
    try {
      setLoading(true);
      const dishes = await fetchDishes();

      const doc = new jsPDF({ unit: "mm", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 12;
      let y = margin + 10;

      // Header
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("Sagra degli Antichi Sapori", pageWidth / 2, margin, {
        align: "center",
      });
      doc.setFontSize(14);
      doc.text("Menu", pageWidth / 2, margin + 7, { align: "center" });

      // Date
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      const now = new Date();
      const dateStr = now.toLocaleDateString("it-IT", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      doc.text(`Aggiornato al ${dateStr}`, pageWidth - margin, margin, {
        align: "right",
      });

      y = margin + 18;

      const addPageIfNeeded = (nextY: number) => {
        if (nextY > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
      };

      const categories = Object.keys(DishCategories) as DishCategory[];
      for (const cat of categories) {
        const items = dishes.filter((d) => d.category === cat);
        if (items.length === 0) continue;

        // Category header
        addPageIfNeeded(y + 8);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        doc.text(DishCategories[cat].label, margin, y);
        y += 5;
        doc.setDrawColor(150);
        doc.setLineWidth(0.3);
        doc.line(margin, y, pageWidth - margin, y);
        y += 4;

        // Items
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        for (const dish of items) {
          const lineHeight = 6;
          const name = dish.name;
          const price = formatCurrency(dish.price);

          addPageIfNeeded(y + lineHeight);

          // Name left, price right
          doc.text(name, margin, y);
          doc.text(price, pageWidth - margin, y, { align: "right" });
          y += lineHeight;
        }
        y += 2;
      }

      doc.save("menu.pdf");
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("Errore nella generazione del PDF del menu", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={generatePdf}
      disabled={loading}
      variant="outline"
      size="lg"
      className="text-lg px-8 py-4 font-semibold mt-4 ml-0 sm:ml-3"
    >
      <Download className="h-5 w-5 mr-2" />
      {loading ? "Preparazione..." : "Scarica Menu (PDF)"}
    </Button>
  );
}
