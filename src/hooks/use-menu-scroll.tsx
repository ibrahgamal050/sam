"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import type { RefObject } from "react"
import type { ICategory, CategoryRef } from "@/types/menu"

interface MenuScrollProps {
  categories: ICategory[]
  headerRef: RefObject<HTMLDivElement | null>
  footerRef: RefObject<HTMLDivElement | null>
  sidebarRef: RefObject<HTMLDivElement | null>
}

export function useMenuScroll({ categories, headerRef, footerRef, sidebarRef }: MenuScrollProps) {
  // State for tracking active category
  const initialCategory =
    categories.length > 0 && categories[0]._id ? categories[0]._id.toString() : ""
  const [activeCategory, setActiveCategory] = useState<string>(initialCategory)

  // State for tracking if header is sticky
  const [isHeaderSticky, setIsHeaderSticky] = useState(false)

  // State for tracking sidebar bottom position
  const [sidebarBottom, setSidebarBottom] = useState<number | null>(null)

  // Create refs for each category - using the proper type
  const categoryRefs = useRef<{ [key: string]: CategoryRef }>({})

  // Store the last known header height for consistent calculations
  const headerHeightRef = useRef<number>(0)

  // Store animation ID for cleanup
  const scrollAnimationRef = useRef<number | null>(null)

  // Store previous values to prevent unnecessary updates
  const prevValuesRef = useRef({
    isHeaderSticky: false,
    sidebarBottom: null as number | null,
    activeCategory: initialCategory,
    })

  // Initialize category refs
  useEffect(() => {
    categoryRefs.current = categories.reduce((acc, category) => {
      if (category._id) {
        return { ...acc, [category._id.toString()]: null }
      }
      return acc
    }, {})
  }, [categories])

  // Calculate header height whenever it changes
  useEffect(() => {
    const updateHeaderHeight = () => {
      if (headerRef.current) {
        headerHeightRef.current = headerRef.current.offsetHeight
      }
    }

    // Initial calculation
    updateHeaderHeight()

    // Set up resize observer to recalculate when header size changes
    const resizeObserver = new ResizeObserver(updateHeaderHeight)
    if (headerRef.current) {
      resizeObserver.observe(headerRef.current)
    }

    return () => {
      resizeObserver.disconnect()
    }
  }, [headerRef])

  // Enhanced scrollToCategory function with smooth animation and dynamic offset
  const scrollToCategory = useCallback(
    (categoryId: string) => {
      const targetElement = categoryRefs.current[categoryId]
      if (!targetElement) return

      // Cancel any ongoing scroll animation
      if (scrollAnimationRef.current !== null) {
        cancelAnimationFrame(scrollAnimationRef.current)
      }

      // Calculate dynamic offset based on header and other fixed elements
      const calculateOffset = () => {
        let offset = 16 // Base padding

        // Add header height if it's sticky
        if (headerRef.current && window.getComputedStyle(headerRef.current).position === "fixed") {
          offset += headerRef.current.offsetHeight
        }

        // Check for any other fixed elements that might affect scrolling
        const fixedElements = document.querySelectorAll('[data-fixed="true"]')
        fixedElements.forEach((el) => {
          if (el instanceof HTMLElement) {
            offset += el.offsetHeight
          }
        })

        return offset
      }

      const offset = calculateOffset()

      // Get the target position with offset
      const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - offset

      // Current scroll position
      const startPosition = window.scrollY

      // Distance to scroll
      const distance = targetPosition - startPosition

      // Duration in milliseconds
      const duration = 800

      // Easing function for smooth animation
      const easeInOutQuad = (t: number) => {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
      }

      let startTime: number | null = null

      // Animation function
      const animateScroll = (timestamp: number) => {
        if (!startTime) startTime = timestamp
        const elapsed = timestamp - startTime

        // Calculate progress (0 to 1)
        const progress = Math.min(elapsed / duration, 1)

        // Apply easing
        const easedProgress = easeInOutQuad(progress)

        // Set the new scroll position
        window.scrollTo(0, startPosition + distance * easedProgress)

        // Continue animation if not complete
        if (progress < 1) {
          scrollAnimationRef.current = requestAnimationFrame(animateScroll)
        } else {
          // Animation complete
          scrollAnimationRef.current = null

          // Add visual indication of target (optional)
          targetElement.classList.add("scroll-highlight")
          setTimeout(() => {
            targetElement.classList.remove("scroll-highlight")
          }, 1000)
        }
      }

      // Start the animation
      scrollAnimationRef.current = requestAnimationFrame(animateScroll)

      // Update active category
      setActiveCategory(categoryId)
      prevValuesRef.current.activeCategory = categoryId
    },
    [headerRef],
  )

  // Track scroll position to update active category
  useEffect(() => {
    let ticking = false

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          // Check if header is sticky
          if (headerRef.current) {
            const headerRect = headerRef.current.getBoundingClientRect()
            const newIsHeaderSticky = headerRect.top <= 0

            // Only update if value has changed
            if (newIsHeaderSticky !== prevValuesRef.current.isHeaderSticky) {
              prevValuesRef.current.isHeaderSticky = newIsHeaderSticky
              setIsHeaderSticky(newIsHeaderSticky)
            }
          }

          // Update sidebar bottom position
          if (sidebarRef.current && footerRef.current) {
            const footerRect = footerRef.current.getBoundingClientRect()
            const viewportHeight = window.innerHeight

            const newSidebarBottom = footerRect.top < viewportHeight ? viewportHeight - footerRect.top : null

            // Only update if value has changed significantly (more than 1px difference)
            const prevBottom = prevValuesRef.current.sidebarBottom
            if (
              (newSidebarBottom === null && prevBottom !== null) ||
              (newSidebarBottom !== null && prevBottom === null) ||
              (newSidebarBottom !== null && prevBottom !== null && Math.abs(newSidebarBottom - prevBottom) > 1)
            ) {
              prevValuesRef.current.sidebarBottom = newSidebarBottom
              setSidebarBottom(newSidebarBottom)
            }
          }

          // Determine active category based on scroll position
          const scrollPosition = window.scrollY + (headerHeightRef.current + 50) // Add offset for better UX

          // Get all category elements and their positions
          const categoryPositions = Object.entries(categoryRefs.current)
            .filter(([_, element]) => element !== null)
            .map(([id, element]) => ({
              id,
              position: element!.getBoundingClientRect().top + window.scrollY,
            }))
            .sort((a, b) => a.position - b.position)

          // Find the active category (the last one that's above the scroll position)
          let activeId: string | null = null

          for (const { id, position } of categoryPositions) {
            if (position <= scrollPosition) {
              activeId = id
            } else {
              break
            }
          }

          // If we're at the very top, use the first category
          if (!activeId && categoryPositions.length > 0) {
            activeId = categoryPositions[0].id
          }

          // Update active category if it changed
          if (activeId && activeId !== prevValuesRef.current.activeCategory) {
            prevValuesRef.current.activeCategory = activeId
            setActiveCategory(activeId)
          }

          ticking = false
        })

        ticking = true
      }
    }

    // Initial check
    handleScroll()

    // Add scroll listener
    window.addEventListener("scroll", handleScroll, { passive: true })

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [headerRef, footerRef, sidebarRef]) // Remove activeCategory from dependencies

  // Clean up animation on unmount
  useEffect(() => {
    return () => {
      if (scrollAnimationRef.current !== null) {
        cancelAnimationFrame(scrollAnimationRef.current)
      }
    }
  }, [])

  return {
    activeCategory,
    categoryRefs: categoryRefs.current,
    isHeaderSticky,
    sidebarBottom,
    scrollToCategory,
  }
}
