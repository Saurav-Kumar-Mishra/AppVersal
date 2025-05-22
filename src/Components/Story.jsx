import { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight, X, ExternalLink } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { adjustColor } from '@/utils/Helper'
import { getContrastColor } from '@/utils/Helper'
import { cn } from '@/lib/utils.js'

export default function Stories({ data }) {
    const [paused, setPaused] = useState(false)
    const [activeGroup, setActiveGroup] = useState(null)
    const [activeSlideIndex, setActiveSlideIndex] = useState(0)
    const [progress, setProgress] = useState(0)
    const storiesRef = useRef(null)
    const progressInterval = useRef(null)
    const progressDuration = 5000 // 5 seconds per slide

    // Sort story groups by order
    const sortedGroups = [...data.details].sort((a, b) => a.order - b.order)

    const handleStoryClick = (group) => {
        // Sort slides by order
        const sortedSlides = [...group.slides].sort((a, b) => a.order - b.order)
        setActiveGroup({
            ...group,
            slides: sortedSlides,
        })
        setActiveSlideIndex(0)
        setProgress(0)
        document.body.style.overflow = 'hidden' // Prevent background scrolling
    }

    const closeStory = () => {
        setActiveGroup(null)
        document.body.style.overflow = '' // Restore scrolling
        if (progressInterval.current) {
            clearInterval(progressInterval.current)
        }
    }

    const nextSlide = () => {
        setPaused(false)

        if (!activeGroup) return
        if (activeSlideIndex < activeGroup.slides.length - 1) {
            setActiveSlideIndex((prev) => prev + 1)
            setProgress(0)
        } else {
            const currentGroupIndex = sortedGroups.findIndex(
                (g) => g.id === activeGroup.id
            )
            if (currentGroupIndex < sortedGroups.length - 1) {
                const nextGroup = sortedGroups[currentGroupIndex + 1]
                const sortedSlides = [...nextGroup.slides].sort(
                    (a, b) => a.order - b.order
                )
                setActiveGroup({ ...nextGroup, slides: sortedSlides })
                setActiveSlideIndex(0)
                setProgress(0)
            } else {
                closeStory()
            }
        }
    }

    const prevSlide = () => {
        setPaused(false)

        if (!activeGroup) return

        if (activeSlideIndex > 0) {
            setActiveSlideIndex((prev) => prev - 1)
            setProgress(0)
        } else {
            // Move to previous group if available
            const currentGroupIndex = sortedGroups.findIndex(
                (g) => g.id === activeGroup.id
            )
            if (currentGroupIndex > 0) {
                const prevGroup = sortedGroups[currentGroupIndex - 1]
                const sortedSlides = [...prevGroup.slides].sort(
                    (a, b) => a.order - b.order
                )
                setActiveGroup({
                    ...prevGroup,
                    slides: sortedSlides,
                })
                setActiveSlideIndex(prevGroup.slides.length - 1)
                setProgress(0)
            }
        }
    }

    // Handle horizontal scroll with mouse wheel
    useEffect(() => {
        const handleWheel = (e) => {
            if (storiesRef.current) {
                e.preventDefault()
                storiesRef.current.scrollLeft += e.deltaY
            }
        }

        const currentRef = storiesRef.current
        if (currentRef) {
            currentRef.addEventListener('wheel', handleWheel)
        }

        return () => {
            if (currentRef) {
                currentRef.removeEventListener('wheel', handleWheel)
            }
        }
    }, [])

    // Progress timer for auto-advancing slides
    useEffect(() => {
        if (!activeGroup || paused) return // don't run timer if paused or no story open

        if (progressInterval.current) clearTimeout(progressInterval.current)

        setProgress(0) // reset progress

        const startTime = Date.now()
        const duration = progressDuration

        const updateProgress = () => {
            const elapsed = Date.now() - startTime
            const percentage = Math.min((elapsed / duration) * 100, 100)
            setProgress(percentage)

            if (percentage < 100 && !paused) {
                // also check paused again here
                progressInterval.current = setTimeout(updateProgress, 50)
            } else if (percentage >= 100) {
                nextSlide()
            }
        }

        updateProgress()

        return () => {
            if (progressInterval.current) clearTimeout(progressInterval.current)
        }
    }, [activeGroup, activeSlideIndex, paused])

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!activeGroup) return

            if (e.key === 'ArrowRight' || e.key === ' ') {
                nextSlide()
            } else if (e.key === 'ArrowLeft') {
                prevSlide()
            } else if (e.key === 'Escape') {
                closeStory()
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => {
            window.removeEventListener('keydown', handleKeyDown)
        }
    }, [activeGroup, activeSlideIndex])

    // Get current slide
    const currentSlide = activeGroup?.slides[activeSlideIndex]

    return (
        <div className="w-full">
            <div
                ref={storiesRef}
                className="flex space-x-6 md:justify-center overflow-x-auto pb-6 pt-2 px-2"
                style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
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
                            className="relative cursor-pointer transition-transform hover:scale-105 active:scale-95 "
                            style={{ padding: '2px' }}
                        >
                            {/* Animated ring around thumbnail */}
                            <div
                                className="absolute inset-0 rounded-full"
                                style={{
                                    background: `${
                                        group.ringColor || '#ffd500'
                                    }`,
                                    padding: '2px',
                                }}
                            />

                            {/* Thumbnail image */}
                            <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 rounded-full overflow-hidden border-4 bg-white border-white z-10 transition-all duration-300">
                                <img
                                    src={group.thumbnail || '/placeholder.svg'}
                                    alt={group.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>

                        {/* Story name */}
                        <span
                            className="text-sm font-medium text-center max-w-[90px] truncate"
                            style={{ color: group.nameColor || '#000000' }}
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
                        className="fixed inset-0 z-50  flex items-center justify-center px-4 py-6 sm:px-6 sm:py-10"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{
                            background:
                                'linear-gradient(135deg, rgba(0,0,0,0.75) 0%, rgba(20,20,30,0.95) 100%)',
                            backdropFilter: 'blur(10px)',
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
                                    className="relative w-full max-h-[90vh] flex flex-col items-center justify-center p-4 sm:p-6 overflow-y-auto "
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{
                                        duration: 0.3,
                                        ease: 'easeOut',
                                    }}
                                >
                                    {/* Story image */}
                                    <motion.div
                                        className="relative w-full max-h-[75vh] overflow-hidden "
                                        initial={{ y: 20 }}
                                        animate={{ y: 0 }}
                                        transition={{
                                            type: 'spring',
                                            stiffness: 300,
                                            damping: 20,
                                        }}
                                    >
                                        {/* Progress bars */}
                                        <div className=" top-0  w-full max-w-md flex p-3 gap-1.5 z-50">
                                            {activeGroup.slides.map(
                                                (_, index) => (
                                                    <div
                                                        key={index}
                                                        className="h-1 bg-white/20 flex-1 rounded-full overflow-hidden backdrop-blur-sm"
                                                        style={{
                                                            boxShadow:
                                                                '0 0 10px rgba(255,255,+255,255)',
                                                        }}
                                                    >
                                                        <motion.div
                                                            className="h-full rounded-full"
                                                            style={{
                                                                width:
                                                                    index ===
                                                                    activeSlideIndex
                                                                        ? `${progress}%`
                                                                        : index <
                                                                          activeSlideIndex
                                                                        ? '100%'
                                                                        : '0%',

                                                                backgroundColor:
                                                                    '#ffffff',
                                                            }}
                                                            initial={{
                                                                width:
                                                                    index ===
                                                                    activeSlideIndex
                                                                        ? '0%'
                                                                        : index <
                                                                          activeSlideIndex
                                                                        ? '100%'
                                                                        : '0%',
                                                            }}
                                                            animate={{
                                                                width:
                                                                    index ===
                                                                    activeSlideIndex
                                                                        ? `${progress}%`
                                                                        : index <
                                                                          activeSlideIndex
                                                                        ? '100%'
                                                                        : '0%',
                                                            }}
                                                            transition={{
                                                                ease: 'linear',
                                                            }}
                                                        />
                                                    </div>
                                                )
                                            )}
                                        </div>
                                        <div></div>
                                        {/* Pause/Play button */}
                                        <motion.button
                                            onClick={() => setPaused(!paused)}
                                            className="absolute top-9 right-2 z-50 text-white p-2 rounded-full bg-black/30 backdrop-blur-md hover:bg-black/50"
                                            aria-label={
                                                paused
                                                    ? 'Play story'
                                                    : 'Pause story'
                                            }
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                        >
                                            {paused ? (
                                                // Play icon (you can use any icon or SVG here)
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-6 w-6"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                    strokeWidth={2}
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M14.752 11.168l-6.5-3.75v7.5l6.5-3.75z"
                                                    />
                                                </svg>
                                            ) : (
                                                // Pause icon
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-6 w-6"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                    strokeWidth={2}
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M10 9v6m4-6v6"
                                                    />
                                                </svg>
                                            )}
                                        </motion.button>
                                        <div className="overflow-hidden rounded-3xl max-h-[60vh] sm:max-h-[65vh]">
                                            <img
                                                src={
                                                    currentSlide.image ||
                                                    '/placeholder.svg?height=800&width=400'
                                                }
                                                alt={`Slide ${
                                                    activeSlideIndex + 1
                                                }`}
                                                width={500}
                                                height={800}
                                                className="w-full object-fill h-auto max-h-[60vh] sm:max-h-[75vh]"
                                                priority
                                            />
                                        </div>
                                    </motion.div>

                                    {/* CTA button if link exists */}
                                    <motion.a
                                        href={currentSlide.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={cn(
                                            'mt-6 px-6 sm:px-8 py-2.5 sm:py-3 rounded-full font-medium flex items-center justify-center gap-2 shadow-lg text-sm sm:text-base text-center whitespace-nowrap',
                                            'bg-white text-black hover:bg-opacity-90 transition-all'
                                        )}
                                        style={{
                                            background: `linear-gradient(45deg, ${
                                                activeGroup.ringColor ||
                                                '#ffffff'
                                            }, ${adjustColor(
                                                activeGroup.ringColor ||
                                                    '#ffffff',
                                                30
                                            )})`,
                                            color: getContrastColor(
                                                activeGroup.ringColor ||
                                                    '#ffffff'
                                            ),
                                            boxShadow: `0 4px 20px rgba(0,0,0,0.2), 0 0 0 2px rgba(255,255,255,0.1)`,
                                        }}
                                        whileHover={{ scale: 1.05, y: -2 }}
                                        whileTap={{ scale: 0.98 }}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        <span className="truncate">
                                            {currentSlide.button_text}
                                        </span>
                                        <ExternalLink className="w-4 h-4 shrink-0" />
                                    </motion.a>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

