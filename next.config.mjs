/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'images.unsplash.com',
      'upload.wikimedia.org',
      'cdn.myanimelist.net',
    ],
  },
};

export default nextConfig;
