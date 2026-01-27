import Glow from "@/components/ui/glow";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { FaPause, FaPlay } from "react-icons/fa";

export const VideoSection = (): JSX.Element => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  useEffect(() => {
    // Preload video metadata to get dimensions
    if (videoRef.current) {
      videoRef.current.addEventListener('loadedmetadata', () => {
        setIsLoaded(true);
      });
    }
  }, []);

  return (
    <section className="flex flex-col w-full items-center gap-12 px-4 sm:px-8 md:px-12 lg:px-[100px] pt-30 relative">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative max-w-[1000px] w-full rounded-[32px] border border-white/10 backdrop-blur-lg bg-gradient-to-b from-[#4d0159] to-[#000000] p-4"
      >
        {/* Gradient Overlay at Bottom */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 w-full scale-[1.1] bg-gradient-to-b from-transparent via-black/50 to-black" />

        {/* Glow Effect after Video Container - Positioned at top */}
          <div className="absolute top-60 left-0 right-0 z-0 pointer-events-none">
            <Glow variant="top" />
          </div>
        
        {/* Inner Container */}
        <div className="relative rounded-[24px] border border-white/10 bg-[#0f0f0f] overflow-visible">
          {/* Video Container with Play Button - Fixed Aspect Ratio */}
          <div className="relative rounded-[20px] overflow-hidden group cursor-pointer z-10 aspect-video bg-[#0a0a0a]">
            {/* Loading Placeholder */}
            {!isLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a]">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center gap-3"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 border-2 border-white/20 border-t-white/60 rounded-full"
                  />
                  <span className="text-white/40 text-sm">Loading video...</span>
                </motion.div>
              </div>
            )}
            
            <video
              ref={videoRef}
              className={`rounded-[20px] w-full h-full object-cover transition-opacity duration-500 ${
                isLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              src="/4733-179738669.mp4"
              loop
              muted
              playsInline
              preload="metadata"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onLoadedData={() => setIsLoaded(true)}
            />
            
            {/* Play/Pause Button Overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className={`absolute inset-0 flex items-center justify-center transition-colors duration-300 ${
                isPlaying ? 'bg-black/0 hover:bg-black/10' : 'bg-black/20 group-hover:bg-black/30'
              }`}
              onClick={togglePlay}
            >
              {!isPlaying && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center w-20 h-20 rounded-full bg-black/60 backdrop-blur-md border border-white/40 shadow-lg hover:bg-black/80 hover:border-white/30 transition-all duration-300"
                  aria-label="Play video"
                >
                  {/* @ts-expect-error - react-icons type issue with strict mode */}
                  <FaPlay className="w-8 h-8 text-white ml-1" aria-hidden="true" />
                </motion.button>
              )}
              {isPlaying && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center w-20 h-20 rounded-full bg-black/60 backdrop-blur-md border border-white/20 shadow-lg hover:bg-black/80 hover:border-white/30 transition-all duration-300"
                  aria-label="Pause video"
                >
                  {/* @ts-expect-error - react-icons type issue with strict mode */}
                  <FaPause className="w-8 h-8 text-white" aria-hidden="true" />
                </motion.button>
              )}
            </motion.div>
          </div>
          
          
        </div>
      </motion.div>
    </section>
  );
};
