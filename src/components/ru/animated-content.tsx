"use client"

import { motion } from "framer-motion"
import { usePathname } from "next/navigation"
import type React from "react"

interface AnimatedContentProps {
  children: React.ReactNode
  className?: string
}

export function AnimatedContent({ children, className }: AnimatedContentProps) {
  const pathname = usePathname()

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
