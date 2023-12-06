/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'zuhot-cinema-images.s3.amazonaws.com',
                port: '',
                pathname: '/**',
            },
        ],
    },
}

module.exports = nextConfig
