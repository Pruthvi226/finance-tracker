import { useEffect } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

interface AnimatedCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
  className?: string;
}

export const AnimatedCounter = ({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  duration = 1.5,
  className = "",
}: AnimatedCounterProps) => {
  const springValue = useSpring(0, {
    duration: duration * 1000,
    bounce: 0,
  });

  useEffect(() => {
    springValue.set(value);
  }, [value, springValue]);

  const displayValue = useTransform(springValue, (current) => {
    return `${prefix}${current.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}${suffix}`;
  });

  return <motion.span className={className}>{displayValue}</motion.span>;
};
