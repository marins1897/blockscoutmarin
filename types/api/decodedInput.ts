export interface DecodedInput {
  name: string;
  method_id: string;
  parameters?: Array<DecodedInputParams>;
  params: Array<DecodedInputParams>;
}

export interface DecodedInputParams {
  name: string;
  type: string;
  value: string | Array<unknown> | Record<string, unknown>;
  indexed?: boolean;
}
