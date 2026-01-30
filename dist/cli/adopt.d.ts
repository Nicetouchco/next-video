import { Argv, Arguments } from 'yargs';
export declare const command = "adopt <playbackId>";
export declare const desc = "Create a local asset metadata file for an existing Mux asset using its playback ID.";
export declare function builder(yargs: Argv): Argv<import("yargs").Omit<{
    playbackId: string;
}, "dir" | "name" | "thumbnail-time" | "interactive"> & import("yargs").InferredOptionTypes<{
    dir: {
        alias: string;
        describe: string;
        type: "string";
        default: string;
    };
    name: {
        alias: string;
        describe: string;
        type: "string";
    };
    'thumbnail-time': {
        alias: string;
        describe: string;
        type: "number";
    };
    interactive: {
        alias: string;
        describe: string;
        type: "boolean";
        default: boolean;
    };
}>>;
export declare function handler(argv: Arguments): Promise<void>;
