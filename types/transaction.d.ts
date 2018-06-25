export declare const TransactionComplete = "0";
export declare const TransactionCancel = "1";
export declare const TransactionFail = "2";
export declare class Transaction {
    private transaction_name;
    private start_time;
    private end_time;
    private transaction_type;
    private reason;
    constructor(name: string);
    complete(): void;
    cancelWithReason(reason: string): void;
    failWithReason(reason: string): void;
    initTransactionData(): any;
    postTransation(): any;
}
export default Transaction;
