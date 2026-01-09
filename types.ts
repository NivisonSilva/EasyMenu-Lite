
export interface Business {
  id: string;
  slug: string;
  name: string;
  whatsapp: string;
  logoUrl?: string;
  bannerUrl?: string;
  description?: string;
  settings: {
    currency: string;
    deliveryFee: number;
    minOrderValue: number;
    serviceTax: number;
    isAutomaticOpen: boolean;
  };
  operationalHours: {
    [key: string]: { open: string; close: string; closed: boolean };
  };
}

export interface Variation {
  id: string;
  name: string;
  price: number;
  description?: string;
}

export interface Category {
  id: string;
  businessId: string;
  name: string;
  order: number;
  isActive: boolean;
}

export interface Product {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  isAvailable: boolean;
  isFeatured: boolean;
  variations: Variation[];
}

export interface CartItem extends Product {
  quantity: number;
  selectedVariation?: Variation;
  selectedOptions: {
    groupName: string;
    optionName: string;
    price: number;
  }[];
}

export interface StoreState {
  business: Business;
  categories: Category[];
  products: Product[];
}
