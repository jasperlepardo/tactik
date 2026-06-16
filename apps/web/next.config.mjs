/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Workspace packages ship as TS source and are transpiled by Next.
  transpilePackages: [
    "@tactik/shared",
    "@tactik/pricing",
    "@tactik/db",
    "@jasperlepardo/base-design-system",
  ],
};

export default nextConfig;
