"use client";

import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { 
  supabase, 
  isAdmin, 
  deleteInsuranceCard, 
  searchInsuranceCards 
} from "@/lib/supabase";
import { InsuranceCard } from "@/lib/types";
import { 
  Edit3, 
  Trash2, 
  Plus, 
  Search, 
  ExternalLink,
  Loader2,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import AdminLogin from "@/components/admin/AdminLogin";

export default function AdminPage() {
  const [user, setUser] = useState<any>(null);
  const [cards, setCards] = useState<InsuranceCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [authLoading, setAuthLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function checkAdmin() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && isAdmin(session.user.email)) {
        setUser(session.user);
        setIsAuthorized(true);
        fetchCards();
      }
      setAuthLoading(false);
    }
    checkAdmin();
  }, [router]);

  async function fetchCards() {
    setLoading(true);
    try {
      const data = await searchInsuranceCards(query);
      setCards(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`'${title}' 자료를 정말 삭제하시겠습니까?`)) return;
    
    try {
      await deleteInsuranceCard(id);
      setCards(cards.filter(c => c.id !== id));
      alert("삭제되었습니다.");
    } catch (err) {
      alert("삭제 중 오류가 발생했습니다.");
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <AdminLogin 
          onLoginSuccess={(u) => {
            setUser(u);
            setIsAuthorized(true);
            fetchCards();
          }} 
        />
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight mb-2">자료 대시보드</h1>
          <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Insurance Card Metadata Management</p>
        </div>
        
        <Link 
          href="/admin/new"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-2xl font-black text-sm transition-all shadow-xl shadow-blue-200 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          새 자료 등록하기
        </Link>
      </div>

      {/* Search & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-10">
        <div className="lg:col-span-3 relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
          <input 
            type="text"
            placeholder="자료 제목 또는 키워드로 검색..."
            className="w-full pl-14 pr-6 py-4 bg-white border border-slate-100 rounded-2xl text-slate-700 font-bold shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchCards()}
          />
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-center gap-4 shadow-sm">
           <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500 font-black">
             {cards.length}
           </div>
           <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Items</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Title & Category</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Images</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Update</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center">
                    <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-4" />
                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">데이터를 불러오는 중...</p>
                  </td>
                </tr>
              ) : cards.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center">
                    <AlertCircle className="w-10 h-10 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">검색 결과가 없습니다.</p>
                  </td>
                </tr>
              ) : (
                cards.map((card) => (
                  <tr key={card.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-black text-slate-800 line-clamp-1">{card.title}</span>
                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{card.category}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                          {card.images?.[0] && <img src={card.images[0]} alt="" className="w-full h-full object-cover" />}
                        </div>
                        <span className="text-xs font-bold text-slate-400">+{card.image_count} slides</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-xs font-bold text-slate-400">2024.04.04</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-end gap-3">
                        <Link 
                          href={`/admin/edit/${card.id}`}
                          className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Link>
                        <button 
                          onClick={() => handleDelete(card.id, card.title)}
                          className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
