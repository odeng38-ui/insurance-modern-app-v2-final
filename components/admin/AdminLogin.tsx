// @ts-nocheck
"use client";

import React, { useState } from "react";
import { supabase, isAdmin } from "@/lib/supabase";
import { 
  ShieldCheck, 
  Mail, 
  Lock, 
  ArrowRight,
  Loader2,
  AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";

interface AdminLoginProps {
  onLoginSuccess: (user: any) => void;
}

export default function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Password sign in
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      // 2. Authorization check (isAdmin check after login)
      if (!isAdmin(data.user?.email)) {
        // Sign out if not authorized as admin
        await supabase.auth.signOut();
        throw new Error("관리자 권한이 없는 계정입니다.");
      }

      onLoginSuccess(data.user);
    } catch (err: any) {
      console.error("Login Error:", err.message);
      setError(err.message === "Invalid login credentials" 
        ? "이메일 또는 비밀번호가 올바르지 않습니다." 
        : err.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
          <div className="bg-[#0F172A] p-10 text-center relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
              <div className="absolute top-[-10%] right-[-10%] w-40 h-40 bg-blue-500 rounded-full blur-3xl"></div>
              <div className="absolute bottom-[-10%] left-[-10%] w-40 h-40 bg-indigo-500 rounded-full blur-3xl"></div>
            </div>

            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="relative z-10"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-500/20">
                <ShieldCheck className="text-white w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight mb-2 italic">ADMIN LOGIN</h2>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Authorized Access Only</p>
            </motion.div>
          </div>

          <div className="p-10">
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input 
                    type="email" 
                    required
                    placeholder="admin@example.com"
                    className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input 
                    type="password" 
                    required
                    placeholder="••••••••"
                    className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 p-4 bg-red-50 rounded-2xl border border-red-100 text-red-600 text-xs font-bold"
                >
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </motion.div>
              )}

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-[#0F172A] hover:bg-slate-800 text-white py-5 rounded-2xl font-black text-sm flex items-center justify-center gap-3 transition-all shadow-xl active:scale-95 disabled:opacity-70 group"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    로그인 하기
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
            
            <p className="mt-8 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Secured by Supabase Guard
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
