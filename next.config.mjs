/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Vercel Blob (ürün görselleri)
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
      // Stitch tasarımlarındaki geçici mockup görselleri
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      // Seed verisindeki geçici ürün görselleri
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
