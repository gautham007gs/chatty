import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Checks if the app is likely running inside the Instagram in-app browser.
 * This is based on a common user-agent string pattern.
 * @returns {boolean} True if likely in Instagram's in-app browser, false otherwise.
 */
export function isRunningInInstagramApp(): boolean {
  if (typeof window !== 'undefined' && window.navigator) {
    const userAgent = window.navigator.userAgent || window.navigator.vendor || (window as any).opera;
    // Instagram's user agent string often contains "Instagram"
    if (/instagram/i.test(userAgent)) {
      return true;
    }
  }
  return false;
}

/**
 * Checks if the current device is likely Android.
 * @returns {boolean} True if likely an Android device, false otherwise.
 */
export function isAndroid(): boolean {
  if (typeof window !== 'undefined' && window.navigator) {
    const userAgent = window.navigator.userAgent;
    return /android/i.test(userAgent);
  }
  return false;
}
