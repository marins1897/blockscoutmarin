import React from 'react';

import type { DecodedInput } from 'types/api/decodedInput';

import LogDecodedInputDataHeader from './LogDecodedInputDataHeader';
import LogDecodedInputDataTable from './LogDecodedInputDataTable';
interface Props {
  data: DecodedInput;
  isLoading?: boolean;
}

const LogDecodedInputData = ({ data, isLoading }: Props) => {
  return (
    <>
      <LogDecodedInputDataHeader methodCall={ data.name } isLoading={ isLoading }/> 
      { data.params.length > 0 && <LogDecodedInputDataTable data={ data.params } isLoading={ isLoading }/> }
    </>
  );
};

export default React.memo(LogDecodedInputData);
