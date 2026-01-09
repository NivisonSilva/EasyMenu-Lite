
import React, { useState } from 'react';
// @ts-ignore
import { useNavigate } from 'react-router-dom';
import { StoreState, Product, Category, Variation } from '../types';
import { saveStoreData } from '../db';
import { formatCurrency, generateQRCodeUrl } from '../utils';
import { 
  Plus, Trash2, Edit, Settings, Package, Layers, 
  QrCode, Eye, X, Save, Search, LogOut, LayoutGrid, Clock, 
  CheckCircle2, AlertCircle, Power, ChevronLeft, ArrowLeft
} from 'lucide-react';

interface AdminDashboardProps {
  storeData: StoreState;
  onUpdate: (data: StoreState) => void;
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ storeData, onUpdate, onLogout }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'categories' | 'hours' | 'settings'>('overview');
  const [showQR, setShowQR] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);

  const showFeedback = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const updateState = (newData: StoreState) => {
    onUpdate(newData);
    saveStoreData(newData);
  };

  const handleLogout = () => {
    if (confirm('Sair do sistema?')) {
      localStorage.removeItem('easymenu_session');
      onLogout();
      navigate('/');
    }
  };

  const TabHeader = ({ title, subtitle }: { title: string, subtitle: string }) => (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
      <div>
        <h2 className="text-4xl font-black text-white">{title}</h2>
        <p className="text-zinc-500 font-medium">{subtitle}</p>
      </div>
      <button onClick={() => setActiveTab('overview')} className="flex items-center gap-2 text-zinc-400 font-bold hover:text-white transition-colors">
        <ArrowLeft size={18} /> Voltar ao Painel
      </button>
    </div>
  );

  const renderOverview = () => (
    <div className="space-y-10 animate-fade-in">
      <h2 className="text-4xl font-black">Olá! 👋<br/><span className="text-zinc-500 text-xl font-bold">Gerencie sua loja digital aqui.</span></h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-800">
          <Package className="text-yellow-400 mb-4" size={32} />
          <h4 className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Total Produtos</h4>
          <p className="text-4xl font-black mt-2">{storeData.products.length}</p>
        </div>
        <div className="bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-800">
          <Layers className="text-zinc-400 mb-4" size={32} />
          <h4 className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Total Setores</h4>
          <p className="text-4xl font-black mt-2">{storeData.categories.length}</p>
        </div>
        <div className="bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-800">
          <Eye className="text-green-500 mb-4" size={32} />
          <h4 className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Status</h4>
          <p className="text-4xl font-black mt-2 text-green-500">Ativo</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <button onClick={() => setActiveTab('products')} className="p-8 bg-zinc-900 rounded-[2.5rem] border border-zinc-800 hover:bg-zinc-800 transition-all text-left">
          <Plus className="text-yellow-400 mb-4" size={32} />
          <span className="font-bold text-lg block">Produtos</span>
        </button>
        <button onClick={() => setActiveTab('categories')} className="p-8 bg-zinc-900 rounded-[2.5rem] border border-zinc-800 hover:bg-zinc-800 transition-all text-left">
          <Layers className="text-zinc-400 mb-4" size={32} />
          <span className="font-bold text-lg block">Categorias</span>
        </button>
        <button onClick={() => setActiveTab('hours')} className="p-8 bg-zinc-900 rounded-[2.5rem] border border-zinc-800 hover:bg-zinc-800 transition-all text-left">
          <Clock className="text-zinc-400 mb-4" size={32} />
          <span className="font-bold text-lg block">Horários</span>
        </button>
        <a href={`#/m/${storeData.business.slug}`} target="_blank" className="p-8 bg-yellow-400 text-black rounded-[2.5rem] hover:bg-yellow-300 transition-all text-left">
          <Eye className="mb-4" size={32} />
          <span className="font-black text-lg block">Ver Cardápio</span>
        </a>
      </div>
    </div>
  );

  const renderProducts = () => (
    <div className="space-y-8 animate-fade-in">
      <TabHeader title="Produtos" subtitle="Gerencie itens e variações de preço." />
      
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 bg-zinc-900 p-4 rounded-[2rem] border border-zinc-800 flex items-center gap-4">
          <Search className="text-zinc-600" size={20} />
          <input type="text" placeholder="Filtrar por nome..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent outline-none font-bold text-white placeholder-zinc-700" />
        </div>
        <button onClick={() => {
            if (storeData.categories.length === 0) { showFeedback('Crie uma categoria primeiro!', 'error'); setActiveTab('categories'); }
            else { setEditingProduct({ categoryId: storeData.categories[0].id, isAvailable: true, variations: [], price: 0 }); }
          }} className="bg-yellow-400 text-black px-8 py-4 rounded-[2rem] font-black flex items-center justify-center gap-2 shadow-xl shadow-yellow-900/10 active:scale-95 transition-all">
          <Plus size={20} /> Adicionar Item
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {storeData.products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map(product => (
          <div key={product.id} className={`bg-zinc-900 p-6 rounded-[2.5rem] border border-zinc-800 flex gap-6 items-center group ${!product.isAvailable ? 'opacity-40 grayscale' : ''}`}>
            {product.imageUrl && <img src={product.imageUrl} className="w-20 h-20 object-cover rounded-2xl" />}
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-white text-lg truncate">{product.name}</h4>
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-2">
                {storeData.categories.find(c => c.id === product.categoryId)?.name || 'Sem categoria'}
              </p>
              <div className="flex items-center gap-3">
                <span className="font-black text-yellow-400">
                  {product.variations.length > 0 ? `${product.variations.length} Opções` : formatCurrency(product.price)}
                </span>
                <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-md ${product.isAvailable ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                  {product.isAvailable ? 'Ativo' : 'Pausado'}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => {
                const newProducts = storeData.products.map(p => p.id === product.id ? { ...p, isAvailable: !p.isAvailable } : p);
                updateState({ ...storeData, products: newProducts });
                showFeedback(product.isAvailable ? 'Item pausado' : 'Item ativado');
              }} className="p-3 bg-zinc-800 text-white rounded-xl hover:bg-zinc-700 transition-colors">
                <Power size={18} />
              </button>
              <button onClick={() => setEditingProduct(product)} className="p-3 bg-zinc-800 text-white rounded-xl hover:bg-zinc-700 transition-colors"><Edit size={18} /></button>
              <button onClick={() => {
                if (confirm('Deseja excluir permanentemente?')) {
                  updateState({ ...storeData, products: storeData.products.filter(p => p.id !== product.id) });
                  showFeedback('Removido');
                }
              }} className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-colors"><Trash2 size={18} /></button>
            </div>
          </div>
        ))}
        {storeData.products.length === 0 && (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-zinc-800 rounded-[3rem]">
            <Package size={48} className="mx-auto text-zinc-800 mb-4" />
            <p className="text-zinc-600 font-bold uppercase tracking-widest text-[10px]">Nenhum produto cadastrado</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderCategories = () => (
    <div className="space-y-8 animate-fade-in">
      <TabHeader title="Categorias" subtitle="Setores do seu cardápio." />
      <button onClick={() => setEditingCategory({ name: '', isActive: true })} className="bg-yellow-400 text-black px-8 py-4 rounded-[2rem] font-black ml-auto block shadow-xl shadow-yellow-900/10 active:scale-95 transition-all">
        Nova Categoria
      </button>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {storeData.categories.map(cat => (
          <div key={cat.id} className={`bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-800 flex flex-col justify-between ${!cat.isActive ? 'opacity-40 grayscale' : ''}`}>
            <div className="mb-6">
              <h4 className="font-black text-white text-2xl">{cat.name}</h4>
              <p className="text-[10px] text-zinc-500 font-black uppercase mt-2 tracking-widest">
                {storeData.products.filter(p => p.categoryId === cat.id).length} Itens
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => {
                const newCats = storeData.categories.map(c => c.id === cat.id ? { ...c, isActive: !c.isActive } : c);
                updateState({ ...storeData, categories: newCats });
                showFeedback(cat.isActive ? 'Categoria ocultada' : 'Categoria visível');
              }} className={`p-4 rounded-xl flex-1 font-bold flex items-center justify-center gap-2 ${cat.isActive ? 'bg-green-500/10 text-green-500' : 'bg-zinc-800 text-zinc-500'}`}>
                <Power size={18} /> {cat.isActive ? 'Ativa' : 'Inativa'}
              </button>
              <button onClick={() => setEditingCategory(cat)} className="p-4 bg-zinc-800 text-white rounded-xl hover:bg-zinc-700 transition-colors"><Edit size={20} /></button>
              <button onClick={() => {
                if (confirm('Excluir categoria? Itens vinculados ficarão sem setor.')) {
                  updateState({ ...storeData, categories: storeData.categories.filter(c => c.id !== cat.id) });
                }
              }} className="p-4 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-colors"><Trash2 size={20} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderHours = () => (
    <div className="space-y-8 animate-fade-in">
      <TabHeader title="Horários" subtitle="Defina quando aceitar pedidos." />
      <div className="bg-zinc-900 rounded-[3rem] p-10 border border-zinc-800 shadow-2xl max-w-2xl space-y-4">
        {(Object.entries(storeData.business.operationalHours) as [string, any][]).map(([day, config]) => (
          <div key={day} className="flex items-center justify-between p-6 bg-zinc-800/30 rounded-2xl border border-zinc-800">
            <span className="font-black text-white capitalize text-lg w-28">{day}</span>
            <div className="flex items-center gap-4">
              <input type="time" value={config.open} onChange={(e) => {
                  const newHours = { ...storeData.business.operationalHours, [day]: { ...config, open: e.target.value } };
                  updateState({ ...storeData, business: { ...storeData.business, operationalHours: newHours } });
                }} className="bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-2 font-bold text-white outline-none focus:border-yellow-400" />
              <span className="text-zinc-600 font-bold">às</span>
              <input type="time" value={config.close} onChange={(e) => {
                  const newHours = { ...storeData.business.operationalHours, [day]: { ...config, close: e.target.value } };
                  updateState({ ...storeData, business: { ...storeData.business, operationalHours: newHours } });
                }} className="bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-2 font-bold text-white outline-none focus:border-yellow-400" />
            </div>
            <button onClick={() => {
                const newHours = { ...storeData.business.operationalHours, [day]: { ...config, closed: !config.closed } };
                updateState({ ...storeData, business: { ...storeData.business, operationalHours: newHours } });
              }} className={`w-32 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${config.closed ? 'bg-red-500 text-white' : 'bg-green-600 text-white'}`}>
              {config.closed ? 'Fechado' : 'Aberto'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 lg:flex font-inter text-white">
      {toast && (
        <div className={`fixed top-8 right-8 z-[500] px-8 py-5 rounded-[2rem] shadow-2xl animate-slide-in font-black flex items-center gap-3 ${toast.type === 'success' ? 'bg-yellow-400 text-black' : 'bg-red-500 text-white'}`}>
          {toast.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          {toast.message}
        </div>
      )}

      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-84 bg-zinc-900 border-r border-zinc-800 p-10 h-screen sticky top-0 shadow-2xl">
        <div className="mb-16">
          <h1 className="text-2xl font-black">EasyMenu <span className="text-yellow-400">Lite</span></h1>
          <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mt-1">Admin v3.0</p>
        </div>
        <nav className="space-y-3 flex-1">
          {[
            { id: 'overview', icon: LayoutGrid, label: 'Painel' },
            { id: 'products', icon: Package, label: 'Produtos' },
            { id: 'categories', icon: Layers, label: 'Categorias' },
            { id: 'hours', icon: Clock, label: 'Horários' },
            { id: 'settings', icon: Settings, label: 'Configurações' }
          ].map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-5 px-7 py-5 rounded-[2rem] font-bold transition-all ${activeTab === item.id ? 'bg-yellow-400 text-black' : 'text-zinc-500 hover:text-white hover:bg-zinc-800/50'}`}
            >
              <item.icon size={22} /> {item.label}
            </button>
          ))}
        </nav>
        <div className="pt-8 border-t border-zinc-800">
          <button onClick={handleLogout} className="w-full flex items-center gap-4 text-red-500 font-bold p-7 hover:bg-red-500/10 rounded-2xl transition-all">
            <LogOut size={22} /> Sair do Sistema
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8 lg:p-24 pb-32 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'products' && renderProducts()}
          {activeTab === 'categories' && renderCategories()}
          {activeTab === 'hours' && renderHours()}
          {activeTab === 'settings' && (
            <div className="space-y-8 animate-fade-in">
               <TabHeader title="Configurações" subtitle="Dados principais do seu negócio." />
               <div className="bg-zinc-900 rounded-[3.5rem] p-12 border border-zinc-800 max-w-4xl space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-500 uppercase px-1">Nome Fantasia</label>
                      <input type="text" value={storeData.business.name} onChange={e => updateState({...storeData, business: {...storeData.business, name: e.target.value}})} className="w-full bg-zinc-800 border-2 border-zinc-800 rounded-2xl px-6 py-4 focus:border-yellow-400 outline-none text-white font-bold" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-500 uppercase px-1">WhatsApp de Pedidos</label>
                      <input type="text" value={storeData.business.whatsapp} onChange={e => updateState({...storeData, business: {...storeData.business, whatsapp: e.target.value}})} className="w-full bg-zinc-800 border-2 border-zinc-800 rounded-2xl px-6 py-4 focus:border-yellow-400 outline-none text-white font-bold" placeholder="Ex: 11999999999" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-500 uppercase px-1">Taxa de Entrega (R$)</label>
                      <input type="number" step="0.01" value={storeData.business.settings.deliveryFee} onChange={e => updateState({...storeData, business: {...storeData.business, settings: {...storeData.business.settings, deliveryFee: parseFloat(e.target.value)}}})} className="w-full bg-zinc-800 border-2 border-zinc-800 rounded-2xl px-6 py-4 focus:border-yellow-400 outline-none text-white font-bold" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-500 uppercase px-1">Link da Logo (URL)</label>
                      <input type="text" value={storeData.business.logoUrl} onChange={e => updateState({...storeData, business: {...storeData.business, logoUrl: e.target.value}})} className="w-full bg-zinc-800 border-2 border-zinc-800 rounded-2xl px-6 py-4 focus:border-yellow-400 outline-none text-white font-bold" placeholder="https://..." />
                    </div>
                  </div>
                  <div className="p-6 bg-zinc-800/50 rounded-2xl border border-zinc-800 flex items-center gap-4 text-zinc-500 font-medium">
                    <CheckCircle2 className="text-green-500" />
                    Alterações são salvas automaticamente.
                  </div>
               </div>
            </div>
          )}
        </div>
      </main>

      {/* MODAL PRODUTO COM VARIAÇÕES */}
      {editingProduct && (
        <div className="fixed inset-0 z-[400] bg-black/80 backdrop-blur-md flex items-center justify-center p-6 overflow-y-auto">
          <div className="bg-zinc-900 w-full max-w-4xl rounded-[3.5rem] p-12 lg:p-16 border border-zinc-800 shadow-2xl my-auto animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-3xl font-black text-white">{editingProduct.id ? 'Editar' : 'Novo'} Produto</h3>
              <button onClick={() => setEditingProduct(null)} className="p-4 hover:bg-zinc-800 rounded-full text-zinc-600 transition-colors"><X size={32} /></button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const newProducts = [...storeData.products];
              const productToSave = { ...editingProduct, id: editingProduct.id || 'p-' + Date.now() } as Product;
              if (editingProduct.id) {
                const idx = newProducts.findIndex(p => p.id === editingProduct.id);
                newProducts[idx] = productToSave;
              } else {
                newProducts.push(productToSave);
              }
              updateState({ ...storeData, products: newProducts });
              setEditingProduct(null);
              showFeedback('Item atualizado!');
            }} className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase px-1">Nome do Item</label>
                  <input required autoFocus value={editingProduct.name || ''} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} className="w-full bg-zinc-800 p-5 rounded-[1.5rem] border border-zinc-700 font-bold text-white text-xl outline-none focus:border-yellow-400" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase px-1">Setor / Categoria</label>
                  <select required value={editingProduct.categoryId || ''} onChange={e => setEditingProduct({...editingProduct, categoryId: e.target.value})} className="w-full bg-zinc-800 p-5 rounded-[1.5rem] border border-zinc-700 font-bold text-white text-xl outline-none focus:border-yellow-400 appearance-none">
                    {storeData.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase px-1">Descrição Curta</label>
                  <textarea value={editingProduct.description || ''} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} className="w-full bg-zinc-800 p-5 rounded-[1.5rem] border border-zinc-700 h-28 font-medium text-white resize-none outline-none focus:border-yellow-400" />
                </div>
              </div>

              {/* GESTÃO DE VARIÁVEIS DE PREÇO */}
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Variáveis de Preço (Tamanhos/Sabores)</label>
                  <button type="button" onClick={() => setEditingProduct({...editingProduct, variations: [...(editingProduct.variations || []), { id: 'v-'+Date.now(), name: '', price: 0 }]})} className="bg-yellow-400/10 text-yellow-400 px-4 py-2 rounded-xl text-[10px] font-black hover:bg-yellow-400 hover:text-black transition-all">+ ADICIONAR VARIAÇÃO</button>
                </div>
                
                {(editingProduct.variations && editingProduct.variations.length > 0) ? (
                  <div className="grid gap-4">
                    {editingProduct.variations.map((v, i) => (
                      <div key={v.id} className="flex gap-4 items-center bg-zinc-800/30 p-5 rounded-[1.5rem] border border-zinc-800">
                        <input placeholder="Ex: Simples, Especial, Grande..." required value={v.name} onChange={e => {
                          const newV = [...editingProduct.variations!];
                          newV[i].name = e.target.value;
                          setEditingProduct({...editingProduct, variations: newV});
                        }} className="flex-1 bg-zinc-800 border border-zinc-700 p-3 rounded-xl font-bold text-white text-lg" />
                        <div className="flex items-center gap-2 bg-zinc-800 border border-zinc-700 p-3 rounded-xl w-40">
                          <span className="text-zinc-600 font-bold">R$</span>
                          <input type="number" step="0.01" required value={v.price} onChange={e => {
                            const newV = [...editingProduct.variations!];
                            newV[i].price = parseFloat(e.target.value) || 0;
                            setEditingProduct({...editingProduct, variations: newV});
                          }} className="w-full bg-transparent font-black text-white outline-none" />
                        </div>
                        <button type="button" onClick={() => {
                          const newV = editingProduct.variations!.filter((_, idx) => idx !== i);
                          setEditingProduct({...editingProduct, variations: newV});
                        }} className="text-red-500 hover:scale-110 transition-transform"><Trash2 size={24} /></button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2 max-w-xs">
                    <label className="text-[10px] font-black text-zinc-500 uppercase px-1">Preço Único (R$)</label>
                    <div className="flex items-center gap-2 bg-zinc-800 border border-zinc-700 p-5 rounded-[1.5rem] w-full">
                       <span className="text-zinc-600 font-bold">R$</span>
                       <input type="number" step="0.01" value={editingProduct.price || 0} onChange={e => setEditingProduct({...editingProduct, price: parseFloat(e.target.value) || 0})} className="w-full bg-transparent font-black text-white text-2xl outline-none" />
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase px-1">URL da Imagem (Ex: Firebase, Imgur...)</label>
                <input value={editingProduct.imageUrl || ''} onChange={e => setEditingProduct({...editingProduct, imageUrl: e.target.value})} className="w-full bg-zinc-800 p-5 rounded-[1.5rem] border border-zinc-700 font-bold text-white" placeholder="https://..." />
              </div>

              <div className="flex gap-4 pt-6">
                <button type="submit" className="flex-1 bg-yellow-400 text-black py-6 rounded-[2.5rem] font-black text-xl hover:bg-yellow-300 transition-all shadow-xl active:scale-95">Salvar Produto</button>
                <button type="button" onClick={() => setEditingProduct(null)} className="px-10 py-6 bg-zinc-800 text-zinc-400 font-bold rounded-[2.5rem]">Descartar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CATEGORIA */}
      {editingCategory && (
        <div className="fixed inset-0 z-[400] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-zinc-900 w-full max-w-md rounded-[3rem] p-12 border border-zinc-800 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-2xl font-black">Configurar Setor</h3>
              <button onClick={() => setEditingCategory(null)} className="text-zinc-600"><X /></button>
            </div>
            <form onSubmit={e => {
              e.preventDefault();
              const newCats = [...storeData.categories];
              const catToSave = { ...editingCategory, id: editingCategory.id || 'c-' + Date.now(), businessId: storeData.business.id, order: storeData.categories.length } as Category;
              if (editingCategory.id) {
                const idx = newCats.findIndex(c => c.id === editingCategory.id);
                newCats[idx] = catToSave;
              } else {
                newCats.push(catToSave);
              }
              updateState({ ...storeData, categories: newCats });
              setEditingCategory(null);
              showFeedback('Categoria salva!');
            }} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase px-1">Nome do Setor</label>
                <input required autoFocus value={editingCategory.name} onChange={e => setEditingCategory({...editingCategory, name: e.target.value})} className="w-full bg-zinc-800 p-6 rounded-[2rem] border-2 border-zinc-800 focus:border-yellow-400 outline-none text-center font-black text-3xl" placeholder="Ex: Bebidas" />
              </div>
              <button type="submit" className="w-full bg-yellow-400 text-black py-6 rounded-[2rem] font-black text-lg active:scale-95 transition-transform">Confirmar</button>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-zinc-900/90 backdrop-blur-xl border-t border-zinc-800 px-8 py-6 flex items-center justify-around z-[100] rounded-t-[3.5rem] shadow-2xl">
          {[
            { id: 'overview', icon: LayoutGrid },
            { id: 'products', icon: Package },
            { id: 'categories', icon: Layers },
            { id: 'hours', icon: Clock }
          ].map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id as any)} 
              className={`p-4 transition-all ${activeTab === item.id ? 'text-yellow-400 bg-yellow-400/10 rounded-[1.5rem] scale-110' : 'text-zinc-600'}`}>
              <item.icon size={26} />
            </button>
          ))}
          <button onClick={handleLogout} className="p-4 text-red-500"><LogOut size={26} /></button>
      </nav>

      <style>{`
        @keyframes slide-in { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        .animate-slide-in { animation: slide-in 0.4s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
