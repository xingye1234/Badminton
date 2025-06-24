"use client"

import { motion } from "framer-motion"
import { Card, type CardProps } from "@/components/ui/card"
import { forwardRef } from "react"

interface AnimatedCardProps extends CardProps {
  delay?: number
  direction?: "up" | "down" | "left" | "right"
  duration?: number
}

const AnimatedCard = forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ children, delay = 0, direction = "up", duration = 0.3, className, ...props }, ref) => {
    const getInitialPosition = () => {
      switch (direction) {
        case "up":
          return { y: 30, x: 0 }
        case "down":
          return { y: -30, x: 0 }
        case "left":
          return { y: 0, x: 30 }
        case "right":
          return { y: 0, x: -30 }
        default:
          return { y: 30, x: 0 }
      }
    }

    const initial = {
      opacity: 0,
      scale: 0.95,
      ...getInitialPosition(),
    }

    const animate = {
      opacity: 1,
      scale: 1,
      y: 0,
      x: 0,
    }

    const transition = {
      duration,
      delay,
      ease: [0.25, 0.46, 0.45, 0.94],
    }

    return (
      <motion.div
        ref={ref}
        initial={initial}
        animate={animate}
        transition={transition}
        whileHover={{
          scale: 1.02,
          transition: { duration: 0.2 },
        }}
        whileTap={{
          scale: 0.98,
          transition: { duration: 0.1 },
        }}
      >
        <Card className={className} {...props}>
          {children}
        </Card>
      </motion.div>
    )
  },
)

AnimatedCard.displayName = "AnimatedCard"

export { AnimatedCard }
