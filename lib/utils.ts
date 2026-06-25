import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// Standard shadcn helper. If your project already ran `shadcn init`, you
// already have an identical lib/utils.ts — skip copying this file.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}