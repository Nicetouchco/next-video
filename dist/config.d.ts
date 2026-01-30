import { Asset } from './assets';
/**
 * Video configurations
 */
export type VideoConfigComplete = {
    /** The folder in your project where you will put all video source files. */
    folder: string;
    /** The route of the video API request for string video source URLs. */
    path: string;
    provider: keyof ProviderConfig;
    providerConfig: ProviderConfig;
    loadAsset: (assetPath: string) => Promise<Asset | undefined>;
    saveAsset: (assetPath: string, asset: Asset) => Promise<void>;
    updateAsset: (assetPath: string, asset: Asset) => Promise<void>;
    remoteSourceAssetPath?: (url: string) => string;
};
export type NewAssetSettings = {
    videoQuality?: 'basic' | 'plus' | 'premium';
    maxResolutionTier?: '1080p' | '1440p' | '2160p';
};
export type ProviderConfig = {
    mux?: {
        generateAssetKey: undefined;
        videoQuality?: 'basic' | 'plus' | 'premium';
        newAssetSettings?: Record<string, NewAssetSettings>;
    };
    'vercel-blob'?: {
        generateAssetKey?: (filePathOrURL: string, folder: string) => string;
    };
    backblaze?: {
        endpoint: string;
        bucket?: string;
        accessKeyId?: string;
        secretAccessKey?: string;
        generateAssetKey?: (filePathOrURL: string, folder: string) => string;
    };
    'amazon-s3'?: {
        endpoint: string;
        bucket?: string;
        accessKeyId?: string;
        secretAccessKey?: string;
        region?: string;
        generateAssetKey?: (filePathOrURL: string, folder: string) => string;
    };
    'cloudflare-r2'?: {
        endpoint: string;
        bucket?: string;
        bucketUrlPublic?: string;
        accessKeyId?: string;
        secretAccessKey?: string;
        apiToken?: string;
        generateAssetKey?: (filePathOrURL: string, folder: string) => string;
    };
};
export type VideoConfig = Partial<VideoConfigComplete>;
export declare const videoConfigDefault: VideoConfigComplete;
declare global {
    var __nextVideo: {
        configComplete: VideoConfigComplete;
        configIsDefined: boolean;
    };
}
export declare function setVideoConfig(videoConfig?: VideoConfig): VideoConfigComplete;
/**
 * The video config is set in `next.config.js` and passed to the `withNextVideo` function.
 * The video config is then stored via the `setVideoConfig` function.
 */
export declare function getVideoConfig(): Promise<VideoConfigComplete>;
