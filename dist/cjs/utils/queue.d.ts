export interface QueueItem<T = any> {
    fn: () => Promise<T>;
    resolve: (value: T) => void;
    reject: (reason?: any) => void;
}
export declare class Queue {
    private lastRequestTime;
    private requestQueue;
    private processing;
    private delayMs;
    constructor(delayMs?: number);
    enqueue<T>(fn: () => Promise<T>): Promise<T>;
    private processNext;
    private executeNextRequest;
}
