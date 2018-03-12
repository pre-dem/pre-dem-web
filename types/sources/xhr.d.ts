import { Dem } from '../dem';
import Source, { ISourceMessage } from '../source';
export interface IXHRMessage extends ISourceMessage {
    payload: {
        action?: string;
        method: string;
        url: string;
        status_code?: string;
        duration?: number;
        response_text?: string;
        start_timestamp?: number;
        response_timestamp?: number;
        content_length?: number;
    };
}
declare const _default: (dem: Dem) => Source<IXHRMessage>;
export default _default;
