"use client";

import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import CardForm from "@/components/admin/CardForm";
import { 
  supabase, 
  isAdmin, 
  getCardDetail, 
  updateInsuranceCard 
} from "@/lib/supabase";
import { InsuranceCard } from "@/lib/types";
import { 
  Loader2,
  ChevronLeft
} from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";

export default function EditCardPage() {
  const [card, setCard] = useState<InsuranceCard | null>(null);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  useEffect(() => {
    async function checkAdmin() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || !isAdmin(session.user.email)) {
        router.push("/");
        return;
      }
      setAuthLoading(false);
      fetchCard();
    }
    checkAdmin();
  }, [router, id]);

  async function fetchCard() {
    try {
      const data = await getCardDetail(id);
      setCard(data);
    } catch (err) {
      alert("자료를 불러오는 중 오류가 발생했습니다.");
      router.push("/admin");
    } finally {
      setDataLoading(false);
    }
  }

  const handleSubmit = async (data: Omit<InsuranceCard, "id">) => {
    setLoading(true);
    try {
      await updateInsuranceCard(id, data);
      alert("성공적으로 수정되었습니다!");
      router.push("/admin");
    } catch (err) {
      alert("자료 수정 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || dataLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-10 flex items-center gap-4">
        <Link 
          href="/admin"
          className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-all shadow-sm"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">자료 수정</h1>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Update Existing Insurance Card Content</p>
        </div>
      </div>

      {card && (
        <CardForm 
          initialData={card}
          onSubmit={handleSubmit} 
          onCancel={() => router.push("/admin")}
          isLoading={loading}
        />
      )}
    </AdminLayout>
  );
}
