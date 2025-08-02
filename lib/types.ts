export interface Dish {
  id: string;
  name: string;
  description: string;
  price: number;
  category: DishCategory;
  image: string;
  available: boolean;
}

export const DishCategories = {
  SFIZI: {
    value: "sfizi",
    label: "Sfizi",
    image: "sfizi.webp",
  },
  PRIMI: {
    value: "primi",
    label: "Primi Piatti e Antichi Sapori",
    image: "primi.webp",
  },
  PIZZE_FRITTE: {
    value: "pizze fritte",
    label: "Pizze Fritte",
    image: "Pizza Fritta.webp",
  },
  PORCHETTA: {
    value: "porchetta",
    label: "Porchetta",
    image: "Porchetta.webp",
  },
  ARROSTI: {
    value: "arrosti",
    label: "Arrosti",
    image: "Arrosto di maiale.webp",
  },
  FRUTTA_DOLCI: {
    value: "frutta e dolci",
    label: "Frutta e Dolci",
    image: "Anguria.webp",
  },
  BIBITE: {
    value: "bibite",
    label: "Bibite",
    image: "Coca Cola.webp",
  },
  VINI: {
    value: "vini (bottiglia)",
    label: "Vini (bottiglia)",
    image: "vino.webp",
  },
  BIRRE: {
    value: "birre",
    label: "Birre",
    image: "birra.webp",
  },
} as const;

export type DishCategory = keyof typeof DishCategories;

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  code: string;
  name: string;
}

export enum OrderStatus {
  DA_PAGARE = "da pagare",
  PAGATO = "pagato",
  ANNULLATO = "annullato",
}

export const OrderStatusLabels = {
  [OrderStatus.DA_PAGARE]: "Da Pagare",
  [OrderStatus.PAGATO]: "Pagato",
  [OrderStatus.ANNULLATO]: "Annullato",
};

export const OrderStatusColors = {
  [OrderStatus.DA_PAGARE]: "bg-amber-500",
  [OrderStatus.PAGATO]: "bg-green-500",
  [OrderStatus.ANNULLATO]: "bg-red-500",
};
