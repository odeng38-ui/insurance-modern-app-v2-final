"use client";

import { useState, useEffect } from "react";
import { searchInsuranceCards } from "@/lib/supabase";
import { InsuranceCard } from "@/lib/types";
import SearchBar from "@/components/SearchBar";
import CategoryFilter from "@/components/CategoryFilter";
import CardGrid from "@/components/CardGrid";
import DiseaseSearch from "@/components/DiseaseSearch";
import { Search, Info, LayoutGrid, FileText, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORIES = ["전체", "실손보험", "암보험", "자동차보험", "건강/질환", "보험청구/계약", "보험제도/상식", "연금/저축", "간병/치매", "생활/특수보험", "의료/시술"];

export default function Home() {
  const [activeTab, setActiveTab] = useState<"card" | "disease">("card");
  const [cards, setCards] = useState<InsuranceCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("전체");

  useEffect(() => {
    async function fetchCards() {
      setLoading(true);
      try {
        const data = await searchInsuranceCards(query, category);
        setCards(data);
      } catch (error) {
        console.error("Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    }
    
    // Initial fetch or when filters change
    const timer = setTimeout(fetchCards, 300);
    return () => clearTimeout(timer);
  }, [query, category]);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Premium Header Container */}
      <header className="bg-slate-900 pt-16 pb-32 px-6 relative overflow-hidden">
        {/* Background Accents */}
        <div className="absolute top-0 right-0 w-[50%] h-full bg-primary/10 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[30%] h-full bg-blue-600/10 blur-[100px] rounded-full -translate-x-1/2 translate-y-1/2"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
            <div>
               <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                     <Activity className="text-white w-6 h-6" />
                  </div>
                  <span className="text-blue-400 font-black tracking-[0.3em] uppercase text-xs">Insure Pro Portal</span>
               </div>
               <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight italic">
                 보험 상담의 <span className="text-primary italic">새로운 기준,</span><br />
                 실시간 전문가 도구
               </h1>
            </div>

            {/* Tab Switcher */}
            <div className="flex bg-white/5 backdrop-blur-xl p-1.5 rounded-2xl border border-white/10 shadow-2xl">
              <button 
                onClick={() => setActiveTab("card")}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black transition-all ${activeTab === "card" ? "bg-white text-slate-900 shadow-xl" : "text-white/60 hover:text-white"}`}
              >
                <LayoutGrid className="w-4 h-4" /> 카드뉴스 검색
              </button>
              <button 
                onClick={() => setActiveTab("disease")}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black transition-all ${activeTab === "disease" ? "bg-white text-slate-900 shadow-xl" : "text-white/60 hover:text-white"}`}
              >
                <FileText className="w-4 h-4" /> 질병코드 사전
              </button>
            </div>
          </div>

          {/* Floating Search Container */}
          <div className="bg-white/5 backdrop-blur-3xl p-1 rounded-[2.5rem] border border-white/10 shadow-3xl">
             <div className="bg-white rounded-[2rem] p-4 md:p-8 shadow-inner">
                {activeTab === "card" ? (
                  <div className="space-y-8">
                    <SearchBar onSearch={setQuery} initialQuery={query} />
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-2">
                       <CategoryFilter categories={CATEGORIES} selected={category} onSelect={setCategory} />
                       <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-full">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            {cards.length} Records Found
                          </span>
                       </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-2">
                    <div className="mb-6 flex items-center gap-3 px-4 py-3 bg-blue-50 border border-blue-100 rounded-2xl">
                       <Info className="w-4 h-4 text-blue-600" />
                       <p className="text-xs font-bold text-blue-900">제9차 한국표준질병사인분류(KCD-9) 전체 데이터를 검색합니다.</p>
                    </div>
                    <DiseaseSearch />
                  </div>
                )}
             </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 -mt-16 pb-24 relative z-20">
        <AnimatePresence mode="wait">
          {activeTab === "card" && (
            <motion.div
              key="cards"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="bg-white rounded-3xl h-[400px] animate-pulse border border-slate-100 overflow-hidden">
                       <div className="h-48 bg-slate-100"></div>
                       <div className="p-6 space-y-4">
                          <div className="h-6 bg-slate-100 rounded-full w-3/4"></div>
                          <div className="h-4 bg-slate-100 rounded-full w-full"></div>
                          <div className="h-4 bg-slate-100 rounded-full w-1/2 mt-8"></div>
                       </div>
                    </div>
                  ))}
                </div>
              ) : cards.length > 0 ? (
                <CardGrid cards={cards} />
              ) : (
                <div className="bg-white rounded-3xl py-32 border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center px-10">
                   <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-8">
                      <Search className="w-12 h-12" />
                   </div>
                   <h3 className="text-2xl font-black text-slate-800 mb-2 tracking-tight italic uppercase">No Results Found</h3>
                   <p className="text-slate-400 font-medium max-w-sm leading-relaxed">
                     검색어와 카테고리를 조정해 보세요.<br />
                     원하는 정보를 찾지 못했다면 키워드를 통합해 보세요.
                   </p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "disease" && (
            <motion.div
              key="empty-space-for-disease"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-20"
            ></motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Luxury Footer */}
      <footer className="bg-white border-t border-slate-100 py-20 px-6">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="flex items-center gap-3 grayscale opacity-40">
               <Activity className="w-6 h-6" />
               <span className="font-black italic uppercase tracking-tighter text-xl">Insure Pro</span>
            </div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
              © 2026 Insurance Counselor Tool. All Rights Reserved.
            </p>
            <div className="flex gap-8">
               <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest cursor-pointer hover:text-primary transition-colors">Privacy</span>
               <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest cursor-pointer hover:text-primary transition-colors">Support</span>
            </div>
         </div>
      </footer>
    </div>
  );
}

