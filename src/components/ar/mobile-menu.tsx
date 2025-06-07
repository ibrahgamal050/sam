"use client"

import { useState } from "react"
import { Menu, X, Home, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"



export function MobileMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  // Adjust animation direction based on language direction

 

  return (
    <>
      <Button variant="ghost" size="icon" className="text-white bg-[#6d28d9]  " onClick={toggleMenu}>
        {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="  h-5 w-5" />}
        <span className="sr-only">{isMenuOpen ? "إغلاق القائمة": "فتح القائمة"}</span>
      </Button>

      {/* Sliding Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{x: "100%"}}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={`fixed top-[56px] right-0 w-64 h-[calc(100vh-56px)] bg-purple-50 border-r z-40 overflow-y-auto`}
          >
            <nav className="p-4">
              <ul className="space-y-2">
                <li>
                  <Link
                    href={`/ar/`}
                    className="flex items-center gap-2 p-2 text-black rounded-md hover:bg-muted transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Home className="h-5 w-5" />
                    <span>الرئيسية</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/ar/about`}
                    className="flex items-center gap-2 p-2 rounded-md text-black   hover:bg-muted transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Info className="h-5 w-5" />
                    <span>عن المطعم</span>
                  </Link>
                </li>
              </ul>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transparent overlay when menu is open */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black z-30"
            onClick={toggleMenu}
          />
        )}
      </AnimatePresence>
    </>
  )
}
