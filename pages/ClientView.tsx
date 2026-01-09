
import React, { useState, useMemo, useRef } from 'react';
import { StoreState, Product, CartItem, Variation, SelectedOption } from '../types';
import { formatCurrency, generateWhatsAppLink, isStoreOpen } from '../utils';
import { 
  Plus, Minus, X, ShoppingBag, Check
} from 'lucide-react';

interface ClientViewProps {
  storeData: StoreState;
}

const ClientView: React.FC<ClientViewProps> = ({ storeData }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [tempSelectedVariation, setTempSelectedVariation] = useState<Variation | null>(null);
  const [tempSelectedOptions, setTempSelectedOptions] = useState<SelectedOption[]>([]);
  
  const activeCategories = useMemo(() => storeData.categories.filter(c => c.isActive), [storeData.categories]);
  const [activeCategoryId, setActiveCategoryId] = useState(activeCategories[0]?.id);
  
  const isOpen = useMemo(() => isStoreOpen(storeData.business), [storeData.business]);
  const categoryRefs = useRef<{ [key: string]: HTMLElement | null }>({});

  const cartCount = useMemo(() => cart.reduce((acc, item) => acc + item.quantity, 0), [cart]);
  const cartTotal = useMemo(() => cart.reduce((acc, item) => {
    let price = item.selectedVariation ? item.selectedVariation.price : item.price;
    price += item.selectedOptions.reduce((a, c) => a + c.price, 0);
    return acc + (price * item.quantity);
  }, 0), [cart]);

  const toggleOption = (groupId: string, groupName: string, optionId: string, optionName: string, price: number, maxChoices: number) => {
    const currentGroupSelections = tempSelectedOptions.filter(o => o.groupId === groupId);
    const isSelected = tempSelectedOptions.some(o => o.optionId === optionId);

    if (isSelected) {
      setTempSelectedOptions(prev => prev.filter(o => o.optionId !== optionId));
    } else {
      if (currentGroupSelections.length < maxChoices) {
        setTempSelectedOptions(prev => [...prev, { groupId, groupName, optionId, optionName, price }]);
      }
    }
  };

  const handleAddToCart = () => {
    if (!selectedProduct) return;
    
    // Validar se mínimos foram atingidos
    const missingMin = selectedProduct.optionGroups.some(g => {
      const selections = tempSelectedOptions.filter(o => o.groupId === g.id).length;
      return selections < g.minChoices;
    });

    if (missingMin) {
      alert("Por favor, selecione a quantidade mínima de sabores/opções.");
      return;
    }

    setCart(prev => {
      // Para itens com opções/sabores, tratamos como itens únicos no carrinho
      return [...prev, { 
        ...selectedProduct, 
        id: selectedProduct.id + '-' + Date.now(), // ID único para cada config de sabores
        quantity: 1, 
        selectedVariation: tempSelectedVariation || undefined,
        selectedOptions: [...tempSelectedOptions] 
      }];
    });
    
    setSelectedProduct(null);
    setTempSelectedVariation(null);
    setTempSelectedOptions([]);
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-zinc-950 text-white pb-40 relative shadow-2xl overflow-hidden font-inter">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-zinc-950/90 backdrop-blur-xl border-b border-zinc-900 p-8">
        <div className="flex items-center gap-5 mb-8">
          <div className="w-14 h-14 bg-zinc-900 rounded-2xl flex items-center justify-center overflow-hidden border border-zinc-800">
            {storeData.business.logoUrl ? <img src={storeData.business.logoUrl} className="w-full h-full object-cover" /> : <ShoppingBag className="text-yellow-400" />}
          </div>
          <div>
            <h1 className="text-2xl font-black">{storeData.business.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={`w-2 h-2 rounded-full ${isOpen ? 'bg-green-500' : 'bg-red-500'}`}></span>
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

      {/* Itens */}
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
                      <span className="font-black text-white">{formatCurrency(product.price)}</span>
                      <div className="bg-zinc-900 p-2 rounded-xl text-yellow-400 border border-zinc-800"><Plus size={18} strokeWidth={4} /></div>
                    </div>
                  </div>
                  {product.imageUrl && (
                    <img src={product.imageUrl} className="w-24 h-24 object-cover rounded-[1.5rem] border border-zinc-900" />
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>

      {/* Modal Pastel (Complexo) */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/90 backdrop-blur-md p-4">
          <div className="bg-zinc-900 w-full max-w-md rounded-[3.5rem] overflow-hidden animate-slide-up border border-zinc-800 flex flex-col max-h-[90vh]">
            <div className="overflow-y-auto flex-1">
              {selectedProduct.imageUrl && <img src={selectedProduct.imageUrl} className="w-full h-56 object-cover" />}
              <div className="p-10 space-y-10">
                <div>
                  <h2 className="text-3xl font-black text-white">{selectedProduct.name}</h2>
                  <p className="text-zinc-500 font-medium mt-2">{selectedProduct.description}</p>
                </div>

                {selectedProduct.optionGroups.map(group => (
                  <div key={group.id} className="space-y-6">
                    <div className="flex justify-between items-end">
                      <h4 className="text-[10px] font-black uppercase text-zinc-600 tracking-widest">{group.name}</h4>
                      <span className="text-[10px] font-black text-yellow-400">
                        {tempSelectedOptions.filter(o => o.groupId === group.id).length} / {group.maxChoices}
                      </span>
                    </div>
                    <div className="grid gap-3">
                      {group.options.map(opt => {
                        const isSelected = tempSelectedOptions.some(o => o.optionId === opt.id);
                        return (
                          <button key={opt.id} 
                            onClick={() => toggleOption(group.id, group.name, opt.id, opt.name, opt.price, group.maxChoices)}
                            className={`flex justify-between items-center p-5 rounded-2xl border-2 transition-all ${
                              isSelected ? 'border-yellow-400 bg-yellow-400/10' : 'border-zinc-800 bg-zinc-800/30 text-zinc-500'
                            }`}
                          >
                            <span className="font-bold flex items-center gap-3">
                              {isSelected && <Check size={18} className="text-yellow-400" />}
                              {opt.name}
                            </span>
                            {opt.price > 0 && <span className="text-xs font-black">+ {formatCurrency(opt.price)}</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-10 bg-zinc-900/80 border-t border-zinc-800 flex gap-4">
              <button onClick={handleAddToCart}
                className="flex-1 bg-yellow-400 text-black py-6 rounded-[2rem] font-black text-xl shadow-xl"
              >
                Adicionar • {formatCurrency(selectedProduct.price + tempSelectedOptions.reduce((a,c) => a + c.price, 0))}
              </button>
              <button onClick={() => { setSelectedProduct(null); setTempSelectedOptions([]); }} className="p-6 bg-zinc-800 rounded-[2rem] text-zinc-500"><X /></button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Cart */}
      {cartCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-6 z-50">
           <button onClick={() => setIsCartOpen(true)} className="w-full bg-yellow-400 text-black rounded-[2.5rem] py-6 px-10 flex items-center justify-between shadow-2xl">
              <span className="font-black text-lg">{cartCount} Itens</span>
              <span className="font-black text-2xl">{formatCurrency(cartTotal)}</span>
           </button>
        </div>
      )}

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[110] bg-black/95 backdrop-blur-xl animate-fade-in">
           <div className="absolute inset-y-0 right-0 w-full max-w-md bg-zinc-950 flex flex-col border-l border-zinc-900">
              <div className="p-10 flex justify-between items-center border-b border-zinc-900">
                <h2 className="text-3xl font-black">Minha <span className="text-yellow-400">Sacola</span></h2>
                <button onClick={() => setIsCartOpen(false)} className="p-4 bg-zinc-900 rounded-full"><X /></button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-10 space-y-10">
                {cart.map((item, idx) => (
                  <div key={idx} className="flex gap-6 animate-fade-in">
                    <div className="flex-1">
                      <h4 className="font-bold text-white text-lg">{item.name}</h4>
                      {item.selectedOptions.length > 0 && (
                        <p className="text-xs text-zinc-500 mt-1">Sabores: {item.selectedOptions.map(o => o.optionName).join(', ')}</p>
                      )}
                      <div className="mt-4 flex items-center justify-between">
                        <button className="text-red-500 text-[10px] font-black uppercase tracking-widest" onClick={() => setCart(prev => prev.filter((_, i) => i !== idx))}>Remover</button>
                        <span className="font-black text-xl">
                          {formatCurrency((item.price + item.selectedOptions.reduce((a,c) => a + c.price, 0)) * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-10 bg-zinc-900 space-y-8">
                <div className="flex justify-between items-end font-black">
                  <span className="text-zinc-500 uppercase text-[10px]">Total do Pedido</span>
                  <span className="text-4xl text-white">{formatCurrency(cartTotal + storeData.business.settings.deliveryFee)}</span>
                </div>
                <button onClick={() => window.open(generateWhatsAppLink(storeData.business, cart, cartTotal), '_blank')}
                  className="w-full bg-yellow-400 text-black py-7 rounded-[2.5rem] font-black text-xl shadow-xl active:scale-95 transition-all"
                >
                  Finalizar no WhatsApp 🚀
                </button>
              </div>
           </div>
        </div>
      )}

      <style>{`
        @keyframes slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .animate-slide-up { animation: slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </div>
  );
};

export default ClientView;
