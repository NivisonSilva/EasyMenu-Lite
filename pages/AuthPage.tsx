
import React, { useState } from 'react';
// @ts-ignore
import { Link, useNavigate } from 'react-router-dom';
import { LayoutGrid, ArrowRight, Mail, Lock, User } from 'lucide-react';

interface AuthPageProps {
  type: 'login' | 'register';
  onLogin: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ type, onLogin }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('easymenu_session', 'true');
    onLogin();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-6">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-400 text-black rounded-[2rem] mb-6 shadow-[0_0_30px_rgba(250,204,21,0.2)]">
            <LayoutGrid size={36} strokeWidth={3} />
          </div>
          <h1 className="text-4xl font-black tracking-tight text-white">EasyMenu <span className="text-yellow-400">Lite</span></h1>
          <p className="text-zinc-500 mt-2 font-medium">
            {type === 'login' ? 'Painel de Gestão Premium.' : 'Sua loja online em segundos.'}
          </p>
        </div>

        <div className="bg-zinc-900 rounded-[3rem] p-10 shadow-2xl border border-zinc-800">
          <form onSubmit={handleSubmit} className="space-y-6">
            {type === 'register' && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Nome</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={20} />
                  <input required type="text" value={name} onChange={(e) => setName(e.target.value)}
                    className="w-full bg-zinc-800 border-2 border-zinc-800 rounded-2xl pl-12 pr-6 py-4 focus:border-yellow-400 outline-none transition-all font-bold text-white placeholder-zinc-600"
                    placeholder="Nome da loja"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={20} />
                <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-800 border-2 border-zinc-800 rounded-2xl pl-12 pr-6 py-4 focus:border-yellow-400 outline-none transition-all font-bold text-white placeholder-zinc-600"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={20} />
                <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-800 border-2 border-zinc-800 rounded-2xl pl-12 pr-6 py-4 focus:border-yellow-400 outline-none transition-all font-bold text-white placeholder-zinc-600"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button className="w-full bg-yellow-400 text-black py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-yellow-300 transition-all shadow-xl shadow-yellow-900/10 active:scale-95">
              {type === 'login' ? 'Entrar' : 'Cadastrar'}
              <ArrowRight size={20} strokeWidth={3} />
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-zinc-800 text-center">
            {type === 'login' ? (
              <p className="text-sm text-zinc-500 font-medium">
                Novo por aqui? <Link to="/register" className="text-yellow-400 font-black hover:underline">Crie sua conta</Link>
              </p>
            ) : (
              <p className="text-sm text-zinc-500 font-medium">
                Já é de casa? <Link to="/" className="text-yellow-400 font-black hover:underline">Faça Login</Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
