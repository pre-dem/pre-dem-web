import { CollectionStore } from './store';
import { ISourceMessage } from './source';
import { Dem } from './dem';
export interface IMessage {
    id: number;
    data: ISourceMessage;
    sent: boolean;
}
export declare class MessagesStore {
    counter: number;
    parent: Dem;
    store: CollectionStore<IMessage>;
    messageThreshold: number;
    apiDomain: string;
    maxTime: number;
    constructor(parent: Dem);
    add(data: ISourceMessage): void;
}
