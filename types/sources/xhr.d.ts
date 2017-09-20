import { Dem } from '../dem';
import Source, { ISourceMessage } from '../source';
export interface IXHRMessage extends ISourceMessage {
    payload: {
        action?: string;
        method: string;
        url: string;
        status_code?: string;
        duration?: number;
        responseText?: string;
        responseTimestamp?: number;
        contentLength?: number;
    };
}
declare const _default: (dem: Dem) => Source<IXHRMessage>;
export default _default;
