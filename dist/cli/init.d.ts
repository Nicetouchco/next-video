import { Argv, Arguments } from 'yargs';
export declare const command = "init [dir]";
export declare const desc = "Initializes next-video in a project.";
export declare function builder(yargs: Argv): Argv<import("yargs").Omit<{}, "typescript" | "dir" | "force" | "tsconfig" | "devscript"> & import("yargs").InferredOptionTypes<{
    dir: {
        alias: string;
        describe: string;
        type: "string";
    };
    force: {
        alias: string;
        describe: string;
        type: "boolean";
        default: boolean;
    };
    typescript: {
        alias: string;
        describe: string;
        type: "boolean";
        default: boolean;
    };
    tsconfig: {
        describe: string;
        type: "boolean";
        default: boolean;
    };
    devscript: {
        describe: string;
        type: "boolean";
        default: boolean;
    };
}>>;
export declare function handler(argv: Arguments): Promise<void>;
