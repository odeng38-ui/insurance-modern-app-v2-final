"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ImageSliderProps {
  cardId: string;
  images: string[];
  title: string;
}

export default function ImageSlider({ cardId, images, title }: ImageSliderProps) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const getImageUrl = (filename: string) => {
    // 한글 제목을 URL 안전하게 인코딩하여 로컬 경로 매칭
    const folderName = encodeURI(title);
    return `/images/cards/${folderName}/${filename}`;
  };

  // Preload next image logic to ensure zero-lag transition
  useEffect(() => {
    if (images.length > 1) {
      // Preload next
      const nextIdx = (index + 1) % images.length;
      const nextImg = new Image();
      nextImg.src = getImageUrl(images[nextIdx]);

      // Preload previous
      const prevIdx = (index - 1 + images.length) % images.length;
      const prevImg = new Image();
      prevImg.src = getImageUrl(images[prevIdx]);
    }
  }, [index, images, cardId]);

  const paginate = (newDirection: number) => {
    if (images.length === 0) return;
    const nextIndex = (index + newDirection + images.length) % images.length;
    setDirection(newDirection);
    setIndex(nextIndex);
  };

  // High-performance smooth variants
  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 500 : -500,
      opacity: 0,
      scale: 0.98,
      filter: "blur(10px)"
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
      filter: "blur(0px)"
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 500 : -500,
      opacity: 0,
      scale: 0.98,
      filter: "blur(10px)",
      position: 'absolute' as const // Critical for seamless overlap
    })
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  return (
    <div className="bg-[#0A0F1E] w-full flex flex-col items-center justify-center py-6 select-none overflow-hidden rounded-3xl shadow-2xl border border-white/5">
      <div className="flex items-center justify-center w-full max-w-6xl gap-2 md:gap-8 px-4">
        
        {/* Navigation - Left Outside */}
        <div className="hidden md:flex flex-shrink-0 items-center justify-center z-50">
          {images.length > 1 && (
            <motion.button
              whileHover={{ scale: 1.1, backgroundColor: "rgba(59, 130, 246, 0.8)" }}
              whileTap={{ scale: 0.9 }}
              className="p-4 bg-white/5 text-white rounded-full transition-colors cursor-pointer backdrop-blur-xl border border-white/10"
              onClick={() => paginate(-1)}
            >
              <ChevronLeft className="w-8 h-8" />
            </motion.button>
          )}
        </div>

        {/* Viewport wrapper with fixed height to prevent flickering */}
        <div className="relative flex-1 h-[450px] md:h-[650px] flex items-center justify-center overflow-visible">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={index}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 400, damping: 40 },
                opacity: { duration: 0.25 },
                scale: { duration: 0.3 }
              }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={1}
              onDragEnd={(e, { offset, velocity }) => {
                const swipe = swipePower(offset.x, velocity.x);
                if (swipe < -swipeConfidenceThreshold) {
                  paginate(1);
                } else if (swipe > swipeConfidenceThreshold) {
                  paginate(-1);
                }
              }}
              // Essential positioning for framer-motion AnimatePresence mode
              className="absolute inset-0 w-full h-full flex items-center justify-center"
            >
              <div className="relative w-full h-full flex items-center justify-center p-2">
                 <div className="absolute inset-x-0 bottom-0 top-1/2 bg-gradient-to-t from-black/40 to-transparent blur-3xl opacity-50 -z-10"></div>
                 <img
                    src={getImageUrl(images[index])}
                    alt={`${title} - ${index + 1}`}
                    className="max-w-full max-h-full object-contain pointer-events-none rounded-2xl shadow-[0_30px_60px_-12px_rgba(0,0,0,0.5)] border border-white/10"
                 />
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Mobile Overlay Arrows (Transparent clickable zones) */}
          <div className="md:hidden absolute inset-0 flex pointer-events-none">
             <div className="flex-1 cursor-pointer pointer-events-auto" onClick={() => paginate(-1)}></div>
             <div className="flex-1 cursor-pointer pointer-events-auto" onClick={() => paginate(1)}></div>
          </div>
        </div>

        {/* Navigation - Right Outside */}
        <div className="hidden md:flex flex-shrink-0 items-center justify-center z-50">
          {images.length > 1 && (
            <motion.button
              whileHover={{ scale: 1.1, backgroundColor: "rgba(59, 130, 246, 0.8)" }}
              whileTap={{ scale: 0.9 }}
              className="p-4 bg-white/5 text-white rounded-full transition-colors cursor-pointer backdrop-blur-xl border border-white/10"
              onClick={() => paginate(1)}
            >
              <ChevronRight className="w-8 h-8" />
            </motion.button>
          )}
        </div>
      </div>

      {/* Pages indicator */}
      {images.length > 1 && (
        <div className="mt-8 px-5 py-2 bg-white/5 backdrop-blur-lg border border-white/10 rounded-full flex items-center gap-4 shadow-xl">
           <div className="text-[10px] font-black text-blue-400 tracking-[0.2em] uppercase">Page</div>
           <div className="flex gap-1.5">
              {images.map((_, i) => (
                <div 
                   key={i} 
                   className={`h-1.5 transition-all duration-300 rounded-full ${i === index ? "w-8 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" : "w-1.5 bg-white/20"}`}
                ></div>
              ))}
           </div>
           <div className="text-[10px] font-black text-white/50 tracking-widest">{index + 1} / {images.length}</div>
        </div>
      )}
    </div>
  );
}
