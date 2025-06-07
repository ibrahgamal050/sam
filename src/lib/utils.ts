import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date): string {
  // Format date as "MMM DD, YYYY"
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date)

}
export function debounce(func: Function, wait: number) {
  let timeout: NodeJS.Timeout | null = null

  return function executedFunction(...args: any[]) {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout) {
      clearTimeout(timeout)
    }

    timeout = setTimeout(later, wait)
  }
}
