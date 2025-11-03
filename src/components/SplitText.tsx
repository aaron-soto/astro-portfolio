import { motion } from "framer-motion";

interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  staggerDelay?: number;
  type?: "char" | "word" | "line";
}

export default function SplitText({
  text,
  className = "",
  delay = 0,
  duration = 0.5,
  staggerDelay = 0.015,
  type = "char",
}: SplitTextProps) {
  // Split text based on type
  const getSegments = () => {
    switch (type) {
      case "char":
        return text.split("");
      case "word":
        return text.split(" ");
      case "line":
        return text.split("\n");
      default:
        return text.split("");
    }
  };

  const segments = getSegments();

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: delay,
      },
    }),
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        damping: 12,
        stiffness: 100,
        duration: duration,
      },
    },
    hidden: {
      opacity: 0,
      y: 20,
    },
  };

  return (
    <motion.span
      className={className}
      variants={container}
      initial="hidden"
      animate="visible"
    >
      {segments.map((segment, index) => (
        <motion.span
          key={index}
          variants={child}
          style={{
            display: type === "line" ? "block" : "inline-block",
            marginRight: type === "word" ? "0.25em" : "0",
            whiteSpace: segment === " " && type === "char" ? "pre" : "normal",
          }}
        >
          {segment === " " && type === "char" ? "\u00A0" : segment}
          {type === "word" && index < segments.length - 1 ? " " : ""}
        </motion.span>
      ))}
    </motion.span>
  );
}
