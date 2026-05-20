"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface MenuTabsProps {
  dir?: "rtl" | "ltr"
  categories: Array<{
    id: string
    title: string
  }>
  activeId?: string
  onChange: (id: string) => void
}

type ScrollState = {
  hasOverflow: boolean
  canScrollBackward: boolean
  canScrollForward: boolean
}

const INITIAL_SCROLL_STATE: ScrollState = {
  hasOverflow: false,
  canScrollBackward: false,
  canScrollForward: false,
}

const SCROLL_EPSILON = 2
const SCROLL_DURATION_MS = 16

const getDocumentDir = (): "rtl" | "ltr" => {
  if (typeof document === "undefined") return "ltr"
  const docDir = document.dir || document.documentElement.getAttribute("dir")
  return docDir === "rtl" ? "rtl" : "ltr"
}

const getLogicalScrollLeft = (node: HTMLElement, dir: "rtl" | "ltr") => {
  if (dir !== "rtl") {
    return node.scrollLeft
  }

  const max = node.scrollWidth - node.clientWidth
  const scrollLeft = node.scrollLeft

  if (scrollLeft < 0) {
    return -scrollLeft
  }

  return max - scrollLeft
}

const scrollByLogical = (node: HTMLElement, dir: "rtl" | "ltr", delta: number) => {
  const multiplier = dir === "rtl" ? -1 : 1
  node.scrollBy({
    left: delta * multiplier,
    behavior: "smooth",
  })
}

export function MenuTabs({ dir, categories, activeId, onChange }: MenuTabsProps) {
  const effectiveDir = dir ?? getDocumentDir()
  const isRtl = effectiveDir === "rtl"
  const containerRef = useRef<HTMLDivElement | null>(null)
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])
  const [scrollState, setScrollState] = useState<ScrollState>(INITIAL_SCROLL_STATE)

  const activeIndex = useMemo(() => {
    if (!categories.length) return -1
    if (activeId) {
      const idx = categories.findIndex((category) => category.id === activeId)
      if (idx >= 0) return idx
    }
    return 0
  }, [categories, activeId])

  const [focusIndex, setFocusIndex] = useState(() => (activeIndex >= 0 ? activeIndex : 0))

  useEffect(() => {
    if (activeIndex >= 0) {
      setFocusIndex(activeIndex)
    }
  }, [activeIndex])

  const updateScrollState = useCallback(() => {
    const container = containerRef.current
    if (!container) {
      setScrollState(INITIAL_SCROLL_STATE)
      return
    }

    const maxScroll = Math.max(0, container.scrollWidth - container.clientWidth)
    const logicalLeft = getLogicalScrollLeft(container, effectiveDir)
    const atStart = logicalLeft <= SCROLL_EPSILON
    const atEnd = logicalLeft >= maxScroll - SCROLL_EPSILON

    setScrollState({
      hasOverflow: maxScroll > SCROLL_EPSILON,
      canScrollBackward: !atStart,
      canScrollForward: !atEnd,
    })
  }, [effectiveDir])

  useEffect(() => {
    updateScrollState()
  }, [categories, updateScrollState])

  useEffect(() => {
    tabRefs.current.length = categories.length
  }, [categories.length])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    updateScrollState()
    const handleScroll = () => updateScrollState()
    const handleResize = () => updateScrollState()

    container.addEventListener("scroll", handleScroll, { passive: true })
    window.addEventListener("resize", handleResize)

    let observer: ResizeObserver | null = null
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(() => updateScrollState())
      observer.observe(container)
    }

    return () => {
      container.removeEventListener("scroll", handleScroll)
      window.removeEventListener("resize", handleResize)
      observer?.disconnect()
    }
  }, [updateScrollState])

  const centerTab = useCallback(
    (index: number, behavior: ScrollBehavior = "smooth") => {
      const container = containerRef.current
      const tab = tabRefs.current[index]
      if (!container || !tab) return

      window.setTimeout(() => {
        tab.scrollIntoView({
          inline: "center",
          block: "nearest",
          behavior,
        })
      }, SCROLL_DURATION_MS)
    },
    [],
  )

  useEffect(() => {
    if (activeIndex < 0) return
    centerTab(activeIndex)
  }, [activeIndex, centerTab])

  const handleTabClick = useCallback(
    (index: number) => {
      const category = categories[index]
      if (!category) return
      onChange(category.id)
      setFocusIndex(index)
    },
    [categories, onChange],
  )

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
      if (!categories.length) return

      if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        event.preventDefault()
        const increment =
          event.key === "ArrowRight"
            ? isRtl
              ? -1
              : 1
            : isRtl
              ? 1
              : -1
        let nextIndex = (index + increment + categories.length) % categories.length
        setFocusIndex(nextIndex)
        const nextTab = tabRefs.current[nextIndex]
        if (nextTab) {
          nextTab.focus()
          centerTab(nextIndex)
        }
        return
      }

      if (event.key === "Home") {
        event.preventDefault()
        const firstIndex = 0
        setFocusIndex(firstIndex)
        const firstTab = tabRefs.current[firstIndex]
        firstTab?.focus()
        centerTab(firstIndex)
        return
      }

      if (event.key === "End") {
        event.preventDefault()
        const lastIndex = categories.length - 1
        setFocusIndex(lastIndex)
        const lastTab = tabRefs.current[lastIndex]
        lastTab?.focus()
        centerTab(lastIndex)
        return
      }

      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault()
        handleTabClick(index)
      }
    },
    [categories.length, centerTab, handleTabClick, isRtl],
  )

  const scrollByStep = useCallback(
    (direction: "forward" | "backward") => {
      const container = containerRef.current
      if (!container) return
      const amount = container.clientWidth * 0.6 || 240
      const delta = direction === "forward" ? amount : -amount
      scrollByLogical(container, effectiveDir, delta)
    },
    [effectiveDir],
  )

  const handleScrollBackward = useCallback(() => scrollByStep("backward"), [scrollByStep])
  const handleScrollForward = useCallback(() => scrollByStep("forward"), [scrollByStep])

  if (!categories.length) {
    return null
  }

  const showStartControls = scrollState.hasOverflow && scrollState.canScrollBackward
  const showEndControls = scrollState.hasOverflow && scrollState.canScrollForward

  return (
    <div className="relative w-full" dir={effectiveDir}>
      <div className="relative">
        <button
          type="button"
          onClick={handleScrollBackward}
          aria-label={isRtl ? "تمرير يمين" : "تمرير يسار"}
          className={`absolute inset-y-0 z-20 flex items-center justify-center rounded-full bg-white/90 p-1 shadow transition-opacity duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6c5ce7] ${
            isRtl ? "right-1" : "left-1"
          } ${showStartControls ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
        >
          {isRtl ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>

        <button
          type="button"
          onClick={handleScrollForward}
          aria-label={isRtl ? "تمرير يسار" : "تمرير يمين"}
          className={`absolute inset-y-0 z-20 flex items-center justify-center rounded-full bg-white/90 p-1 shadow transition-opacity duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6c5ce7] ${
            isRtl ? "left-1" : "right-1"
          } ${showEndControls ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
        >
          {isRtl ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </button>

        <div
          ref={containerRef}
          role="tablist"
          aria-orientation="horizontal"
          className="relative flex gap-2 overflow-x-auto scroll-smooth snap-x snap-mandatory px-2 py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {categories.map((category, index) => {
            const tabId = `menu-tab-${category.id}`
            const panelId = `menu-panel-${category.id}`
            const isActive = activeIndex === index
            const isFocused = focusIndex === index

            return (
              <button
                key={category.id}
                ref={(node) => {
                  tabRefs.current[index] = node
                }}
                id={tabId}
                role="tab"
                type="button"
                aria-selected={isActive}
                aria-controls={panelId}
                tabIndex={isFocused ? 0 : -1}
                className={`snap-center whitespace-nowrap rounded-2xl border px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6c5ce7] ${
                  isActive
                    ? "border-[#6c5ce7] bg-[#6c5ce7]/10 text-[#6c5ce7] shadow-[0_10px_25px_-20px_rgba(108,92,231,0.8)]"
                    : "border-gray-200 bg-white text-gray-600 hover:border-[#6c5ce7]/40 hover:text-[#6c5ce7]"
                }`}
                onClick={() => handleTabClick(index)}
                onKeyDown={(event) => handleKeyDown(event, index)}
                onFocus={() => setFocusIndex(index)}
              >
                {category.title}
              </button>
            )
          })}
        </div>

        <div
          className={`pointer-events-none absolute top-0 bottom-0 w-12 transition-opacity duration-200 ${
            isRtl ? "right-0 bg-gradient-to-l" : "left-0 bg-gradient-to-r"
          } from-white via-white/80 to-transparent ${showStartControls ? "opacity-100" : "opacity-0"}`}
        />
        <div
          className={`pointer-events-none absolute top-0 bottom-0 w-12 transition-opacity duration-200 ${
            isRtl ? "left-0 bg-gradient-to-r" : "right-0 bg-gradient-to-l"
          } from-white via-white/80 to-transparent ${showEndControls ? "opacity-100" : "opacity-0"}`}
        />
      </div>
    </div>
  )
}
