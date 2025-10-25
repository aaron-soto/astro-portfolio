import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useState } from "react";

import type { PanInfo } from "framer-motion";

interface Project {
  id: string;
  title: string;
  description: string;
  logo?: string;
  url?: string;
  slug: string;
  tags?: string[];
}

interface ProjectsCarouselProps {
  projects: Project[];
  shatteredImg: string;
}

export default function ProjectsCarousel({
  projects,
  shatteredImg,
}: ProjectsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    if (newDirection === 1) {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % projects.length);
    } else {
      setCurrentIndex(
        (prevIndex) => (prevIndex - 1 + projects.length) % projects.length
      );
    }
  };

  const handleDragEnd = (e: any, { offset, velocity }: PanInfo) => {
    const swipe = swipePower(offset.x, velocity.x);

    if (swipe < -swipeConfidenceThreshold) {
      paginate(1);
    } else if (swipe > swipeConfidenceThreshold) {
      paginate(-1);
    }
  };

  const goToSlide = (index: number) => {
    const newDirection = index > currentIndex ? 1 : -1;
    setDirection(newDirection);
    setCurrentIndex(index);
  };

  return (
    <div className="relative overflow-hidden">
      <div className="relative flex h-[600px] items-center justify-center">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={handleDragEnd}
            className="absolute inset-0 cursor-grab active:cursor-grabbing"
          >
            <div className="grid h-full grid-cols-4 items-center px-4 md:grid-cols-8">
              <div className="relative z-0 col-span-4 flex aspect-video w-full items-center justify-center overflow-hidden bg-neutral-900 md:col-span-4">
                <div className="absolute inset-0">
                  <img
                    src={shatteredImg}
                    alt="Shattered glass effect"
                    className="relative z-20 h-full w-full object-cover opacity-70"
                    style={{
                      backgroundRepeat: "repeat",
                      backgroundSize: "auto",
                    }}
                  />
                </div>

                {projects[currentIndex]?.logo && (
                  <motion.div
                    className="z-30 w-fit rounded-full bg-white p-2 drop-shadow-2xl"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  >
                    <img
                      src={projects[currentIndex].logo}
                      alt={`${projects[currentIndex].title} logo`}
                      className="relative z-20 size-24 object-cover drop-shadow-2xl md:size-48"
                    />
                  </motion.div>
                )}
              </div>

              <motion.div
                className="col-span-4 mt-8 flex flex-col md:col-span-3 md:col-start-6 md:mt-0"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <span className="text-foreground-muted">
                  {projects[currentIndex]?.tags &&
                  projects[currentIndex].tags![0]
                    ? projects[currentIndex].tags![0].toLowerCase()
                    : "project"}
                </span>

                <motion.h3
                  className="mb-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {projects[currentIndex]?.title}
                </motion.h3>

                <motion.p
                  className="text-primary/75"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {projects[currentIndex]?.description}
                </motion.p>

                <motion.div
                  className="mt-4 flex flex-col gap-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  {projects[currentIndex]?.url && (
                    <a
                      href={projects[currentIndex].url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:border-primary hover:text-primary border-lines w-full border bg-black py-2.5 text-center transition-all"
                    >
                      view website
                    </a>
                  )}
                  <a
                    href={`/projects/${projects[currentIndex]?.slug}`}
                    className="border-lines w-full border bg-neutral-950 py-2.5 text-center transition-all hover:bg-neutral-900"
                  >
                    about the project
                  </a>
                </motion.div>

                <div className="mt-8 flex w-full gap-4">
                  {projects.map((_, i) => (
                    <motion.div
                      key={i}
                      className={`mt-6 h-1 flex-1 ${i === currentIndex ? "bg-primary" : "bg-lines"}`}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: 0.5 + i * 0.1 }}
                    />
                  ))}
                </div>

                <motion.div
                  className="mt-4 flex justify-between gap-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <button
                    onClick={() => paginate(-1)}
                    className="border-lines flex-1 border bg-neutral-950 px-6 py-2 transition-all hover:bg-neutral-900"
                  >
                    ← Previous
                  </button>
                  <button
                    onClick={() => paginate(1)}
                    className="border-lines flex-1 border bg-neutral-950 px-6 py-2 transition-all hover:bg-neutral-900"
                  >
                    Next →
                  </button>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dot indicators */}
      <div className="mt-6 flex justify-center gap-2">
        {projects.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2 rounded-none transition-all duration-300 ${
              index === currentIndex ? "bg-primary w-8" : "bg-lines w-2"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
