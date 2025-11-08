import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Re-export all utilities
export * from './utils/mermaidUtils';
export * from './utils/exportUtils';
export * from './utils/erParser';
export * from './utils/cloudSyntax';
export * from './utils/cloudBeautify';
