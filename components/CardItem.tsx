import { InsuranceCard } from "@/lib/types";
import { BookOpen, MapPin, ChevronRight, Tag, Bookmark } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

interface CardItemProps {
  card: InsuranceCard;
}

export default function CardItem({ card }: CardItemProps) {
  // Supabase Storage에서 썸네일 경로 생성 (상세 뷰와 동일한 방식)
  const getThumbnailUrl = () => {
    if (card.images && card.images.length > 0) {
      const filename = card.images[0];
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
      return `${supabaseUrl}/storage/v1/object/public/card-images/${card.id}/${filename}`;
    }
    return "/placeholder-insurance.jpg";
  };

  return (
    <motion.div
      whileHover={{ y: -8 }}
      className="h-full"
    >
      <Link href={`/card/${card.id}`} className="group block h-full">
        <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.1)] transition-all duration-500 flex flex-col h-full group-hover:border-primary/20">
          
          {/* Hero Thumbnail Area */}
          <div className="relative h-56 overflow-hidden">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
               <img 
                  src={getThumbnailUrl()} 
                  alt={card.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent opacity-60"></div>
            </div>

            {/* Content Floating on Thumbnail */}
            <div className="absolute top-4 left-4 z-10">
               <span className="px-3 py-1 bg-white/20 backdrop-blur-xl border border-white/30 text-white text-[10px] font-black rounded-lg uppercase tracking-widest shadow-xl">
                 {card.category}
               </span>
            </div>

            <div className="absolute bottom-4 left-4 z-10 flex gap-1">
               {card.tags.slice(0, 2).map(tag => (
                 <span key={tag} className="px-2 py-0.5 bg-black/40 backdrop-blur-md text-white/90 text-[9px] font-bold rounded-md">
                   #{tag}
                 </span>
               ))}
            </div>

            <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
               <div className="w-8 h-8 rounded-full bg-primary/95 text-white flex items-center justify-center shadow-2xl">
                 <Bookmark className="w-3.5 h-3.5" />
               </div>
            </div>
          </div>

          {/* Card Body Detail */}
          <div className="p-6 flex flex-col flex-grow">
            <h3 className="text-xl font-black text-slate-800 mb-3 leading-tight tracking-tight group-hover:text-primary transition-colors line-clamp-2">
              {card.title}
            </h3>
            
            <p className="text-slate-500 text-sm font-medium line-clamp-2 mb-6 leading-relaxed">
              {card.summary}
            </p>

            <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-black text-slate-400 uppercase tracking-wider">
                <BookOpen className="w-4 h-4 text-primary opacity-60" />
                <span>{card.image_count} Pages</span>
              </div>
              
              <div className="flex items-center gap-1 text-[10px] font-black text-primary uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                View Detail
                <ChevronRight className="w-3 h-3" />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
