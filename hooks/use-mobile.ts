import * as React from 'react'

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    // Check if window is defined (client-side)
    if (typeof window !== 'undefined') {
      const checkIsMobile = () => {
        const mobile = window.innerWidth < MOBILE_BREAKPOINT
        setIsMobile(mobile)
      }
      
      // Initial check
      checkIsMobile()
      
      // Add event listener for resize
      window.addEventListener('resize', checkIsMobile)
      
      // Cleanup listener on unmount
      return () => {
        window.removeEventListener('resize', checkIsMobile)
      }
    }
  }, [])

  // Default to true for mobile on server-side rendering
  return typeof isMobile === 'undefined' ? true : isMobile
}