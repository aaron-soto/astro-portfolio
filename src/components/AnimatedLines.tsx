import React, { useEffect, useState } from "react";

interface Circle {
  id: number;
  column: number;
  top: number;
  animationDuration: number;
  delay: number;
}

const AnimatedLines: React.FC = () => {
  const [circles, setCircles] = useState<Circle[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const totalColumns = isMobile ? 4 : 8;
  const totalLines = totalColumns + 1; // Number of actual border lines

  const createCircle = (): Circle => {
    return {
      id: Math.random(),
      column: Math.floor(Math.random() * totalLines), // Now selecting from actual lines
      top: -10, // Start above viewport
      animationDuration: 3 + Math.random() * 4, // 3-7 seconds (shorter for more visible activity)
      delay: Math.random() * 0.5, // 0-0.5 seconds delay
    };
  };

  useEffect(() => {
    const interval = setInterval(
      () => {
        // Add a new circle every 200-500ms (much more frequent)
        const newCircle = createCircle();
        setCircles((prev) => [...prev, newCircle]);

        // Clean up old circles after they've animated
        setTimeout(
          () => {
            setCircles((prev) =>
              prev.filter((circle) => circle.id !== newCircle.id)
            );
          },
          (newCircle.animationDuration + newCircle.delay) * 1000 + 1000
        );
      },
      200 + Math.random() * 300
    ); // Much more frequent: every 200-500ms

    return () => clearInterval(interval);
  }, [totalLines]);

  return (
    <>
      <style>
        {`
          @keyframes slideDown {
            from {
              top: -10px;
              opacity: 0;
            }
            10% {
              opacity: 1;
            }
            90% {
              opacity: 1;
            }
            to {
              top: 100vh;
              opacity: 0;
            }
          }
        `}
      </style>
      <div className="pointer-events-none fixed inset-0 -z-10">
        {/* Background gradient */}
        <div className="absolute inset-x-0 top-0 h-[10vh] bg-linear-to-t from-transparent to-black"></div>

        {/* Vertical lines container */}
        <div className="relative mx-auto grid h-full w-full max-w-[1200px] grid-cols-4 gap-0 px-4 md:grid-cols-8">
          {/* Mobile: 4 columns */}
          <div className="border-lines relative border-r border-l">
            {/* Left border circles */}
            {circles
              .filter((c) => c.column === 0)
              .map((circle) => (
                <div
                  key={circle.id}
                  className="bg-primary/80 absolute size-1 rounded-full"
                  style={{
                    left: "0px",
                    transform: "translateX(-50%)",
                    animation: `slideDown ${circle.animationDuration}s ease-in-out ${circle.delay}s forwards`,
                  }}
                />
              ))}
            {/* Right border circles */}
            {circles
              .filter((c) => c.column === 1)
              .map((circle) => (
                <div
                  key={circle.id}
                  className="bg-primary/80 absolute size-1 rounded-full"
                  style={{
                    right: "0px",
                    transform: "translateX(50%)",
                    animation: `slideDown ${circle.animationDuration}s ease-in-out ${circle.delay}s forwards`,
                  }}
                />
              ))}
          </div>
          <div className="border-lines relative border-r">
            {circles
              .filter((c) => c.column === 2)
              .map((circle) => (
                <div
                  key={circle.id}
                  className="bg-primary/80 absolute size-1 rounded-full"
                  style={{
                    right: "0px",
                    transform: "translateX(50%)",
                    animation: `slideDown ${circle.animationDuration}s ease-in-out ${circle.delay}s forwards`,
                  }}
                />
              ))}
          </div>
          <div className="border-lines relative border-r">
            {circles
              .filter((c) => c.column === 3)
              .map((circle) => (
                <div
                  key={circle.id}
                  className="bg-primary/80 absolute size-1 rounded-full"
                  style={{
                    right: "0px",
                    transform: "translateX(50%)",
                    animation: `slideDown ${circle.animationDuration}s ease-in-out ${circle.delay}s forwards`,
                  }}
                />
              ))}
          </div>
          <div className="border-lines relative border-r">
            {circles
              .filter((c) => c.column === 4)
              .map((circle) => (
                <div
                  key={circle.id}
                  className="bg-primary/80 absolute size-1 rounded-full"
                  style={{
                    right: "0px",
                    transform: "translateX(50%)",
                    animation: `slideDown ${circle.animationDuration}s ease-in-out ${circle.delay}s forwards`,
                  }}
                />
              ))}
          </div>
          {/* Desktop: Additional 4 columns */}
          <div className="border-lines relative hidden border-r md:block">
            {circles
              .filter((c) => c.column === 5)
              .map((circle) => (
                <div
                  key={circle.id}
                  className="bg-primary/80 absolute size-1 rounded-full"
                  style={{
                    right: "0px",
                    transform: "translateX(50%)",
                    animation: `slideDown ${circle.animationDuration}s ease-in-out ${circle.delay}s forwards`,
                  }}
                />
              ))}
          </div>
          <div className="border-lines relative hidden border-r md:block">
            {circles
              .filter((c) => c.column === 6)
              .map((circle) => (
                <div
                  key={circle.id}
                  className="bg-primary/80 absolute size-1 rounded-full"
                  style={{
                    right: "0px",
                    transform: "translateX(50%)",
                    animation: `slideDown ${circle.animationDuration}s ease-in-out ${circle.delay}s forwards`,
                  }}
                />
              ))}
          </div>
          <div className="border-lines relative hidden border-r md:block">
            {circles
              .filter((c) => c.column === 7)
              .map((circle) => (
                <div
                  key={circle.id}
                  className="bg-primary/80 absolute size-1 rounded-full"
                  style={{
                    right: "0px",
                    transform: "translateX(50%)",
                    animation: `slideDown ${circle.animationDuration}s ease-in-out ${circle.delay}s forwards`,
                  }}
                />
              ))}
          </div>
          <div className="border-lines relative hidden border-r md:block">
            {circles
              .filter((c) => c.column === 8)
              .map((circle) => (
                <div
                  key={circle.id}
                  className="bg-primary/80 absolute size-1 rounded-full"
                  style={{
                    right: "0px",
                    transform: "translateX(50%)",
                    animation: `slideDown ${circle.animationDuration}s ease-in-out ${circle.delay}s forwards`,
                  }}
                />
              ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default AnimatedLines;
