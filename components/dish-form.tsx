"use client";

import { useState } from "react";
import { Dish, DishCategories, DishCategory } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import axios from "axios";
import Image from "next/image";

interface DishFormProps {
  dish?: Dish;
  onSave: (dish: Dish) => void;
}

export function DishForm({ dish, onSave }: DishFormProps) {
  const [formData, setFormData] = useState<Dish>({
    id: dish?.id || "",
    name: dish?.name || "",
    description: dish?.description || "",
    price: dish?.price || 0,
    category: dish?.category!,
    image: dish?.image || "",
    available: dish?.available ?? true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Il nome è obbligatorio";
    }

    if (formData.price <= 0) {
      newErrors.price = "Il prezzo deve essere maggiore di zero";
    }

    if (!formData.image.trim()) {
      newErrors.image = "L'URL dell'immagine è obbligatorio";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSave(formData);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    setFormData({
      ...formData,
      [name]: type === "number" ? parseFloat(value) : value,
    });

    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome Piatto</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={errors.name ? "border-destructive" : ""}
          />
          {errors.name && (
            <p className="text-destructive text-sm">{errors.name}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">Prezzo (€)</Label>
          <Input
            id="price"
            name="price"
            type="number"
            step="0.01"
            value={formData.price}
            onChange={handleChange}
            className={errors.price ? "border-destructive" : ""}
          />
          {errors.price && (
            <p className="text-destructive text-sm">{errors.price}</p>
          )}
        </div>
      </div>

      {/* <div className="space-y-2">
        <Label htmlFor="description">Descrizione</Label>
        <Textarea
          id="description"
          name="description"
          rows={3}
          value={formData.description}
          onChange={handleChange}
          className={errors.description ? "border-destructive" : ""}
        />
        {errors.description && (
          <p className="text-destructive text-sm">{errors.description}</p>
        )}
      </div> */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Categoria</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => {
              console.log("Selected category:", value);
              setFormData({ ...formData, category: value as DishCategory });
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleziona categoria" />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(DishCategories).map((category) => (
                <SelectItem key={category} value={category}>
                  {DishCategories[category as DishCategory].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="image">URL Immagine</Label>
          <Input
            id="image"
            name="image"
            value={formData.image}
            onChange={handleChange}
            className={errors.image ? "border-destructive" : ""}
          />
          {errors.image && (
            <p className="text-destructive text-sm">{errors.image}</p>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="available"
          checked={formData.available}
          onCheckedChange={(checked) =>
            setFormData({ ...formData, available: checked })
          }
        />
        <Label htmlFor="available">Disponibile</Label>
      </div>

      {formData.image && (
        <div className="space-y-2">
          <Label>Anteprima Immagine</Label>
          <div className="w-full flex justify-center border rounded-md overflow-hidden h-40 relative">
            <Image
              width={160}
              height={160}
              src={formData.image}
              alt="Anteprima"
            />
          </div>
        </div>
      )}

      <div className="flex justify-end pt-4">
        <Button type="submit">
          {dish ? "Aggiorna Piatto" : "Aggiungi Piatto"}
        </Button>
      </div>
    </form>
  );
}
