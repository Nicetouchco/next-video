import type { MuxMediaProps } from '@mux/playback-core';
export type MuxVideoProps = Omit<MuxMediaProps, 'preload'> & Omit<React.ComponentProps<'video'>, 'autoPlay'>;
export type NativeVideoProps = Omit<React.ComponentPropsWithoutRef<'video'>, 'preload' | 'width' | 'height'>;
export type MediaProps<TPlaybackId = string | undefined> = TPlaybackId extends string ? MuxVideoProps & {
    playbackId?: TPlaybackId;
} : NativeVideoProps & {
    playbackId?: undefined;
};
declare const Media: import("react").ForwardRefExoticComponent<((NativeVideoProps & {
    playbackId?: undefined;
}) | Omit<Omit<MuxMediaProps, "preload"> & Omit<import("react").DetailedHTMLProps<import("react").VideoHTMLAttributes<HTMLVideoElement>, HTMLVideoElement>, "autoPlay"> & {
    playbackId?: string | undefined;
}, "ref">) & import("react").RefAttributes<any>>;
export default Media;
