/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["res.cloudinary.com"],
  },
  output: "standalone", // ✅ Ini aman & bermanfaat untuk deploy di Vercel/Docker
};

module.exports = nextConfig;
