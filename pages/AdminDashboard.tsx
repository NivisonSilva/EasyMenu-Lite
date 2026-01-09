
import React, { useState } from 'react';
// @ts-ignore
import { useNavigate } from 'react-router-dom';
import { StoreState, Product, Category, Variation, OptionGroup } from '../types';
import { saveStoreData } from '../db';
import { formatCurrency, generateQRCodeUrl } from '../utils';
import { 
  Plus, Trash2, Edit, Settings, Package, Layers, 
  QrCode, Eye, X, Save, Search, LogOut, LayoutGrid, Clock, 
  Power, ArrowLeft
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
    if (confirm('Deseja sair do painel administrativo?')) {
      localStorage.removeItem('easymenu_session');
      onLogout();
      navigate('/');
    }
  };

  const TabHeader = ({ title, subtitle }: { title: string, subtitle: string }) => (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
      <div>
        <h2 className="text-4xl font-black text-white tracking-tight">{title}</h2>
        <p className="text-zinc-500 mt-1 font-medium">{subtitle}</p>
      </div>
      <button onClick={() => setActiveTab('overview')} className="hidden lg:flex items-center gap-2 text-zinc-400 hover:text-yellow-400 font-bold transition-all px-4 py-2 bg-zinc-900 rounded-xl border border-zinc-800">
        <ArrowLeft size={18} /> Painel
      </button>
    </div>
  );

  const renderOverview = () => (
    <div className="space-y-10 animate-fade-in">
      <div className="flex flex-col">
        <h2 className="text-4xl font-black text-white tracking-tight">Painel Principal</h2>
        <p className="text-zinc-500 mt-1 font-medium">Bem-vindo ao seu centro de controle.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-800">
          <Package className="text-yellow-400 mb-4" size={32} />
          <h4 className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Produtos</h4>
          <p className="text-4xl font-black mt-2 text-white">{storeData.products.length}</p>
        </div>
        <div className="bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-800">
          <Layers className="text-zinc-400 mb-4" size={32} />
          <h4 className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Categorias</h4>
          <p className="text-4xl font-black mt-2 text-white">{storeData.categories.length}</p>
        </div>
        <div className="bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-800">
          <Clock className="text-green-500 mb-4" size={32} />
          <h4 className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Status</h4>
          <p className="text-4xl font-black mt-2 text-green-500">Online</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <button onClick={() => setActiveTab('products')} className="p-8 bg-zinc-900 rounded-[2.5rem] border border-zinc-800 hover:bg-zinc-800 transition-all text-left group">
          <Plus className="text-yellow-400 mb-4 group-hover:scale-110 transition-transform" size={32} />
          <span className="font-bold text-lg block text-white">Novo Produto</span>
        </button>
        <button onClick={() => setActiveTab('categories')} className="p-8 bg-zinc-900 rounded-[2.5rem] border border-zinc-800 hover:bg-zinc-800 transition-all text-left">
          <Layers className="text-zinc-400 mb-4" size={32} />
          <span className="font-bold text-lg block text-white">Gerenciar Categorias</span>
        </button>
        <button onClick={() => setShowQR(true)} className="p-8 bg-zinc-900 rounded-[2.5rem] border border-zinc-800 hover:bg-zinc-800 transition-all text-left">
          <QrCode className="text-zinc-400 mb-4" size={32} />
          <span className="font-bold text-lg block text-white">Gerar QR Code</span>
        </button>
        <a href={`#/m/${storeData.business.slug}`} target="_blank" className="p-8 bg-yellow-400 rounded-[2.5rem] hover:bg-yellow-300 transition-all text-left">
          <Eye className="text-black mb-4" size={32} />
          <span className="font-black text-lg block text-black">Abrir Cardápio</span>
        </a>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 lg:flex font-inter text-white">
      {toast && (
        <div className={`fixed top-8 right-8 z-[500] px-8 py-5 rounded-[2rem] shadow-2xl animate-slide-in font-black flex items-center gap-3 ${toast.type === 'success' ? 'bg-yellow-400 text-black' : 'bg-red-500 text-white'}`}>
          {toast.message}
        </div>
      )}

      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-84 bg-zinc-900 border-r border-zinc-800 p-10 h-screen sticky top-0 shadow-2xl">
        <div className="mb-16">
          <h1 className="text-2xl font-black">EasyMenu <span className="text-yellow-400">Lite</span></h1>
          <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mt-1">Painel Administrativo</p>
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
              className={`w-full flex items-center gap-5 px-7 py-5 rounded-[2rem] font-bold transition-all ${activeTab === item.id ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-400/10' : 'text-zinc-500 hover:text-white hover:bg-zinc-800/50'}`}
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

      {/* Mobile Bottom Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-zinc-900/95 backdrop-blur-xl border-t border-zinc-800 px-6 py-6 flex items-center justify-around z-[100] rounded-t-[3.5rem] shadow-2xl">
          {[
            { id: 'overview', icon: LayoutGrid },
            { id: 'products', icon: Package },
            { id: 'categories', icon: Layers },
            { id: 'settings', icon: Settings }
          ].map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id as any)} 
              className={`p-4 transition-all ${activeTab === item.id ? 'text-yellow-400 bg-yellow-400/10 rounded-[1.5rem] scale-110' : 'text-zinc-600'}`}>
              <item.icon size={26} />
            </button>
          ))}
      </nav>

      <main className="flex-1 p-8 lg:p-24 pb-32 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'products' && (
            <div className="space-y-8 animate-fade-in">
              <TabHeader title="Produtos" subtitle="Gerencie seus itens, tamanhos e sabores." />
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 bg-zinc-900 p-4 rounded-[2rem] border border-zinc-800 flex items-center gap-4">
                  <Search className="text-zinc-600" size={20} />
                  <input type="text" placeholder="Filtrar produtos..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 bg-transparent outline-none font-bold text-white placeholder-zinc-700" />
                </div>
                <button onClick={() => {
                    if (storeData.categories.length === 0) { showFeedback('Crie uma categoria primeiro!', 'error'); setActiveTab('categories'); }
                    else { setEditingProduct({ categoryId: storeData.categories[0].id, isAvailable: true, variations: [], optionGroups: [], price: 0 }); }
                  }} className="bg-yellow-400 text-black px-8 py-4 rounded-[2rem] font-black flex items-center justify-center gap-2 shadow-xl hover:bg-yellow-300 transition-all">
                  <Plus size={20} /> Novo Produto
                </button>
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {storeData.products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map(product => (
                  <div key={product.id} className={`bg-zinc-900 p-6 rounded-[2.5rem] border border-zinc-800 flex gap-6 items-center group transition-all ${!product.isAvailable ? 'opacity-40 grayscale' : 'hover:border-zinc-700'}`}>
                    <div className="w-20 h-20 bg-zinc-800 rounded-2xl flex-shrink-0 overflow-hidden">
                       {product.imageUrl ? <img src={product.imageUrl} className="w-full h-full object-cover" /> : <Package className="w-full h-full p-6 text-zinc-700" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-white text-lg truncate">{product.name}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="font-black text-yellow-400">{product.variations.length > 0 ? 'Vários Preços' : formatCurrency(product.price)}</span>
                        {product.optionGroups.length > 0 && (
                          <span className="bg-zinc-800 text-zinc-500 text-[9px] font-black uppercase px-2 py-1 rounded">Com Sabores</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => {
                        const newProducts = storeData.products.map(p => p.id === product.id ? { ...p, isAvailable: !p.isAvailable } : p);
                        updateState({ ...storeData, products: newProducts });
                      }} className={`p-3 rounded-xl transition-colors ${product.isAvailable ? 'bg-green-500/10 text-green-500' : 'bg-zinc-800 text-zinc-500'}`}>
                        <Power size={18} />
                      </button>
                      <button onClick={() => setEditingProduct(product)} className="p-3 bg-zinc-800 text-white rounded-xl hover:bg-zinc-700 transition-colors"><Edit size={18} /></button>
                      <button onClick={() => {
                        if (confirm('Excluir este item?')) {
                          updateState({ ...storeData, products: storeData.products.filter(p => p.id !== product.id) });
                          showFeedback('Produto removido');
                        }
                      }} className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-colors"><Trash2 size={18} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {activeTab === 'categories' && (
             <div className="space-y-8 animate-fade-in">
                <TabHeader title="Categorias" subtitle="Setores do seu cardápio." />
                <button onClick={() => setEditingCategory({ name: '', isActive: true })} className="bg-yellow-400 text-black px-8 py-4 rounded-[2rem] font-black ml-auto block">Nova Categoria</button>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {storeData.categories.map(cat => (
                    <div key={cat.id} className={`bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-800 flex flex-col justify-between ${!cat.isActive ? 'opacity-40 grayscale' : ''}`}>
                      <h4 className="font-black text-white text-2xl">{cat.name}</h4>
                      <div className="flex gap-2 mt-8">
                         <button onClick={() => {
                            const newCats = storeData.categories.map(c => c.id === cat.id ? { ...c, isActive: !c.isActive } : c);
                            updateState({ ...storeData, categories: newCats });
                          }} className={`p-4 rounded-xl flex-1 font-bold ${cat.isActive ? 'bg-green-500/10 text-green-500' : 'bg-zinc-800 text-zinc-500'}`}>
                            <Power size={18} className="mx-auto" />
                          </button>
                          <button onClick={() => setEditingCategory(cat)} className="p-4 bg-zinc-800 text-white rounded-xl hover:bg-zinc-700 transition-colors"><Edit size={18} className="mx-auto" /></button>
                          <button onClick={() => {
                            if (confirm('Excluir categoria?')) {
                              updateState({ ...storeData, categories: storeData.categories.filter(c => c.id !== cat.id) });
                            }
                          }} className="p-4 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-colors"><Trash2 size={18} className="mx-auto" /></button>
                      </div>
                    </div>
                  ))}
                </div>
             </div>
          )}
          {activeTab === 'hours' && (
            <div className="space-y-8 animate-fade-in">
              <TabHeader title="Horários" subtitle="Defina quando aceita pedidos." />
              <div className="bg-zinc-900 p-8 rounded-[3rem] border border-zinc-800 max-w-2xl divide-y divide-zinc-800">
                {Object.entries(storeData.business.operationalHours).map(([day, config]) => (
                  <div key={day} className="flex items-center justify-between py-6 first:pt-0 last:pb-0">
                    <span className="font-black text-white capitalize text-lg">{day}</span>
                    <button onClick={() => {
                        const newHours = { ...storeData.business.operationalHours, [day]: { ...config, closed: !config.closed } };
                        updateState({ ...storeData, business: { ...storeData.business, operationalHours: newHours } });
                      }} className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${config.closed ? 'bg-red-500/10 text-red-500' : 'bg-green-600/10 text-green-500'}`}>
                      {config.closed ? 'Fechado' : 'Aberto'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {activeTab === 'settings' && (
             <div className="space-y-8 animate-fade-in">
                <TabHeader title="Ajustes" subtitle="Dados gerais da sua loja." />
                <div className="bg-zinc-900 p-12 rounded-[3.5rem] border border-zinc-800 max-w-4xl space-y-8">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-500 uppercase px-1">Nome da Loja</label>
                        <input type="text" value={storeData.business.name} onChange={e => updateState({...storeData, business: {...storeData.business, name: e.target.value}})} className="w-full bg-zinc-800 border-2 border-zinc-800 rounded-2xl px-6 py-4 outline-none text-white font-bold focus:border-yellow-400" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-500 uppercase px-1">WhatsApp</label>
                        <input type="text" value={storeData.business.whatsapp} onChange={e => updateState({...storeData, business: {...storeData.business, whatsapp: e.target.value}})} className="w-full bg-zinc-800 border-2 border-zinc-800 rounded-2xl px-6 py-4 outline-none text-white font-bold focus:border-yellow-400" placeholder="11999999999" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-500 uppercase px-1">Taxa de Entrega (R$)</label>
                        <input type="number" step="0.01" value={storeData.business.settings.deliveryFee} onChange={e => updateState({...storeData, business: {...storeData.business, settings: {...storeData.business.settings, deliveryFee: parseFloat(e.target.value) || 0}}})} className="w-full bg-zinc-800 border-2 border-zinc-800 rounded-2xl px-6 py-4 outline-none text-white font-bold focus:border-yellow-400" />
                      </div>
                   </div>
                </div>
             </div>
          )}
        </div>
      </main>

      {/* MODAL EDITOR DE PRODUTO (RESTAURADO TAMANHOS + SABORES) */}
      {editingProduct && (
        <div className="fixed inset-0 z-[400] bg-black/95 backdrop-blur-xl flex items-center justify-center p-6 overflow-y-auto">
          <div className="bg-zinc-900 w-full max-w-4xl rounded-[3.5rem] p-10 lg:p-14 border border-zinc-800 shadow-2xl my-auto animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-3xl font-black">{editingProduct.id ? 'Editar' : 'Novo'} Produto</h3>
              <button onClick={() => setEditingProduct(null)} className="p-4 hover:bg-zinc-800 rounded-full transition-colors"><X size={32} /></button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const newProducts = [...storeData.products];
              const productToSave = { 
                ...editingProduct, 
                id: editingProduct.id || 'p-' + Date.now(),
                variations: editingProduct.variations || [],
                optionGroups: editingProduct.optionGroups || []
              } as Product;
              if (editingProduct.id) {
                const idx = newProducts.findIndex(p => p.id === editingProduct.id);
                newProducts[idx] = productToSave;
              } else {
                newProducts.push(productToSave);
              }
              updateState({ ...storeData, products: newProducts });
              setEditingProduct(null);
              showFeedback('Item atualizado');
            }} className="space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase px-1">Nome</label>
                  <input required value={editingProduct.name || ''} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} className="w-full bg-zinc-800 p-5 rounded-[1.5rem] border border-zinc-700 font-bold text-white text-xl outline-none focus:border-yellow-400" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase px-1">Setor</label>
                  <select required value={editingProduct.categoryId || ''} onChange={e => setEditingProduct({...editingProduct, categoryId: e.target.value})} className="w-full bg-zinc-800 p-5 rounded-[1.5rem] border border-zinc-700 font-bold text-white text-xl outline-none focus:border-yellow-400 appearance-none">
                    {storeData.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              {/* SEÇÃO DE TAMANHOS / VARIAÇÕES (RESTAURADO) */}
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                  <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Tamanhos / Variações</h4>
                  <button type="button" onClick={() => setEditingProduct({...editingProduct, variations: [...(editingProduct.variations || []), { id: 'v-'+Date.now(), name: '', price: 0 }]})} className="text-yellow-400 text-[10px] font-black hover:underline">+ ADICIONAR TAMANHO</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {editingProduct.variations?.map((v, idx) => (
                    <div key={v.id} className="flex gap-2 items-center bg-zinc-800/30 p-4 rounded-2xl border border-zinc-800">
                      <input placeholder="Ex: Grande" required value={v.name} onChange={e => {
                        const newVar = [...editingProduct.variations!];
                        newVar[idx].name = e.target.value;
                        setEditingProduct({...editingProduct, variations: newVar});
                      }} className="bg-transparent font-bold flex-1 text-white outline-none" />
                      <input type="number" step="0.01" placeholder="R$" value={v.price || ''} onChange={e => {
                        const newVar = [...editingProduct.variations!];
                        newVar[idx].price = parseFloat(e.target.value) || 0;
                        setEditingProduct({...editingProduct, variations: newVar});
                      }} className="w-20 bg-zinc-900 border border-zinc-700 p-2 rounded-xl font-black text-center" />
                      <button type="button" onClick={() => setEditingProduct({...editingProduct, variations: editingProduct.variations?.filter((_, i) => i !== idx)})} className="text-zinc-600 hover:text-red-500"><X size={18} /></button>
                    </div>
                  ))}
                </div>
              </div>

              {/* SEÇÃO DE SABORES (GRUPOS DE OPÇÕES) */}
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                  <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Sabores e Extras</h4>
                  <button type="button" onClick={() => setEditingProduct({...editingProduct, optionGroups: [...(editingProduct.optionGroups || []), { id: 'g-'+Date.now(), name: '', minChoices: 1, maxChoices: 1, options: [] }]})} className="text-yellow-400 text-[10px] font-black hover:underline">+ NOVO GRUPO DE SABORES</button>
                </div>
                <div className="grid gap-6">
                  {editingProduct.optionGroups?.map((group, groupIdx) => (
                    <div key={group.id} className="bg-zinc-800/20 p-8 rounded-[2.5rem] border border-zinc-800 space-y-6">
                      <div className="flex flex-col lg:flex-row gap-6 items-center">
                        <input placeholder="Nome do Grupo (ex: Escolha os Sabores)" required value={group.name} onChange={e => {
                          const newGroups = [...editingProduct.optionGroups!];
                          newGroups[groupIdx].name = e.target.value;
                          setEditingProduct({...editingProduct, optionGroups: newGroups});
                        }} className="bg-zinc-900 border border-zinc-700 p-4 rounded-xl font-bold flex-1 text-white outline-none focus:border-yellow-400" />
                        <div className="flex gap-4">
                          <div className="space-y-1">
                            <label className="text-[9px] font-black text-zinc-600 uppercase">Mín</label>
                            <input type="number" min="0" value={group.minChoices} onChange={e => {
                              const newGroups = [...editingProduct.optionGroups!];
                              newGroups[groupIdx].minChoices = parseInt(e.target.value) || 0;
                              setEditingProduct({...editingProduct, optionGroups: newGroups});
                            }} className="w-16 bg-zinc-900 border border-zinc-700 p-2 rounded-lg font-black text-center" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-black text-zinc-600 uppercase">Máx</label>
                            <input type="number" min="1" value={group.maxChoices} onChange={e => {
                              const newGroups = [...editingProduct.optionGroups!];
                              newGroups[groupIdx].maxChoices = parseInt(e.target.value) || 1;
                              setEditingProduct({...editingProduct, optionGroups: newGroups});
                            }} className="w-16 bg-zinc-900 border border-zinc-700 p-2 rounded-lg font-black text-center" />
                          </div>
                          <button type="button" onClick={() => setEditingProduct({...editingProduct, optionGroups: editingProduct.optionGroups?.filter((_, i) => i !== groupIdx)})} className="text-red-500 p-3"><Trash2 size={20} /></button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {group.options.map((opt, optIdx) => (
                          <div key={opt.id} className="flex gap-2 items-center bg-zinc-900 p-3 rounded-xl border border-zinc-800">
                             <input placeholder="Sabor" required value={opt.name} onChange={e => {
                               const newGroups = [...editingProduct.optionGroups!];
                               newGroups[groupIdx].options[optIdx].name = e.target.value;
                               setEditingProduct({...editingProduct, optionGroups: newGroups});
                             }} className="bg-transparent font-bold flex-1 text-sm outline-none" />
                             <input type="number" placeholder="R$" value={opt.price || ''} onChange={e => {
                               const newGroups = [...editingProduct.optionGroups!];
                               newGroups[groupIdx].options[optIdx].price = parseFloat(e.target.value) || 0;
                               setEditingProduct({...editingProduct, optionGroups: newGroups});
                             }} className="w-16 bg-zinc-800 border border-zinc-700 p-1 rounded font-black text-[10px] text-center" />
                             <button type="button" onClick={() => {
                               const newGroups = [...editingProduct.optionGroups!];
                               newGroups[groupIdx].options = newGroups[groupIdx].options.filter((_, i) => i !== optIdx);
                               setEditingProduct({...editingProduct, optionGroups: newGroups});
                             }} className="text-zinc-600 hover:text-red-500"><X size={16} /></button>
                          </div>
                        ))}
                        <button type="button" onClick={() => {
                           const newGroups = [...editingProduct.optionGroups!];
                           newGroups[groupIdx].options.push({ id: 'o-'+Date.now(), name: '', price: 0 });
                           setEditingProduct({...editingProduct, optionGroups: newGroups});
                        }} className="p-3 border-2 border-dashed border-zinc-800 rounded-xl text-zinc-600 font-black text-[10px] hover:border-yellow-400 hover:text-yellow-400 transition-all">+ ADD SABOR</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase px-1">Preço Base (ou R$ 0 se usar Tamanhos)</label>
                  <div className="flex items-center gap-2 bg-zinc-800 border border-zinc-700 p-5 rounded-[1.5rem] w-full max-w-xs">
                     <span className="text-zinc-600 font-bold">R$</span>
                     <input type="number" step="0.01" value={editingProduct.price || 0} onChange={e => setEditingProduct({...editingProduct, price: parseFloat(e.target.value) || 0})} className="w-full bg-transparent font-black text-white text-2xl outline-none" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase px-1">URL da Imagem</label>
                  <input value={editingProduct.imageUrl || ''} onChange={e => setEditingProduct({...editingProduct, imageUrl: e.target.value})} className="w-full bg-zinc-800 p-5 rounded-[1.5rem] border border-zinc-700 font-bold text-white outline-none focus:border-yellow-400" placeholder="https://..." />
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button type="submit" className="flex-1 bg-yellow-400 text-black py-6 rounded-[2.5rem] font-black text-xl hover:bg-yellow-300 transition-all shadow-xl active:scale-95">Salvar Produto</button>
                <button type="button" onClick={() => setEditingProduct(null)} className="px-10 py-6 bg-zinc-800 text-zinc-400 font-bold rounded-[2.5rem]">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CATEGORIA */}
      {editingCategory && (
        <div className="fixed inset-0 z-[400] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-zinc-900 w-full max-w-md rounded-[3rem] p-12 border border-zinc-800 shadow-2xl">
            <h3 className="text-2xl font-black mb-10 text-white">Editar Categoria</h3>
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
            }} className="space-y-6">
              <input required autoFocus value={editingCategory.name} onChange={e => setEditingCategory({...editingCategory, name: e.target.value})} className="w-full bg-zinc-800 p-6 rounded-[2rem] border-2 border-zinc-800 focus:border-yellow-400 outline-none text-center font-black text-3xl text-white" placeholder="Ex: Bebidas" />
              <button type="submit" className="w-full bg-yellow-400 text-black py-6 rounded-[2rem] font-black text-lg active:scale-95 transition-transform">Confirmar</button>
            </form>
          </div>
        </div>
      )}

      {/* QR MODAL */}
      {showQR && (
        <div className="fixed inset-0 z-[500] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6" onClick={() => setShowQR(false)}>
          <div className="bg-white p-12 rounded-[4rem] text-center shadow-2xl" onClick={e => e.stopPropagation()}>
             <img src={generateQRCodeUrl(storeData.business.slug)} alt="QR Code" className="w-64 h-64 mx-auto mb-6" />
             <p className="text-zinc-400 font-black uppercase text-[10px] tracking-widest">Escaneie para acessar o cardápio</p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-in { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        .animate-slide-in { animation: slide-in 0.4s ease-out forwards; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
