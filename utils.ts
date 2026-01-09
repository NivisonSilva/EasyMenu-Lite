
import { CartItem, Business } from './types';

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const isStoreOpen = (business: Business): boolean => {
  if (!business.settings.isAutomaticOpen) return true;
  
  const now = new Date();
  const days = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
  const dayName = days[now.getDay()];
  const hours = business.operationalHours[dayName];
  
  if (!hours || hours.closed) return false;
  
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  return currentTime >= hours.open && currentTime <= hours.close;
};

export const generateWhatsAppLink = (business: Business, cart: CartItem[], total: number): string => {
  const phone = business.whatsapp.replace(/\D/g, '');
  const itemsText = cart
    .map(item => {
      const variationName = item.selectedVariation ? ` (${item.selectedVariation.name})` : '';
      const price = item.selectedVariation ? item.selectedVariation.price : item.price;
      return `*${item.quantity}x ${item.name}${variationName}* - ${formatCurrency(price * item.quantity)}`;
    })
    .join('\n');

  const deliveryInfo = business.settings.deliveryFee > 0 
    ? `\nTaxa de Entrega: ${formatCurrency(business.settings.deliveryFee)}` 
    : '\nEntrega Grátis';

  const message = `🚀 *NOVO PEDIDO*\n\n${itemsText}\n\n---${deliveryInfo}\n*Total Final: ${formatCurrency(total + business.settings.deliveryFee)}*`;
  
  return `https://wa.me/55${phone}?text=${encodeURIComponent(message)}`;
};

export const generateQRCodeUrl = (slug: string): string => {
  const baseUrl = window.location.origin + window.location.pathname;
  const fullUrl = `${baseUrl}#/m/${slug}`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(fullUrl)}`;
};
