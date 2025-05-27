import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export async function getAudioDuration(file: File): Promise<string> {
    return new Promise((resolve) => {
        const audio = new Audio();
        const objectUrl = URL.createObjectURL(file);

        audio.addEventListener('loadedmetadata', () => {
            URL.revokeObjectURL(objectUrl);
            resolve(formatDuration(audio.duration));
        });

        audio.addEventListener('error', () => {
            URL.revokeObjectURL(objectUrl);
            resolve('0:00');
        });

        audio.src = objectUrl;
    });
}
