"use client";

import React, { useState, useEffect } from "react";
import { InsuranceCard } from "@/lib/types";
import { 
  Save, 
  X, 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  Tag, 
  Type, 
  Layout, 
  ListChecks 
} from "lucide-react";
import { motion } from "framer-motion";

interface CardFormProps {
  initialData?: InsuranceCard;
  onSubmit: (data: Omit<InsuranceCard, "id">) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function CardForm({ 
  initialData, 
  onSubmit, 
  onCancel, 
  isLoading 
}: CardFormProps) {
  const [formData, setFormData] = useState<Omit<InsuranceCard, "id">>({
    title: "",
    category: "전체",
    tags: [],
    summary: "",
    content: "",
    key_points: [],
    images: [],
    image_count: 0
  });

  const [tagInput, setTagInput] = useState("");
  const [keyPointInput, setKeyPointInput] = useState("");
  const [imageUrlInput, setImageUrlInput] = useState("");

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        category: initialData.category || "전체",
        tags: initialData.tags || [],
        summary: initialData.summary || "",
        content: initialData.content || "",
        key_points: initialData.key_points || [],
        images: initialData.images || [],
        image_count: initialData.image_count || 0
      });
    }
  }, [initialData]);

  const categories = [
    "전체", "실손보험", "암보험", "자동차보험", "건강/질환", 
    "보험청구/계약", "보험제도/상식", "연금/저축", "간병/치매", 
    "생활/특수보험", "의료/시술"
  ];

  const handleAddField = (field: "tags" | "key_points" | "images", value: string, setter: (val: string) => void) => {
    if (!value.trim()) return;
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field] as string[], value.trim()]
    }));
    setter("");
  };

  const handleRemoveField = (field: "tags" | "key_points" | "images", index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      ...formData,
      image_count: formData.images.length
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 p-8 md:p-10">
        
        {/* Title */}
        <div className="mb-8">
          <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
            <Type className="w-3 h-3 text-blue-500" />
            자료 제목
          </label>
          <input
            type="text"
            required
            className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-800 font-bold placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            placeholder="보험 카드뉴스 제목을 입력하세요"
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Category */}
          <div>
            <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
              <Layout className="w-3 h-3 text-blue-500" />
              카테고리
            </label>
            <select
              required
              className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none"
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value })}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
              <Tag className="w-3 h-3 text-blue-500" />
              태그 (Keywords)
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                className="flex-1 px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold placeholder:text-slate-300 focus:outline-none focus:border-blue-500"
                placeholder="태그 입력 후 추가"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddField("tags", tagInput, setTagInput))}
              />
              <button
                type="button"
                onClick={() => handleAddField("tags", tagInput, setTagInput)}
                className="bg-slate-100 text-slate-500 px-4 rounded-xl hover:bg-slate-200 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, i) => (
                <span key={i} className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold border border-blue-100">
                  #{tag}
                  <button type="button" onClick={() => handleRemoveField("tags", i)}><X className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="mb-8">
          <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
            <ListChecks className="w-3 h-3 text-blue-500" />
            자료 요약 (Summary)
          </label>
          <textarea
            required
            rows={3}
            className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-800 font-bold placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            placeholder="자료의 핵심 내용을 간략히 요약하세요"
            value={formData.summary}
            onChange={e => setFormData({ ...formData, summary: e.target.value })}
          />
        </div>

        {/* Key Points */}
        <div className="mb-8">
          <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
            <ShieldCheck className="w-3 h-3 text-blue-500" />
            핵심 체크포인트 (Key Points)
          </label>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              className="flex-1 px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold placeholder:text-slate-300 focus:outline-none focus:border-blue-500"
              placeholder="상세 핵심 내용 추가"
              value={keyPointInput}
              onChange={e => setKeyPointInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddField("key_points", keyPointInput, setKeyPointInput))}
            />
            <button
              type="button"
              onClick={() => handleAddField("key_points", keyPointInput, setKeyPointInput)}
              className="bg-slate-100 text-slate-500 px-4 rounded-xl hover:bg-slate-200 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <ul className="space-y-2">
            {formData.key_points.map((point, i) => (
              <li key={i} className="flex items-start justify-between gap-4 p-4 bg-slate-50 rounded-xl text-sm font-bold text-slate-700">
                <span className="flex-1">{point}</span>
                <button type="button" onClick={() => handleRemoveField("key_points", i)} className="text-slate-300 hover:text-red-500 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Images */}
        <div>
          <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
            <ImageIcon className="w-3 h-3 text-blue-500" />
            카드 이미지 URL (List)
          </label>
          <div className="flex gap-2 mb-4">
            <input
              type="url"
              className="flex-1 px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold placeholder:text-slate-300 focus:outline-none focus:border-blue-500"
              placeholder="https://example.com/image.jpg"
              value={imageUrlInput}
              onChange={e => setImageUrlInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddField("images", imageUrlInput, setImageUrlInput))}
            />
            <button
              type="button"
              onClick={() => handleAddField("images", imageUrlInput, setImageUrlInput)}
              className="bg-slate-100 text-slate-500 px-4 rounded-xl hover:bg-slate-200 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {formData.images.map((url, i) => (
              <div key={i} className="relative group aspect-square rounded-2xl overflow-hidden border border-slate-100 bg-slate-50">
                <img src={url} alt={`Slide ${i+1}`} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <button type="button" onClick={() => handleRemoveField("images", i)} className="p-2 bg-red-500 text-white rounded-lg">
                     <Trash2 className="w-4 h-4" />
                   </button>
                </div>
                <div className="absolute top-2 left-2 px-2 py-0.5 bg-white/80 backdrop-blur-sm rounded text-[8px] font-black uppercase">Slide {i+1}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Persistence Content (Optional large text area if needed) */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 p-8">
        <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
          <Type className="w-3 h-3 text-blue-500" />
          상세 본문 (Content)
        </label>
        <textarea
          rows={10}
          className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-800 font-medium placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-mono text-sm"
          placeholder="상세 내용을 마크다운이나 일반 텍스트로 입력하세요 (선택 사항)"
          value={formData.content}
          onChange={e => setFormData({ ...formData, content: e.target.value })}
        />
      </div>

      <div className="flex items-center justify-end gap-4 pb-10">
        <button
          type="button"
          onClick={onCancel}
          className="px-8 py-4 rounded-2xl font-black text-sm text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-3 bg-[#0F172A] hover:bg-slate-800 text-white px-10 py-4 rounded-2xl font-black text-sm transition-all shadow-xl active:scale-95 disabled:opacity-50"
        >
          {isLoading ? (
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {initialData ? "자료 수정하기" : "자료 등록완료"}
        </button>
      </div>
    </form>
  );
}
