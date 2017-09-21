export declare type SourceMessageType = 'message' | 'error';
export interface ISourceMessage {
    type?: SourceMessageType;
    category: string;
    payload: any;
    timestamp?: number;
    user?: any;
    tags?: any;
    extra?: any;
}
export declare type ActionFunc<T> = (message: T) => any;
export declare type ProcessorFunc<T> = (actionFunc: ActionFunc<T>) => any;
export default class Source<T> {
    name: string;
    processor: ProcessorFunc<T>;
    receivers: ActionFunc<T>[];
    constructor(name: string, processorFunc: ProcessorFunc<T>);
    action(message: ISourceMessage): void;
    onAction(callback: ActionFunc<T>): void;
    dispose(): void;
}
