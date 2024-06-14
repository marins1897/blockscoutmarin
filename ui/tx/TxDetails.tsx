import React, { useEffect, useState } from 'react';

import TestnetWarning from 'ui/shared/alerts/TestnetWarning';
import DataFetchAlert from 'ui/shared/DataFetchAlert';

import TxInfo from './details/TxInfo';
import type { TxQuery } from './useTxQuery';
import abiDecoder from 'abi-decoder';
import { getEnvValue } from 'configs/app/utils';

const lookupHost = getEnvValue('NEXT_PUBLIC_LOOKUP_HOST');

interface Props {
  txQuery: TxQuery;
}

const TxDetails = ({ txQuery }: Props) => {
  const [ contractABI, setContractABI ] = useState();
  const [ contractHRName, setContractHRName ] = useState();
  const [ decodedInput, setDecodedInput ] = useState();

  useEffect(() => {
    async function fetchContractData(address: String | undefined) {
      if (!address) return;
      try {
        const response = await fetch(`${lookupHost}/contract-lookup/abi/${address}`, {
          method: 'GET',
          headers: {
            'Accept-Language': 'hr'
          }
        });
        const data: any = await response.json();

        setContractHRName(data.name);
        setContractABI(data.abi);

        abiDecoder.addABI(data.abi);

        const decodedResponse = abiDecoder.decodeMethod(txQuery.data?.raw_input);
        setDecodedInput(decodedResponse);
      } catch (error) {
        console.error('Failed to fetch contract data:', error);
      }
    }
  
    if (txQuery.data?.to?.hash || txQuery.data?.created_contract?.hash) {
      fetchContractData(txQuery?.data?.to?.hash || txQuery.data?.created_contract?.hash);
    }
  }, [txQuery.data?.to?.hash]);
  
  if (txQuery.isError) {
    return <DataFetchAlert/>;
  }

  return (
    <>
      <TestnetWarning mb={ 6 } isLoading={ txQuery.isPlaceholderData }/>
      <TxInfo data={ txQuery.data } decodedInput={ decodedInput } contractABI={ contractABI } contractHRName={ contractHRName } isLoading={ txQuery.isPlaceholderData } socketStatus={ txQuery.socketStatus }/>
    </>
  );
};

export default React.memo(TxDetails);
