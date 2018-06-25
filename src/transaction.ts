import {_window} from "./detection";
import webData from "./web-data";

export const TransactionComplete = "0";
export const TransactionCancel = "1";
export const TransactionFail = "2";


export class Transaction {
    private transaction_name: string;
    private start_time: number;
    private end_time: number;
    private transaction_type: string;
    private reason: string;

    constructor(name: string) {
        this.transaction_name = name;
        this.start_time = new Date().getTime();
        this.end_time = 0;
        this.transaction_type = "0";
        this.reason = "";
    }

    complete() {
        this.end_time = new Date().getTime();
        this.transaction_type = TransactionComplete;
        this.postTransation();
    }

    cancelWithReason(reason: string) {
        this.end_time = new Date().getTime();
        this.transaction_type = TransactionCancel;
        this.reason = reason;
        this.postTransation();
    }

    failWithReason(reason: string) {
        this.end_time = new Date().getTime();
        this.transaction_type = TransactionFail;
        this.reason = reason;
        this.postTransation();
    }

    initTransactionData(): any {
        const transaction = webData.initTransactionsData();
        transaction.content = JSON.stringify({
            transaction_name: this.transaction_name,
            start_time: this.start_time,
            end_time: this.end_time,
            transaction_type: this.transaction_type,
            reason: this.reason,
        });
        return transaction;

    }

    postTransation(): any {
        const url = `${webData.domain}/v2/${webData.appId}/transactions`;
        const result = JSON.stringify(this.initTransactionData());
        return _window._origin_fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: result,
        });
    }






}

export default Transaction;