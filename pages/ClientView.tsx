
import React, { useState, useMemo, useRef } from 'react';
import { StoreState, Product, CartItem, Variation } from '../types';
import { formatCurrency, generateWhatsAppLink, isStoreOpen } from '../utils';
import { 
  Plus, Minus, X, ChevronRight, ShoppingBag
} from 'lucide-react';

interface ClientViewProps {
  storeData: StoreState;
}

const ClientView: React.FC<ClientViewProps> = ({ storeData }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariation, setSelectedVariation] = useState<Variation | null>(null);
  
  // Filtro de categorias e produtos ativos
  const activeCategories = useMemo(() => storeData.categories.filter(c => c.isActive), [storeData.categories]);
  const [activeCategoryId, setActiveCategoryId] = useState(activeCategories[0]?.id);
  
  const isOpen = useMemo(() => isStoreOpen(storeData.business), [storeData.business]);
  const categoryRefs = useRef<{ [key: string]: HTMLElement | null }>({});

  const cartCount = useMemo(() => cart.reduce((acc, item) => acc + item.quantity, 0), [cart]);
  const cartTotal = useMemo(() => cart.reduce((acc, item) => {
    const price = item.selectedVariation ? item.selectedVariation.price : item.price;
    return acc + (price * item.quantity);
  }, 0), [cart]);

  const handleAddToCart = () => {
    if (!selectedProduct) return;
    if (selectedProduct.variations.length > 0 && !selectedVariation) return;

    setCart(prev => {
      const existing = prev.find(item => 
        item.id === selectedProduct.id && 
        item.selectedVariation?.id === selectedVariation?.id
      );
      
      if (existing) {
        return prev.map(item => item === existing ? { ...item, quantity: item.quantity + 1 } : item);
      }
      
      return [...prev, { 
        ...selectedProduct, 
        quantity: 1, 
        selectedVariation: selectedVariation || undefined,
        selectedOptions: [] 
      }];
    });
    
    setSelectedProduct(null);
    setSelectedVariation(null);
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-zinc-950 text-white pb-40 relative shadow-2xl overflow-hidden font-inter">
      {/* Header Minimalista */}
      <header className="sticky top-0 z-40 bg-zinc-950/90 backdrop-blur-xl border-b border-zinc-900 p-8">
        <div className="flex items-center gap-5 mb-8">
          <div className="w-14 h-14 bg-zinc-900 rounded-2xl flex items-center justify-center overflow-hidden border border-zinc-800">
            {storeData.business.logoUrl ? <img src={storeData.business.logoUrl} className="w-full h-full object-cover" /> : <ShoppingBag className="text-yellow-400" />}
          </div>
          <div>
            <h1 className="text-2xl font-black">{storeData.business.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={`w-2 h-2 rounded-full animate-pulse ${isOpen ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span className={`text-[10px] font-black uppercase tracking-widest ${isOpen ? 'text-green-500' : 'text-red-500'}`}>
                {isOpen ? 'Aberto' : 'Fechado'}
              </span>
            </div>
          </div>
        </div>

        <nav className="flex overflow-x-auto hide-scrollbar gap-3">
          {activeCategories.map(cat => (
            <button key={cat.id} onClick={() => { 
                setActiveCategoryId(cat.id); 
                categoryRefs.current[cat.id]?.scrollIntoView({ behavior: 'smooth', block: 'start' }); 
              }}
              className={`whitespace-nowrap px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeCategoryId === cat.id ? 'bg-yellow-400 text-black' : 'bg-zinc-900 text-zinc-500'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </nav>
      </header>

      {/* Listagem de Itens */}
      <main className="px-8 mt-10 space-y-12">
        {activeCategories.map(category => (
          <section key={category.id} ref={el => { categoryRefs.current[category.id] = el; }} className="scroll-mt-40">
            <h3 className="text-xs font-black text-zinc-700 uppercase tracking-widest mb-6">{category.name}</h3>
            <div className="grid gap-10">
              {storeData.products
                .filter(p => p.categoryId === category.id && p.isAvailable)
                .map(product => (
                <div key={product.id} onClick={() => setSelectedProduct(product)} className="flex gap-6 group cursor-pointer animate-fade-in">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-white text-xl group-hover:text-yellow-400 transition-colors">{product.name}</h4>
                    <p className="text-sm text-zinc-500 font-medium leading-relaxed mt-1 line-clamp-2">{product.description}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="font-black text-white">
                        {product.variations.length > 0 
                          ? `A partir de ${formatCurrency(Math.min(...product.variations.map(v => v.price)))}`
                          : formatCurrency(product.price)
                        }
                      </span>
                      <div className="bg-zinc-900 p-2 rounded-xl text-yellow-400 border border-zinc-800"><Plus size={18} strokeWidth={4} /></div>
                    </div>
                  </div>
                  {product.imageUrl && (
                    <img src={product.imageUrl} className="w-24 h-24 object-cover rounded-[1.5rem] border border-zinc-900 shadow-xl" />
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}
        {activeCategories.length === 0 && (
          <div className="py-20 text-center text-zinc-600 font-bold uppercase tracking-widest text-sm">
            Nenhum item disponível no momento.
          </div>
        )}
      </main>

      {/* Modal Produto Complexo */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/90 backdrop-blur-md p-4">
          <div className="bg-zinc-900 w-full max-w-md rounded-[3.5rem] overflow-hidden animate-slide-up border border-zinc-800">
            {selectedProduct.imageUrl && <img src={selectedProduct.imageUrl} className="w-full h-56 object-cover" />}
            <div className="p-10 space-y-8">
              <div>
                <h2 className="text-3xl font-black text-white leading-tight">{selectedProduct.name}</h2>
                <p className="text-zinc-500 font-medium mt-2">{selectedProduct.description}</p>
              </div>

              {selectedProduct.variations.length > 0 && (
                <div className="space-y-4">
                  <span className="text-[10px] font-black uppercase text-zinc-600 tracking-widest">Selecione uma opção</span>
                  <div className="grid gap-3">
                    {selectedProduct.variations.map(v => (
                      <button key={v.id} onClick={() => setSelectedVariation(v)}
                        className={`flex justify-between items-center p-5 rounded-2xl border-2 transition-all ${
                          selectedVariation?.id === v.id ? 'border-yellow-400 bg-yellow-400/10' : 'border-zinc-800 bg-zinc-800/30 text-zinc-400'
                        }`}
                      >
                        <span className="font-bold">{v.name}</span>
                        <span className="font-black text-white">{formatCurrency(v.price)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <button disabled={!isOpen || (selectedProduct.variations.length > 0 && !selectedVariation)} 
                  onClick={handleAddToCart}
                  className="flex-1 bg-yellow-400 text-black py-6 rounded-[2rem] font-black text-xl disabled:bg-zinc-800 disabled:text-zinc-600 transition-all shadow-xl active:scale-95"
                >
                  Adicionar • {formatCurrency(selectedVariation ? selectedVariation.price : selectedProduct.price)}
                </button>
                <button onClick={() => { setSelectedProduct(null); setSelectedVariation(null); }} className="p-6 bg-zinc-800 rounded-[2rem] text-zinc-500 hover:text-white"><X /></button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Botão Flutuante Carrinho */}
      {cartCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-6 z-50">
           <button onClick={() => setIsCartOpen(true)} className="w-full bg-yellow-400 text-black rounded-[2.5rem] py-6 px-10 flex items-center justify-between shadow-[0_20px_50px_rgba(250,204,21,0.3)] animate-slide-up">
              <span className="font-black text-lg">{cartCount} {cartCount === 1 ? 'item' : 'itens'}</span>
              <span className="font-black text-2xl">{formatCurrency(cartTotal)}</span>
           </button>
        </div>
      )}

      {/* Carrinho / Sacola */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[110] bg-black/95 backdrop-blur-2xl animate-fade-in">
           <div className="absolute inset-y-0 right-0 w-full max-w-md bg-zinc-950 flex flex-col border-l border-zinc-900 shadow-2xl">
              <div className="p-10 flex justify-between items-center border-b border-zinc-900">
                <h2 className="text-3xl font-black">Sacola <span className="text-yellow-400">Digital</span></h2>
                <button onClick={() => setIsCartOpen(false)} className="p-4 bg-zinc-900 rounded-full border border-zinc-800"><X /></button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-10 space-y-10">
                {cart.map((item, idx) => (
                  <div key={idx} className="flex gap-6 animate-fade-in">
                    <div className="flex-1">
                      <h4 className="font-bold text-white text-lg">{item.name}</h4>
                      {item.selectedVariation && <p className="text-xs text-yellow-400 font-bold uppercase tracking-wider">{item.selectedVariation.name}</p>}
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-3 bg-zinc-900 p-2 rounded-xl border border-zinc-800">
                          <button className="p-1" onClick={() => {
                             setCart(prev => {
                               const existing = prev[idx];
                               if (existing.quantity > 1) return prev.map((it, i) => i === idx ? {...it, quantity: it.quantity - 1} : it);
                               return prev.filter((_, i) => i !== idx);
                             });
                          }}><Minus size={16} /></button>
                          <span className="font-black text-white w-6 text-center">{item.quantity}</span>
                          <button className="p-1" onClick={() => {
                             setCart(prev => prev.map((it, i) => i === idx ? {...it, quantity: it.quantity + 1} : it));
                          }}><Plus size={16} /></button>
                        </div>
                        <span className="font-black text-xl">{formatCurrency((item.selectedVariation?.price || item.price) * item.quantity)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-10 bg-zinc-900/50 space-y-8 border-t border-zinc-900">
                <div className="flex justify-between items-end font-black">
                  <span className="text-zinc-500 uppercase text-[10px] tracking-widest">Total com entrega</span>
                  <span className="text-4xl text-white">{formatCurrency(cartTotal + storeData.business.settings.deliveryFee)}</span>
                </div>
                <button onClick={() => window.open(generateWhatsAppLink(storeData.business, cart, cartTotal), '_blank')}
                  className="w-full bg-yellow-400 text-black py-7 rounded-[2.5rem] font-black text-xl shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                  Confirmar Pedido 🚀
                </button>
              </div>
           </div>
        </div>
      )}

      <style>{`
        @keyframes slide-up { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-slide-up { animation: slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </div>
  );
};

export default ClientView;
