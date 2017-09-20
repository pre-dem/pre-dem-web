import { Dem } from '../dem';
import Source, { ISourceMessage } from '../source';
export interface IHistoryMessage extends ISourceMessage {
    payload: {
        from?: string;
        to: string;
        pageSize?: {
            width: number;
            height: number;
        };
        screenSize?: {
            width: number;
            height: number;
        };
        pageView?: boolean;
        userAgent?: string;
    };
}
declare const _default: (dem: Dem) => Source<IHistoryMessage>;
export default _default;
