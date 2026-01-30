import type { PlayerProps, CSSPropertiesWithVars } from '../types.js';
import type { MediaProps } from './media/index.js';
declare const BackgroundPlayer: import("react").ForwardRefExoticComponent<Omit<MediaProps, "ref"> & PlayerProps & {
    style?: CSSPropertiesWithVars;
} & import("react").RefAttributes<HTMLVideoElement>>;
export default BackgroundPlayer;
