import type { ProductAvailability } from "@/types/domain";

export const availabilityOptions: Array<{ value: ProductAvailability; label: string; shortLabel: string }> = [
  { value: "in-stock", label: "In stock", shortLabel: "In stock" },
  { value: "made-to-order", label: "Accepts customization", shortLabel: "Custom" },
  { value: "pre-order", label: "Pre-order", shortLabel: "Pre-order" },
  { value: "waiting-list", label: "Waiting list", shortLabel: "Waiting" }
];

export const contentStorageNotes = [
  "Fast launch: this admin writes content into data/content.json and stores uploaded images in public/uploads.",
  "Publishing flow: commit and push the changed files to GitHub; Vercel rebuilds the public website from the latest content.",
  "Scale path: if image volume grows, keep the same content fields and move upload storage to Sanity, Cloudflare R2, Supabase Storage, or another object store."
];

export function getAvailabilityLabel(value: ProductAvailability) {
  return availabilityOptions.find((option) => option.value === value)?.label ?? value;
}

export function getAvailabilityShortLabel(value: ProductAvailability) {
  return availabilityOptions.find((option) => option.value === value)?.shortLabel ?? value;
}
