// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { 
  searchInsuranceCards, 
  getSuggestions, 
  signInWithGoogle, 
  signOut,
  supabase,
  isAdmin
} from "@/lib/supabase";
import { InsuranceCard } from "@/lib/types";
import CardGrid from "@/components/CardGrid";
import CategoryFilter from "@/components/CategoryFilter";
import DiseaseSearch from "@/components/DiseaseSearch";
import { 
  Search, ShieldCheck, Sparkles, Filter, ChevronDown, 
  BookOpen, Layers, LogIn, LogOut, User, Lock, Globe,
  Settings
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"cards" | "disease">("cards");
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [cards, setCards] = useState<InsuranceCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const categories = [
    "전체",
    "실손보험",
    "암보험",
    "자동차보험",
    "건강/질환",
    "보험청구/계약",
    "보험제도/상식",
    "연금/저축",
    "간병/치매",
    "생활/특수보험",
    "의료/시술",
  ];

  useEffect(() => {
    let mounted = true;

    async function checkUser() {
      console.log("ANTIGRAVITY_DEPLOY_CHECK_V2_1410");
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted) {
          setUser(session?.user ?? null);
          setAuthLoading(false);
        }
      } catch (err) {
        if (mounted) setAuthLoading(false);
      }
    }

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setUser(session?.user ?? null);
        setAuthLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!user) return; // 로그인 안 되어 있으면 중단

    async function fetchCards() {
      setLoading(true);
      try {
        const data = await searchInsuranceCards(query, selectedCategory);
        setCards(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    const timer = setTimeout(fetchCards, 300);
    return () => clearTimeout(timer);
  }, [query, selectedCategory, user]);

  useEffect(() => {
    if (!user) return; // 로그인 안 되어 있으면 중단
    
    async function fetchSuggestions() {
      if (query.trim().length > 0) {
        const data = await getSuggestions(query);
        setSuggestions(data);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }
    const timer = setTimeout(fetchSuggestions, 200);
    return () => clearTimeout(timer);
  }, [query, user]);

  // --- RENDERING LOGIC ---

  // 로딩 중 화면
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
          <Sparkles className="w-10 h-10 text-blue-500" />
        </motion.div>
      </div>
    );
  }

  // 로그인 전용 대기실
  if (!user) {
    return (
      <main className="min-h-screen bg-[#0A0F1E] flex flex-col items-center justify-center p-6 overflow-hidden relative">
        {/* Decorative Orbs */}
        <div className="absolute top-0 -left-20 w-96 h-96 bg-blue-600/20 rounded-full blur-[128px] animate-pulse"></div>
        <div className="absolute bottom-0 -right-20 w-96 h-96 bg-indigo-600/20 rounded-full blur-[128px] animate-pulse"></div>
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 w-full max-w-lg text-center"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-2xl mb-8">
            <ShieldCheck className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tighter">
            보험 데이터 <span className="text-blue-400">전용 포털 - v2</span>
          </h1>
          <p className="text-slate-400 font-medium mb-10">승인된 전문가 전용 공간입니다. 로그인을 진행해 주세요.</p>

          <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl">
            <button 
              onClick={() => signInWithGoogle()}
              className="w-full flex items-center justify-center gap-4 bg-white hover:bg-slate-50 text-slate-900 py-5 rounded-2xl font-black text-lg transition-all shadow-xl active:scale-95 group"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
              Google 계정으로 로그인
            </button>
            <p className="mt-6 text-[10px] text-slate-500 font-bold uppercase tracking-widest">Authorized Access Only</p>
          </div>
        </motion.div>
      </main>
    );
  }

  // 로그인 상태인 경우 메인 대시보드 렌더링
  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      {/* Premium Header / Sign Out Button */}
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-100">
                <ShieldCheck className="text-white w-6 h-6" />
             </div>
             <span className="text-xl font-black text-slate-800 tracking-tighter italic">INSURE PRO</span>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-100">
                <div className="w-5 h-5 rounded-full bg-blue-500 overflow-hidden">
                   {user.user_metadata?.avatar_url && <img src={user.user_metadata.avatar_url} alt="Profile" />}
                </div>
                <span className="text-[10px] font-black text-slate-500 truncate max-w-[100px]">{user.email}</span>
             </div>
             
             {isAdmin(user?.email || user?.user_metadata?.email) && (
               <Link 
                 href="/admin"
                 className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-[11px] font-black uppercase hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 border border-indigo-400/30 anim-pulse-subtle"
               >
                 <Settings className="w-3.5 h-3.5" />
                 관리자페이지
               </Link>
             )}

             <button 
               onClick={() => signOut()}
               className="flex items-center gap-2 text-slate-400 hover:text-red-500 transition-colors"
             >
               <LogOut className="w-5 h-5" />
               <span className="text-[10px] font-black uppercase">Exit</span>
             </button>
          </div>
        </div>
      </nav>
      {/* Premium Hero Section */}
      <section className="relative bg-[#0F172A] pt-24 pb-36 px-6 overflow-hidden">
        {/* Background Decorative Blobs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-400/10 blur-[100px] rounded-full translate-y-1/4 -translate-x-1/4"></div>

        <div className="max-w-6xl mx-auto relative z-10 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8"
          >
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span className="text-[10px] font-black text-blue-300 uppercase tracking-[0.2em]">The Future of Insurance Consulting</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight leading-[1.1]"
          >
            {activeTab === "cards" ? (
              <>고객의 신뢰를 완성하는 <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">보험 상담 전문가의 보물창고</span></>
            ) : (
              <>복잡한 진단서도 한눈에 <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">스마트 질병코드 백과사전</span></>
            )}
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 text-lg mb-12 max-w-2xl mx-auto font-medium"
          >
            {activeTab === "cards" ? (
              <>{cards.length}개의 방대한 보험 카드뉴스를 즉시 검색하세요. <br/> 전문성은 높이고, 설명은 더 쉬워지도록 도와드립니다.</>
            ) : (
              <>전국 6만 건 이상의 표준질병사인분류(KCD-9) 마스터 DB. <br/> 질병코드와 명칭을 실시간으로 확인하고 상담에 활용하세요.</>
            )}
          </motion.p>

          {/* Premium Tab Switcher */}
          <div className="flex justify-center mb-10">
            <div className="bg-white/5 backdrop-blur-md p-1.5 rounded-2xl border border-white/10 flex gap-2">
              <button 
                onClick={() => setActiveTab("cards")}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black transition-all ${
                  activeTab === "cards" 
                  ? "bg-white text-[#0F172A] shadow-xl" 
                  : "text-white/60 hover:text-white"
                }`}
              >
                <Layers className="w-4 h-4" />
                보험 카드뉴스
              </button>
              <button 
                onClick={() => setActiveTab("disease")}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black transition-all ${
                  activeTab === "disease" 
                  ? "bg-white text-[#0F172A] shadow-xl" 
                  : "text-white/60 hover:text-white"
                }`}
              >
                <BookOpen className="w-4 h-4" />
                질병코드 사전
              </button>
            </div>
          </div>

          {/* Luxury Search Bar (Only for Cards) */}
          {activeTab === "cards" && (
            <div className="max-w-3xl mx-auto -mb-10 lg:-mb-14 text-left">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-indigo-500 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative flex items-center bg-white rounded-2xl shadow-2xl overflow-hidden p-2">
                  <div className="pl-6 pr-4">
                    <Search className="w-6 h-6 text-slate-300" />
                  </div>
                  <input
                    type="text"
                    placeholder="증권분석, 4세대 실손, 암보험 암진단비..."
                    className="w-full py-5 bg-transparent border-none focus:ring-0 text-slate-700 text-lg font-semibold placeholder:text-slate-300 placeholder:font-medium"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => query && setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  />
                  <button className="hidden md:flex ml-2 mr-2 bg-[#0F172A] hover:bg-slate-800 text-white px-8 py-4 rounded-xl font-black text-sm transition-all shadow-lg active:scale-95">
                    검색하기
                  </button>
                </div>

                <AnimatePresence>
                  {showSuggestions && suggestions.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute left-0 right-0 top-full mt-3 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-50 p-2"
                    >
                      <div className="px-4 py-2 border-b border-slate-50 mb-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <Sparkles className="w-3 h-3 text-blue-500" />
                          관련 키워드 추천
                        </p>
                      </div>
                      {suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setQuery(suggestion);
                            setShowSuggestions(false);
                          }}
                          className="w-full text-left px-5 py-3.5 hover:bg-slate-50 transition-colors flex items-center gap-3 group/item"
                        >
                          <Search className="w-4 h-4 text-slate-300 group-hover/item:text-primary" />
                          <span className="text-slate-700 font-bold text-sm truncate">{suggestion}</span>
                          <ChevronDown className="w-3 h-3 text-slate-200 ml-auto -rotate-90" />
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Results & Filters Container */}
      <section className="max-w-7xl mx-auto px-6 py-20 mt-8">
        <AnimatePresence mode="wait">
          {activeTab === "cards" ? (
            <motion.div
              key="cards-view"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
                <div className="flex flex-col">
                   <div className="flex items-center gap-3 mb-2">
                      <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
                      <h2 className="text-2xl font-black text-slate-800 tracking-tight">자료 검색 결과</h2>
                   </div>
                   <p className="text-slate-400 text-sm font-semibold ml-5">
                     {loading ? "데이터를 분석 중입니다..." : `총 ${cards.length}건의 전문 카드뉴스가 발견되었습니다.`}
                   </p>
                </div>

                <div className="flex gap-4 items-center">
                   <div className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 text-xs font-bold cursor-pointer hover:bg-slate-50 transition-colors shadow-sm">
                      <Filter className="w-4 h-4" />
                      필터 정렬
                      <ChevronDown className="w-3.5 h-3.5" />
                   </div>
                </div>
              </div>

              {/* Categories Section */}
              <div className="mb-14 overflow-x-auto pb-4 scrollbar-hide">
                <CategoryFilter 
                  categories={categories}
                  selected={selectedCategory}
                  onSelect={setSelectedCategory}
                />
              </div>

              {/* Card Grid */}
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 opacity-50">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="bg-white rounded-3xl h-[400px] border border-slate-100 flex flex-col p-6">
                      <div className="h-48 bg-slate-50 rounded-2xl mb-4"></div>
                      <div className="h-6 bg-slate-50 rounded-lg w-3/4 mb-3"></div>
                      <div className="h-4 bg-slate-50 rounded-lg w-1/2 mb-6"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <CardGrid cards={cards} />
              )}

              {!loading && cards.length === 0 && (
                <div className="py-32 text-center flex flex-col items-center">
                  <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mb-8">
                    <Search className="w-12 h-12" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-4">찾으시는 자료가 없습니다</h3>
                  <p className="text-slate-400 font-medium">검색어를 바꿔보거나 다른 카테고리를 선택해 보세요.</p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="disease-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="py-10"
            >
              <div className="flex items-center gap-3 mb-12 justify-center">
                 <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200">
                    <BookOpen className="text-white w-6 h-6" />
                 </div>
                 <div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tighter">KCD-9 질병코드 검색</h2>
                    <p className="text-emerald-600 text-[10px] font-black uppercase tracking-[0.2em]">61,005 Disease Metadata Online</p>
                 </div>
              </div>
              
              <DiseaseSearch />
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Luxury Footer Overlay */}
      <footer className="py-20 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex flex-col gap-2">
            <h4 className="text-xl font-black text-[#0F172A] tracking-tighter italic">INSURANCE COUNSELOR PRO</h4>
            <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-600 rounded-lg text-[10px] font-bold border border-green-100 w-fit">
              <ShieldCheck className="w-3 h-3" />
              보안 인증된 상담 공식 지원 도구
            </div>
          </div>
          <div className="flex gap-10 text-xs font-bold text-slate-400 uppercase tracking-widest">
             <span className="hover:text-primary cursor-pointer transition-colors">Privacy</span>
             <span className="hover:text-primary cursor-pointer transition-colors">Terms of Use</span>
             <span className="hover:text-primary cursor-pointer transition-colors">Contact</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
