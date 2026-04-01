import { motion } from "framer-motion";

interface CategoryFilterProps {
  categories: string[];
  selected: string;
  onSelect: (category: string) => void;
}

export default function CategoryFilter({ categories, selected, onSelect }: CategoryFilterProps) {
  return (
    <div className="flex gap-4 items-center">
      <div className="flex bg-white/50 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200/50 shadow-sm overflow-x-auto no-scrollbar max-w-full">
        {categories.map((category) => (
          <motion.button
            key={category}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(category)}
            className={`
              whitespace-nowrap px-6 py-2.5 rounded-xl text-xs font-black tracking-widest uppercase transition-all duration-300
              ${selected === category 
                ? "bg-[#0F172A] text-white shadow-xl shadow-slate-900/20 translate-y-[-1px]" 
                : "bg-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50"}
            `}
          >
            {category}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
