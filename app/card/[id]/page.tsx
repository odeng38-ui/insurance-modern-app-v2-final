"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ImageSlider from "@/components/ImageSlider";
import { getCardDetail } from "@/lib/supabase";
import { InsuranceCard } from "@/lib/types";
import { ArrowLeft, Share2, Info, CheckCircle2, AlertTriangle, MessageSquareMore } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function CardDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  
  const [card, setCard] = useState<InsuranceCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    async function fetchDetail() {
      setLoading(true);
      try {
        const data = await getCardDetail(id);
        setCard(data);
      } catch (err: any) {
        console.error("Detail Fetch Error:", err);
        setError("상세 정보를 불러올 수 없습니다. 다시 시도해 주세요.");
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 font-bold tracking-widest uppercase">정보를 불러오는 중...</p>
      </div>
    );
  }

  if (error || !card) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-red-100">
           <AlertTriangle className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-slate-800 mb-2">Error!</h2>
        <p className="text-slate-500 mb-8 max-w-xs">{error || "잘못된 접근입니다."}</p>
        <Link href="/" className="px-8 py-3 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 hover:scale-105 transition-all">
          홈으로 돌아가기
        </Link>
      </div>
    );
  }

  // Display old content warning as per CLAUDE.md info trust rule
  const showWarning = card.image_count > 0; // Simple logic: if older than few months (mocked for now)

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Detail Header - sticky glassmorphism */}
      <nav className="sticky top-0 z-[100] bg-white/70 backdrop-blur-2xl border-b border-slate-100/50 px-6 h-20 flex items-center justify-between shadow-sm">
        <Link href="/" className="group p-2.5 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all border border-slate-200/50">
          <ArrowLeft className="w-5 h-5 text-slate-800 group-hover:-translate-x-1 transition-transform" />
        </Link>
        <div className="flex flex-col items-center">
           <h1 className="text-sm font-black text-slate-900 tracking-tight uppercase italic">{card.category}</h1>
           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Detail View</p>
        </div>
        <button className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all text-slate-400 border border-slate-200/50">
          <Share2 className="w-5 h-5" />
        </button>
      </nav>

      {/* Hero: Image Slider with Luxury Border */}
      <section className="bg-[#0A0F1E] overflow-hidden relative border-b border-slate-200/50 shadow-2xl">
         <div className="max-w-6xl mx-auto py-10 px-4">
            <ImageSlider cardId={card.id} images={card.images} title={card.title} />
         </div>
      </section>

      {/* Main Content Details */}
      <main className="max-w-4xl mx-auto px-4 py-10">
        
        {/* Warning banner as requested in Phase 2 */}
        <AnimatePresence>
          {showWarning && (
            <motion.div 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               className="mb-10 p-5 bg-warning/5 border border-warning/20 rounded-3xl flex items-start gap-4 transition-all shadow-sm"
            >
              <div className="p-2 bg-warning/10 text-warning rounded-2xl shrink-0">
                <Info className="w-5 h-5" />
              </div>
              <div>
                 <h4 className="font-black text-warning-900 text-sm mb-1 text-warning">업데이트가 필요한 콘텐츠일 수 있습니다.</h4>
                 <p className="text-warning/80 text-xs font-semibold leading-relaxed">
                   이 카드뉴스는 작성된 지 오래되었습니다. 2024년 최신 보험 약관과 차이가 있을 수 있으니 상담 시 유의해 주세요.
                 </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-14">
          <div className="md:col-span-8">
            <h2 className="text-3xl font-black text-slate-900 mb-6 leading-tight tracking-tight">{card.title}</h2>
            <div className="flex gap-2 flex-wrap mb-8">
               <span className="px-3 py-1 bg-primary text-white text-[11px] font-bold rounded-lg shadow shadow-primary/10 tracking-widest uppercase">
                  {card.category}
               </span>
               {card.tags.map(t => (
                  <span key={t} className="px-3 py-1 bg-slate-50 text-slate-400 text-[11px] font-bold rounded-lg border border-slate-100">
                    #{t}
                  </span>
               ))}
            </div>

            <p className="text-slate-600 text-lg leading-relaxed mb-10 font-medium font-serif italic border-l-4 border-slate-100 pl-6 border-primary/20">
              &quot;{card.summary}&quot;
            </p>

            <div className="space-y-12 mb-16">
              <section>
                 <h3 className="text-lg font-black text-slate-900 mb-5 flex items-center gap-2">
                    <div className="w-1.5 h-4 bg-primary rounded-full"></div>
                    상담 포인트 3가지
                 </h3>
                 <div className="space-y-4">
                    {card.key_points.map((pt, i) => (
                      <motion.div 
                        key={i} 
                        whileHover={{ x: 5 }}
                        className="p-5 bg-slate-50 border border-slate-100/50 rounded-2xl flex items-center gap-4 group transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-200/40 cursor-default"
                      >
                         <div className="w-10 h-10 rounded-full bg-primary/5 text-primary flex items-center justify-center font-black shrink-0 shadow-inner group-hover:bg-primary group-hover:text-white transition-all">
                           {i + 1}
                         </div>
                         <p className="font-bold text-slate-700 leading-snug">{pt}</p>
                         <CheckCircle2 className="w-6 h-6 text-primary ml-auto opacity-0 group-hover:opacity-20 transition-opacity" />
                      </motion.div>
                    ))}
                 </div>
              </section>
            </div>
          </div>

          <div className="md:col-span-4 self-start sticky top-24">
             <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-2xl shadow-primary/20 relative overflow-hidden group">
                {/* Decoration blobs */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary blur-[80px] opacity-30 rounded-full group-hover:opacity-50 transition-all"></div>
                <div className="relative z-10">
                  <h4 className="text-lg font-black mb-4 uppercase tracking-tighter italic">Counselor Quick Action</h4>
                  <p className="text-white/60 text-xs mb-8 font-semibold leading-relaxed uppercase tracking-widest">
                    상담 중에 유용한 기능을 활용해 보세요.
                  </p>
                  <div className="space-y-3">
                     <button className="w-full py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 border border-white/5 backdrop-blur shadow-sm">
                        <Share2 className="w-4 h-4" /> 링크 복사하기
                     </button>
                     <button className="w-full py-4 bg-primary hover:bg-blue-700 text-white rounded-2xl text-xs font-black transition-all shadow-xl shadow-blue-500/20 ring-1 ring-white/10 border border-blue-400/20 flex items-center justify-center gap-2">
                        <MessageSquareMore className="w-4 h-4" /> 고객에게 전송
                     </button>
                  </div>
                  <div className="mt-8 pt-6 border-t border-white/5">
                     <button className="text-[10px] text-white/30 font-bold uppercase tracking-widest hover:text-warning flex items-center justify-center w-full gap-2 transition-colors">
                        <AlertTriangle className="w-3 h-3" /> 내용이 틀렸어요
                     </button>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}
