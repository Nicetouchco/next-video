import handler, { GET, POST } from './request-handler.js';
import type { VideoConfig } from './config.js';
import type { NextConfig } from 'next';
export declare function NextVideo(config?: VideoConfig): {
    GET: typeof GET;
    POST: typeof POST;
    handler: typeof handler;
    withNextVideo: (nextConfig: NextConfig) => any;
};
