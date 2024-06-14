export interface AbiDecoder {
    addABI(abiArray: any[]): void;
    decodeMethod(data: string): any;
    decodeLogs(logs: any[]): any;
}