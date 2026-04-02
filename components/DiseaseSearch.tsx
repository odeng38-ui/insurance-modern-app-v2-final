"use client";

import { useState, useEffect } from "react";
import { searchDiseaseCodes } from "@/lib/supabase";
import { Search, Hash, FileText, Globe, Loader2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DiseaseCode {
  id: string;
  code: string;
  name_ko: string;
  name_en: string;
  level: string;
}

export default function DiseaseSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<DiseaseCode[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function performSearch() {
      if (query.trim().length < 1) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const data = await searchDiseaseCodes(query);
        setResults(data as DiseaseCode[]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    const timer = setTimeout(performSearch, 300);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Search Bar Container */}
      <div className="relative mb-10 group">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl blur opacity-20 group-focus-within:opacity-40 transition duration-500"></div>
        <div className="relative flex items-center bg-white rounded-2xl shadow-xl border border-slate-100 p-2 overflow-hidden">
          <div className="pl-6 pr-4">
            {loading ? (
              <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
            ) : (
              <Search className="w-6 h-6 text-slate-400" />
            )}
          </div>
          <input
            type="text"
            placeholder="질병코드(A00) 또는 질병명(고혈압, 암...)을 입력하세요"
            className="w-full py-5 bg-transparent border-none focus:ring-0 text-slate-800 text-lg font-bold placeholder:text-slate-300"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="hidden md:flex px-6 items-center gap-2 border-l border-slate-100">
             <Sparkles className="w-4 h-4 text-orange-400" />
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Smart Dictionary</span>
          </div>
        </div>
      </div>

      {/* Results Container */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden min-h-[500px]">
        {!query ? (
          <div className="flex flex-col items-center justify-center h-[500px] text-center p-10">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-blue-400 mb-6">
               <Hash className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2">제9차 한국표준질병ㆍ사인분류 (KCD-9)</h3>
            <p className="text-slate-400 font-medium max-w-sm">대한민국 질병분류 마스터 DB 61,005건을 즉시 검색할 수 있습니다.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="px-8 py-4 bg-slate-50/30 border-b border-slate-50">
               <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Statistical Classification of Diseases (KCD-9)</p>
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">코드</th>
                  <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">한글 질병명</th>
                  <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">영문 질병명</th>
                  <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">분류</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                <AnimatePresence>
                  {results.map((item, idx) => (
                    <motion.tr 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.02 }}
                      key={item.id} 
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                           <div className="w-fit min-w-[5rem] px-4 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200 group-hover:scale-105 transition-transform">
                              <span className="text-white text-[13px] font-black">{item.code}</span>
                           </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex flex-col gap-1">
                           <span className="text-sm font-bold text-slate-800 leading-tight">{item.name_ko}</span>
                           <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <FileText className="w-3 h-3 text-slate-400" />
                              <span className="text-[10px] font-bold text-slate-400">관련 보험자료 매칭 가능</span>
                           </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                           <Globe className="w-3 h-3 text-slate-300" />
                           <span className="text-xs font-medium text-slate-400 italic leading-tight">{item.name_en || "-"}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`inline-block whitespace-nowrap px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                          item.level === '대' ? 'bg-red-50 text-red-600 border border-red-100' :
                          item.level === '중' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                          'bg-slate-50 text-slate-600 border border-slate-100'
                        }`}>
                          {item.level}분류
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
            
            {!loading && results.length === 0 && query && (
              <div className="py-32 text-center flex flex-col items-center">
                 <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-6">
                    <Search className="w-10 h-10" />
                 </div>
                 <h3 className="text-lg font-bold text-slate-800">질병코드 결과가 없습니다</h3>
                 <p className="text-sm text-slate-400 font-medium">검색어를 조금 더 범용적으로 바꿔보세요.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
