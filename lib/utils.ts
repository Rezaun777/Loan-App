import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converts English digits to Bangla digits
 * @param number - The number or string containing digits to convert
 * @returns String with Bangla digits
 */
export function convertToBanglaDigits(number: number | string): string {
  const englishToBanglaMap: { [key: string]: string } = {
    '0': '০',
    '1': '১',
    '2': '২',
    '3': '৩',
    '4': '৪',
    '5': '৫',
    '6': '৬',
    '7': '৭',
    '8': '৮',
    '9': '৯'
  }

  return number.toString().replace(/[0-9]/g, (digit) => englishToBanglaMap[digit])
}