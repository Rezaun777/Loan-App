"use client"

import { useEffect, useState } from "react"

interface TypingAnimationProps {
  text: string
  speed?: number
  delay?: number
  restartDelay?: number
  className?: string
}

export function TypingAnimation({ text, speed = 50, delay = 10000, restartDelay = 2000, className = "" }: TypingAnimationProps) {
  const [displayedText, setDisplayedText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isWaiting, setIsWaiting] = useState(false)
  const [cycleCount, setCycleCount] = useState(0)

  useEffect(() => {
    let timeout: NodeJS.Timeout

    if (isWaiting) {
      // Wait for the specified delay before restarting
      const waitTime = cycleCount === 0 ? delay : restartDelay
      timeout = setTimeout(() => {
        setIsWaiting(false)
        setCurrentIndex(0)
        setDisplayedText("")
        setIsDeleting(false)
        setCycleCount((prev) => prev + 1)
      }, waitTime)
    } else if (isDeleting) {
      // Delete text
      if (displayedText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayedText((prev) => prev.slice(0, -1))
        }, speed / 2) // Faster deletion
      } else {
        setIsDeleting(false)
        setIsWaiting(true)
      }
    } else {
      // Type text
      if (currentIndex < text.length) {
        timeout = setTimeout(() => {
          setDisplayedText((prev) => prev + text[currentIndex])
          setCurrentIndex((prev) => prev + 1)
        }, speed)
      } else {
        // Finished typing, start deletion after delay
        timeout = setTimeout(() => {
          setIsDeleting(true)
        }, delay)
      }
    }

    return () => clearTimeout(timeout)
  }, [currentIndex, displayedText, isDeleting, isWaiting, text, speed, delay, restartDelay, cycleCount])

  return (
    <p className={className}>
      {displayedText}
      <span className="ml-1 animate-pulse">|</span>
    </p>
  )
}