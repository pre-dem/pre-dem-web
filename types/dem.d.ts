import { Store } from './store';
import { MessagesStore } from './messages-store';
import Transfer from './transfer';
import Source from './source';
import { ILogger } from './logger';
export declare type URLPattern = RegExp | string;
export interface DemOption {
    release?: string;
    environment?: string;
    tags?: any;
    whitelistUrls?: URLPattern[];
    ignoreUrls?: URLPattern[];
    ignoreError?: string[];
    autoInstall?: boolean;
    instrument?: boolean | {
        tryCatch?: boolean;
    };
    autoBreadcrumbs?: boolean | {
        xhr?: boolean;
        console?: boolean;
        dom?: boolean;
        history?: boolean;
        performance?: boolean;
    };
    transfer?: Transfer;
    transfers?: Transfer[];
    sources?: Source<any>[];
    debug?: boolean;
}
export declare type ValueCallback<T> = (value?: T, callback?: ValueCallback<T>) => T;
export declare class Dem {
    VERSION: '1.0.0';
    option: DemOption;
    callbacks: {
        [key: string]: ValueCallback<any>;
    };
    configStore: Store;
    contextStore: Store;
    messages: MessagesStore;
    transfers: Transfer[];
    sources: Source<any>[];
    __wrappedBuiltins: any[];
    readonly Transfer: typeof Transfer;
    readonly Source: typeof Source;
    readonly logger: ILogger;
    constructor(option?: DemOption);
    debug: boolean;
    install(): this;
    uninstall(): this;
    addSource(source: Source<any>): this;
    addTransfer(transfer: Transfer): this;
    config(key: string, value: string): any;
    config(object: any): any;
    captureException(ex: Error, options?: any): any;
    setUserContext(user: any): this;
    setTagsContext(tags: any): this;
    setExtraContext(extra: any): this;
    clearContext(): this;
    getContext(): any;
    setEnvironment(env: string): this;
    setRelease(release: string): this;
    getCallback(key: string): ValueCallback<any>;
    setCallback(key: string, callback?: ValueCallback<any>): void;
    setBreadcrumbCallback(callback: ValueCallback<any>): void;
    setExceptionCallback(callback: ValueCallback<any>): void;
    wrap(options: any, func?: any, _before?: any): any;
    context(func: any, args: any[]): any;
    context(func: any, options: any): any;
    context(func: any, args: any[], options: any): any;
    _ignoreOnError: number;
    _ignoreNextOnError(): void;
    _setupBreadcrumb(): void;
    _restoreBuiltIns(): void;
}
declare const dem: Dem;
export default dem;
