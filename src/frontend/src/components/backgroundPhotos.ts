const backgroundPhotos = Object.values(import.meta.glob<string>(
    "../../backround_photos/actual_jpg/*.jpg",
    { eager: true, import: "default" },
));
let selectedBackgroundPhoto: string | undefined;
let hasSelectedBackgroundPhoto = false;

export function selectRandomBackgroundPhoto(
    photos: readonly string[],
    random: () => number = Math.random,
): string | undefined {
    if (photos.length === 0) return undefined;

    return photos[Math.floor(random() * photos.length)];
}

export function getRandomBackgroundPhoto(): string | undefined {
    if (!hasSelectedBackgroundPhoto) {
        selectedBackgroundPhoto = selectRandomBackgroundPhoto(backgroundPhotos);
        hasSelectedBackgroundPhoto = true;
    }

    return selectedBackgroundPhoto;
}