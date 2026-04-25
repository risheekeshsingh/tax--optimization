import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Mail, Lock, User, ArrowRight, ShieldCheck } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    
    try {
      const { data } = await axios.post(`http://localhost:5000${endpoint}`, formData);
      localStorage.setItem('taxUserInfo', JSON.stringify(data));
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row overflow-hidden">
      
      {/* Left Decoration (Desktop Only) */}
      <div className="hidden lg:flex lg:w-1/2 bg-on-surface p-20 flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <path d="M0 0 L100 0 L100 100 L0 100 Z" fill="url(#grid)" />
                  <defs>
                      <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                          <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
                      </pattern>
                  </defs>
              </svg>
          </div>
          
          <div className="relative z-10">
              <div className="flex items-center gap-3 mb-10">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-xl">
                      <TrendingUp className="text-on-surface w-7 h-7" />
                  </div>
                  <span className="text-2xl font-display font-black text-white tracking-tighter">Your <span className="text-primary">Money</span></span>
              </div>
              <h1 className="text-7xl font-display font-black text-white leading-tight">
                  Taxes <br />
                  Solved by <br />
                  <span className="text-primary">Intelligence.</span>
              </h1>
          </div>

          <div className="relative z-10 flex items-center gap-6 p-8 bg-white/5 rounded-[40px] border border-white/10 backdrop-blur-md">
                <div className="w-16 h-16 rounded-[28px] bg-primary flex items-center justify-center text-white shadow-2xl">
                    <ShieldCheck size={32} />
                </div>
                <div>
                   <p className="text-white font-black text-xl mb-1">AES-256 Encryption</p>
                   <p className="text-white/60 font-medium">Your financial data stays yours. Always.</p>
                </div>
          </div>
      </div>

      {/* Right Login Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 lg:p-20 relative">
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-white p-12 rounded-[48px] border border-outline-variant/30 shadow-[0_20px_50px_rgba(0,0,0,0.05)]"
          >
            <div className="text-center mb-10">
                <h2 className="text-4xl font-display font-black text-on-surface mb-2 tracking-tight">
                    {isLogin ? 'Hello Again' : 'Join Us'}
                </h2>
                <p className="text-on-surface-variant font-medium">
                    {isLogin ? 'Securely access your Money account.' : 'Build your custom financial clone.'}
                </p>
            </div>

            <AnimatePresence mode="wait">
                {error && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-red-50 text-red-600 p-4 rounded-2xl border border-red-100 text-sm font-bold mb-6 text-center"
                    >
                        {error}
                    </motion.div>
                )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-6">
                {!isLogin && (
                    <div className="space-y-2">
                        <label className="text-xs font-black text-on-surface-variant uppercase tracking-widest ml-1">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant w-5 h-5" />
                            <input 
                                type="text" 
                                required
                                placeholder="Aayush Sharma"
                                className="w-full bg-surface-container-low/50 border border-outline-variant/30 rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all text-on-surface font-semibold"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                            />
                        </div>
                    </div>
                )}
                
                <div className="space-y-2">
                    <label className="text-xs font-black text-on-surface-variant uppercase tracking-widest ml-1">Email Address</label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant w-5 h-5" />
                        <input 
                            type="email" 
                            required
                            placeholder="name@company.com"
                            className="w-full bg-surface-container-low/50 border border-outline-variant/30 rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all text-on-surface font-semibold"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-black text-on-surface-variant uppercase tracking-widest ml-1">Password</label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant w-5 h-5" />
                        <input 
                            type="password" 
                            required
                            placeholder="••••••••"
                            className="w-full bg-surface-container-low/50 border border-outline-variant/30 rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all text-on-surface font-semibold"
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                        />
                    </div>
                </div>

                <button 
                    type="submit"
                    disabled={loading}
                    className="w-full bg-on-surface text-white font-black py-5 rounded-2xl mt-4 hover:shadow-2xl hover:shadow-on-surface/20 transition-all flex items-center justify-center gap-3 group active:scale-[0.98] disabled:opacity-50"
                >
                    {loading ? (
                        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>
                            <span>{isLogin ? 'Continue to Clone' : 'Create My Clone'}</span>
                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </button>
            </form>

            <div className="mt-8 text-center pt-4 border-t border-outline-variant/20">
                <button 
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-primary hover:text-on-primary-container font-black uppercase tracking-widest text-xs transition-colors"
                >
                    {isLogin ? "Need a clone? Sign up" : 'Already optimized? Sign in'}
                </button>
            </div>
          </motion.div>
      </div>
    </div>
  );
}
