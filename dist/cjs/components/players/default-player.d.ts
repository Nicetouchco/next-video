import type { MediaProps } from './media/index.js';
import type { PlayerProps, CSSPropertiesWithVars } from '../types.js';
declare const DefaultPlayer: import("react").ForwardRefExoticComponent<Omit<MediaProps, "ref"> & PlayerProps & {
    style?: CSSPropertiesWithVars;
} & import("react").RefAttributes<HTMLVideoElement>>;
export default DefaultPlayer;
