import { useState, useCallback } from "react";
import { Search } from "lucide-react";
import debounce from "lodash/debounce";

interface SearchBarProps {
  onSearch: (query: string) => void;
  initialQuery?: string;
}

export default function SearchBar({ onSearch, initialQuery = "" }: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);

  // Debounce search callback (300ms as per design principles)
  const debouncedSearch = useCallback(
    debounce((q: string) => {
      onSearch(q);
    }, 300),
    [onSearch]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
  };

  const handleClear = () => {
    setQuery("");
    onSearch("");
  };

  return (
    <div className="relative group">
      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none group-focus-within:text-primary text-slate-400 transition-colors">
        <Search className="w-5 h-5" />
      </div>
      <input
        type="text"
        className="w-full h-14 pl-12 pr-12 bg-white border-2 border-transparent focus:border-primary/20 rounded-xl outline-none shadow-[0_4px_30px_-10px_rgba(30,64,175,0.1)] transition-all placeholder:text-slate-400 text-lg"
        placeholder="검색어를 입력하세요 (예: 4세대 실손, 암보험 장점...)"
        value={query}
        onChange={handleChange}
      />
      {query && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-4 flex items-center text-slate-300 hover:text-slate-500"
        >
          <span className="sr-only">초기화</span>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
