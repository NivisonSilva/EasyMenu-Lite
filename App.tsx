
import React, { useState, useEffect } from 'react';
// @ts-ignore
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import ClientView from './pages/ClientView';
import AdminDashboard from './pages/AdminDashboard';
import AuthPage from './pages/AuthPage';
import { getStoreData } from './db';
import { StoreState } from './types';

const App: React.FC = () => {
  const [storeData, setStoreData] = useState<StoreState | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const data = getStoreData();
      setStoreData(data);
      
      const loggedUser = localStorage.getItem('easymenu_session');
      if (loggedUser) setIsAuthenticated(true);
    } catch (e) {
      console.error("Erro crítico na inicialização:", e);
    } finally {
      // Garante que o loading termine mesmo em caso de erro parcial
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Se storeData ainda for null por erro grave, mostra erro amigável
  if (!storeData) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-center p-10">
        <p className="text-zinc-500 font-bold uppercase tracking-widest text-sm">Erro ao carregar banco local. Tente limpar o cache.</p>
      </div>
    );
  }

  return (
    <HashRouter>
      <Routes>
        <Route 
          path="/" 
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <AuthPage type="login" onLogin={() => setIsAuthenticated(true)} />} 
        />
        <Route 
          path="/register" 
          element={<AuthPage type="register" onLogin={() => setIsAuthenticated(true)} />} 
        />
        <Route 
          path="/dashboard" 
          element={isAuthenticated ? <AdminDashboard storeData={storeData} onUpdate={setStoreData} onLogout={() => setIsAuthenticated(false)} /> : <Navigate to="/" />} 
        />
        <Route path="/m/:slug" element={<ClientView storeData={storeData} />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
