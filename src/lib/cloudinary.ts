export interface TransformOptions {
  width?: number;
  height?: number;
  quality?: "auto" | "auto:low" | "auto:good" | "auto:best" | number;
  format?: "auto" | "webp" | "avif" | "jpg" | "png";
  crop?: "fill" | "fit" | "limit" | "scale" | "thumb";
  gravity?: "auto" | "face" | "center";
  dpr?: number;
}

const CLOUD_NAME = "ayezee";

export function buildCloudinaryUrl(
  urlOrPublicId: string,
  transforms: TransformOptions = {}
): string {
  let publicId: string;
  if (urlOrPublicId.includes("res.cloudinary.com")) {
    const match = urlOrPublicId.match(/\/upload\/(?:v\d+\/)?(.+)$/);
    publicId = match ? match[1] : urlOrPublicId;
  } else {
    publicId = urlOrPublicId;
  }

  const parts: string[] = [];

  if (transforms.width) parts.push(`w_${transforms.width}`);
  if (transforms.height) parts.push(`h_${transforms.height}`);
  if (transforms.crop) parts.push(`c_${transforms.crop}`);
  if (transforms.gravity) parts.push(`g_${transforms.gravity}`);
  if (transforms.quality) parts.push(`q_${transforms.quality}`);
  if (transforms.format) parts.push(`f_${transforms.format}`);
  if (transforms.dpr) parts.push(`dpr_${transforms.dpr}`);

  const transformation = parts.length ? `${parts.join(",")}/` : "";

  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transformation}${publicId}`;
}

export function generateSrcSet(
  url: string,
  widths: number[],
  options: Omit<TransformOptions, "width"> = {}
): string {
  return widths
    .map((width) => {
      const imgUrl = buildCloudinaryUrl(url, { ...options, width });
      return `${imgUrl} ${width}w`;
    })
    .join(", ");
}

// Simple presets with explicit dimensions (2:3 ratio = width:height like 500:750)
export const CloudinaryPresets = {
  thumbnail: (url: string) =>
    buildCloudinaryUrl(url, {
      width: 200,
      height: 200,
      crop: "fill",
      gravity: "auto",
      quality: "auto:good",
      format: "auto",
    }),

  card: (url: string) =>
    buildCloudinaryUrl(url, {
      width: 600,
      height: 400,
      crop: "fill",
      gravity: "auto",
      quality: "auto:good",
      format: "auto",
    }),

  hero: (url: string) =>
    buildCloudinaryUrl(url, {
      width: 1920,
      height: 1080,
      crop: "fit",
      quality: "auto:best",
      format: "auto",
    }),

  gallery: (url: string, size: "sm" | "md" | "lg" = "md") => {
    const sizes = { sm: 400, md: 800, lg: 1200 };
    return buildCloudinaryUrl(url, {
      width: sizes[size],
      crop: "limit",
      quality: "auto:best",
      format: "auto",
    });
  },

  // Product with 2:3 ratio using explicit dimensions
  product: (url: string, width: number = 500) => {
    const height = Math.round(width * 1.5); // 2:3 ratio (500 → 750)
    return buildCloudinaryUrl(url, {
      width,
      height,
      crop: "fit",
      gravity: "auto",
      quality: "auto:good",
      format: "auto",
    });
  },
};
