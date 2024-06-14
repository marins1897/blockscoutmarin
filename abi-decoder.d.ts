declare module 'abi-decoder';
{
    interface AbiDecoder {
      addABI(abiArray: any[]): void;
      decodeMethod(data: string): any;
      decodeLogs(logs: any[]): any;
    }
  
    const abiDecoder: AbiDecoder;
    export default abiDecoder;
}