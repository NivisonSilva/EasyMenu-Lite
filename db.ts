
import { StoreState, Business } from './types';

const STORAGE_KEY = 'easymenu_premium_v3_db';

const defaultBusiness: Business = {
  id: 'b1',
  slug: 'meu-cardapio',
  name: 'Nova Loja',
  whatsapp: '',
  description: 'Bem-vindo!',
  logoUrl: '',
  settings: {
    currency: 'R$',
    deliveryFee: 0,
    minOrderValue: 0,
    serviceTax: 0,
    isAutomaticOpen: true,
  },
  operationalHours: {
    segunda: { open: '09:00', close: '18:00', closed: false },
    terca: { open: '09:00', close: '18:00', closed: false },
    quarta: { open: '09:00', close: '18:00', closed: false },
    quinta: { open: '09:00', close: '18:00', closed: false },
    sexta: { open: '09:00', close: '18:00', closed: false },
    sabado: { open: '09:00', close: '22:00', closed: false },
    domingo: { open: '09:00', close: '18:00', closed: true },
  }
};

export const getStoreData = (): StoreState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Garantir que a estrutura básica exista
      return {
        business: parsed.business || defaultBusiness,
        categories: parsed.categories || [],
        products: parsed.products || []
      };
    }
  } catch (e) {
    console.error("Erro ao ler banco local:", e);
  }
  
  const initialState: StoreState = {
    business: defaultBusiness,
    categories: [],
    products: []
  };
  saveStoreData(initialState);
  return initialState;
};

export const saveStoreData = (state: StoreState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};
