export declare class WebData {
    appId: string;
    domain: string;
    tag: string;
    uuid: string;
    performanceFilter: any;
    constructor();
    init(appId: string, domain: string): void;
    setTag(tag: string): void;
    setPerformanceFilter(filter: any): void;
    sendEventData(name: string, data: any): any;
    push(datas: any): void;
    postDataUrl(domain: string, category: string, appId: string): string;
    initCustomEvent(tag: string, name: string, content: string): any;
    initPerformance(message: any, tag: string): any;
    initNetworkData(message: any, tag: string): any;
    initErrorData(message: any, tag: string): any;
}
declare const webData: WebData;
export default webData;
