export type * from './types.js';
declare const BackgroundVideo: import("react").ForwardRefExoticComponent<((Omit<import("./players/media/index.js").NativeVideoProps & import("./types.js").PlayerProps, "poster" | "src"> & {
    as?: React.FunctionComponent<Omit<import("./players/media/index.js").MediaProps, "ref"> & import("./types.js").PlayerProps & {
        style?: import("./types.js").CSSPropertiesWithVars;
    }>;
    src?: import("../assets.js").Asset | string;
    poster?: import("next/image.js").StaticImageData | string;
    width?: number;
    height?: number;
    controls?: boolean;
    blurDataURL?: string;
    sizes?: string;
    loader?: import("./types.js").VideoLoader;
    transform?: (asset: import("../assets.js").Asset) => import("../assets.js").Asset;
} & {
    playbackId?: undefined;
} & {
    style?: import("./types.js").CSSPropertiesWithVars;
}) | Omit<Omit<Partial<import("./players/media/index.js").MuxVideoProps> & import("./types.js").PlayerProps, "poster" | "src"> & {
    as?: React.FunctionComponent<Omit<import("./players/media/index.js").MediaProps, "ref"> & import("./types.js").PlayerProps & {
        style?: import("./types.js").CSSPropertiesWithVars;
    }>;
    src?: import("../assets.js").Asset | string;
    poster?: import("next/image.js").StaticImageData | string;
    width?: number;
    height?: number;
    controls?: boolean;
    blurDataURL?: string;
    sizes?: string;
    loader?: import("./types.js").VideoLoader;
    transform?: (asset: import("../assets.js").Asset) => import("../assets.js").Asset;
} & {
    playbackId?: string | undefined;
} & {
    style?: import("./types.js").CSSPropertiesWithVars;
}, "ref">) & import("react").RefAttributes<HTMLVideoElement>>;
export default BackgroundVideo;
