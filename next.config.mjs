/** @type {import('next').NextConfig} */
const nextConfig = {
	webpack: (
		config,
		{ buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }
	) => {
		config.externals.push({ canvas: 'commonjs canvas' });
		return config;
	},
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'liveblocks.io',
				port: '',
			},
		],
	},
};

export default nextConfig;
