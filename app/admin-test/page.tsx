"use client";

import React from "react";

export default function AdminTestPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-10 text-center">
      <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100 max-w-md w-full">
        <h1 className="text-3xl font-black text-slate-800 mb-4">Admin Test Page</h1>
        <p className="text-slate-500 font-bold mb-8">If you see this, the App Router is working correctly!</p>
        <div className="flex flex-col gap-3 text-left bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Route Diagnostic</p>
          <ul className="text-xs font-bold text-slate-600 space-y-2">
            <li>✅ Path: /admin-test</li>
            <li>✅ Status: Rendered</li>
            <li>✅ Link: <a href="/admin" className="text-blue-600 underline">Try /admin again</a></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
