import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, X, ExternalLink } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { cn } from "@/lib/utils.js";

export default function Stories({ data }) {
  console.log(data);
  const [activeGroup, setActiveGroup] = useState(null);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const storiesRef = useRef(null);
  const progressInterval = useRef(null);
  const progressDuration = 5000; // 5 seconds per slide

  // Sort story groups by order
  const sortedGroups = [...data.details].sort((a, b) => a.order - b.order);

  const handleStoryClick = (group) => {
    // Sort slides by order
    const sortedSlides = [...group.slides].sort((a, b) => a.order - b.order);
    setActiveGroup({
      ...group,
      slides: sortedSlides,
    });
    setActiveSlideIndex(0);
    setProgress(0);
    document.body.style.overflow = "hidden"; // Prevent background scrolling
  };

  const closeStory = () => {
    setActiveGroup(null);
    document.body.style.overflow = ""; // Restore scrolling
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
  };

  const nextSlide = () => {
    if (!activeGroup) return;
    if (activeSlideIndex < activeGroup.slides.length - 1) {
      setActiveSlideIndex((prev) => prev + 1);
      setProgress(0);
    } else {
      const currentGroupIndex = sortedGroups.findIndex(
        (g) => g.id === activeGroup.id
      );
      if (currentGroupIndex < sortedGroups.length - 1) {
        const nextGroup = sortedGroups[currentGroupIndex + 1];
        const sortedSlides = [...nextGroup.slides].sort(
          (a, b) => a.order - b.order
        );
        setActiveGroup({ ...nextGroup, slides: sortedSlides });
        setActiveSlideIndex(0);
        setProgress(0);
      } else {
        closeStory();
      }
    }
  };

  const prevSlide = () => {
    if (!activeGroup) return;

    if (activeSlideIndex > 0) {
      setActiveSlideIndex((prev) => prev - 1);
      setProgress(0);
    } else {
      // Move to previous group if available
      const currentGroupIndex = sortedGroups.findIndex(
        (g) => g.id === activeGroup.id
      );
      if (currentGroupIndex > 0) {
        const prevGroup = sortedGroups[currentGroupIndex - 1];
        const sortedSlides = [...prevGroup.slides].sort(
          (a, b) => a.order - b.order
        );
        setActiveGroup({
          ...prevGroup,
          slides: sortedSlides,
        });
        setActiveSlideIndex(prevGroup.slides.length - 1);
        setProgress(0);
      }
    }
  };

  // Handle horizontal scroll with mouse wheel
  useEffect(() => {
    const handleWheel = (e) => {
      if (storiesRef.current) {
        e.preventDefault();
        storiesRef.current.scrollLeft += e.deltaY;
      }
    };

    const currentRef = storiesRef.current;
    if (currentRef) {
      currentRef.addEventListener("wheel", handleWheel);
    }

    return () => {
      if (currentRef) {
        currentRef.removeEventListener("wheel", handleWheel);
      }
    };
  }, []);

  // Progress timer for auto-advancing slides
  useEffect(() => {
    if (!activeGroup) return;

    // Clear any existing timeout
    if (progressInterval.current) clearTimeout(progressInterval.current);

    setProgress(0); // Reset progress

    const startTime = Date.now();
    const duration = progressDuration;

    // Animate progress manually
    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const percentage = Math.min((elapsed / duration) * 100, 100);
      setProgress(percentage);

      if (percentage < 100) {
        progressInterval.current = setTimeout(updateProgress, 50); // Smooth update
      } else {
        nextSlide(); // Only called once
      }
    };

    updateProgress();

    return () => {
      if (progressInterval.current) clearTimeout(progressInterval.current);
    };
  }, [activeGroup, activeSlideIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!activeGroup) return;

      if (e.key === "ArrowRight" || e.key === " ") {
        nextSlide();
      } else if (e.key === "ArrowLeft") {
        prevSlide();
      } else if (e.key === "Escape") {
        closeStory();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeGroup, activeSlideIndex]);

  // Get current slide
  const currentSlide = activeGroup?.slides[activeSlideIndex];

  return (
    <div className="w-full bg-red-200 z-1000">
      <div
        ref={storiesRef}
        className="flex space-x-6 overflow-x-auto pb-6 pt-2 px-2"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {sortedGroups.map((group) => (
          <motion.div
            key={group.id}
            className="flex flex-col items-center snap-start"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleStoryClick(group)}
          >
            <div
              className="relative cursor-pointer transition-transform hover:scale-105 active:scale-95"
              style={{ padding: "2px" }}
            >
              {/* Animated ring around thumbnail */}
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `${group.ringColor || "#ffd500"}`,
                  padding: "2px",
                }}
              />

              {/* Thumbnail image */}
              <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-4 bg-white border-white z-10 transition-all duration-300">
                <img
                  src={group.thumbnail || "/placeholder.svg?height=96&width=96"}
                  alt={group.name}
                />
              </div>
            </div>

            {/* Story name */}
            <span
              className="text-sm font-medium text-center max-w-[90px] truncate"
              style={{ color: group.nameColor || "#000000" }}
            >
              {group.name}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Full-screen story modal */}
      <AnimatePresence>
        {activeGroup && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 sm:px-6 sm:py-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              background:
                "linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(20,20,30,0.95) 100%)",
              backdropFilter: "blur(10px)",
            }}
          >
            {/* Close button */}
            <motion.button
              onClick={closeStory}
              className="absolute top-4 right-4 z-50 text-white p-2 rounded-full bg-black/30 backdrop-blur-md hover:bg-black/50"
              aria-label="Close story"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-6 h-6" />
            </motion.button>

            {/* Progress bars */}
            <div className="absolute top-4 left-4 right-16 flex p-2 gap-1.5 z-50">
              {activeGroup.slides.map((_, index) => (
                <div
                  key={index}
                  className="h-1 bg-white/20 flex-1 rounded-full overflow-hidden backdrop-blur-sm"
                  style={{ boxShadow: "0 0 10px rgba(255,255,255,0.1)" }}
                >
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      width:
                        index === activeSlideIndex
                          ? `${progress}%`
                          : index < activeSlideIndex
                          ? "100%"
                          : "0%",
                      background: `linear-gradient(90deg, ${
                        activeGroup.ringColor || "#ffffff"
                      } 0%, ${adjustColor(
                        activeGroup.ringColor || "#ffffff",
                        30
                      )} 100%)`,
                    }}
                    initial={{
                      width:
                        index === activeSlideIndex
                          ? "0%"
                          : index < activeSlideIndex
                          ? "100%"
                          : "0%",
                    }}
                    animate={{
                      width:
                        index === activeSlideIndex
                          ? `${progress}%`
                          : index < activeSlideIndex
                          ? "100%"
                          : "0%",
                    }}
                    transition={{ ease: "linear" }}
                  />
                </div>
              ))}
            </div>

            {/* Navigation buttons */}
            <motion.button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-50 text-white p-3 rounded-full bg-black/30 backdrop-blur-md hover:bg-black/50"
              aria-label="Previous slide"
              whileHover={{ scale: 1.1, x: -5 }}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <ChevronLeft className="w-6 h-6" />
            </motion.button>

            <motion.button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-50 text-white p-3 rounded-full bg-black/30 backdrop-blur-md hover:bg-black/50"
              aria-label="Next slide"
              whileHover={{ scale: 1.1, x: 5 }}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <ChevronRight className="w-6 h-6" />
            </motion.button>

            {/* Story content */}
            <div className="relative w-full max-h-[90vh] sm:max-w-md mx-auto px-4 flex items-center justify-center">
              {currentSlide && (
                <motion.div
                  key={currentSlide.id}
                  className="relative w-full max-h-[90vh] flex flex-col items-center justify-center p-4 sm:p-6 overflow-y-auto"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  {/* Story image */}
                  <motion.div
                    className="relative w-full max-h-[75vh] rounded-xl overflow-hidden"
                    initial={{ y: 20 }}
                    animate={{ y: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <img
                      src={
                        currentSlide.image ||
                        "/placeholder.svg?height=800&width=400 "
                      }
                      alt={`Slide ${activeSlideIndex + 1}`}
                      width={500}
                      height={800}
                      className="w-full object-contain h-auto max-h-[60vh] sm:max-h-[75vh]"
                      priority
                    />
                  </motion.div>

                  {/* CTA button if link exists */}
                  <motion.a
                    href={currentSlide.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "mt-6 px-6 sm:px-8 py-2.5 sm:py-3 rounded-full font-medium flex items-center justify-center gap-2 shadow-lg text-sm sm:text-base text-center whitespace-nowrap",
                      "bg-white text-black hover:bg-opacity-90 transition-all"
                    )}
                    style={{
                      background: `linear-gradient(45deg, ${
                        activeGroup.ringColor || "#ffffff"
                      }, ${adjustColor(
                        activeGroup.ringColor || "#ffffff",
                        30
                      )})`,
                      color: getContrastColor(
                        activeGroup.ringColor || "#ffffff"
                      ),
                      boxShadow: `0 4px 20px rgba(0,0,0,0.2), 0 0 0 2px rgba(255,255,255,0.1)`,
                    }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <span className="truncate">{currentSlide.button_text}</span>
                    <ExternalLink className="w-4 h-4 shrink-0" />
                  </motion.a>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper function to adjust color brightness
function adjustColor(color, amount) {
  // Remove the # if it exists
  color = color.replace("#", "");

  // Parse the color
  let r = Number.parseInt(color.substring(0, 2), 16);
  let g = Number.parseInt(color.substring(2, 4), 16);
  let b = Number.parseInt(color.substring(4, 6), 16);

  // Adjust the color
  r = Math.min(255, Math.max(0, r + amount));
  g = Math.min(255, Math.max(0, g + amount));
  b = Math.min(255, Math.max(0, b + amount));

  // Convert back to hex
  return `#${r.toString(16).padStart(2, "0")}${g
    .toString(16)
    .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

// Helper function to determine text color based on background
function getContrastColor(hexColor) {
  // Remove the # if it exists
  hexColor = hexColor.replace("#", "");

  // Parse the color
  const r = Number.parseInt(hexColor.substring(0, 2), 16);
  const g = Number.parseInt(hexColor.substring(2, 4), 16);
  const b = Number.parseInt(hexColor.substring(4, 6), 16);

  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Return black for bright colors, white for dark colors
  return luminance > 0.5 ? "#000000" : "#ffffff";
}
