import { Flex, Grid, Skeleton, useColorModeValue } from '@chakra-ui/react';
import React from 'react';

import type { DecodedInput } from 'types/api/decodedInput';
import type { ArrayElement } from 'types/utils';

import CopyToClipboard from 'ui/shared/CopyToClipboard';
import AddressEntity from 'ui/shared/entities/address/AddressEntity';
import TruncatedValue from 'ui/shared/TruncatedValue';

interface Props {
  data: DecodedInput['parameters'];
  isLoading?: boolean;
}

const HeaderItem = ({ children, isLoading }: { children: React.ReactNode; isLoading?: boolean }) => {
  return (
    <Skeleton
      fontWeight={ 600 }
      pb={ 1 }
      display="inline-block"
      width="fit-content"
      height="fit-content"
      isLoaded={ !isLoading }
    >
      { children }
    </Skeleton>
  );
};

const Row = ({ name, type, indexed, value, isLoading }: ArrayElement<DecodedInput['parameters']> & { isLoading?: boolean }) => {
  const content = (() => {
    if (type === 'address' && typeof value === 'string') {
      return (
        <AddressEntity
          address={{ hash: value, name: '', implementation_name: null, is_contract: false, is_verified: false }}
          isLoading={ isLoading }
        />
      );
    }

    if (typeof value === 'object') {
      const text = JSON.stringify(value, undefined, 4);
      return (
        <Flex alignItems="flex-start" justifyContent="space-between" whiteSpace="normal" wordBreak="break-all">
          <TruncatedValue value={ text } isLoading={ isLoading }/>
          <CopyToClipboard text={ text } isLoading={ isLoading }/>
        </Flex>
      );
    }

    return (
      <Flex alignItems="flex-start" justifyContent="space-between" whiteSpace="normal" wordBreak="break-all">
        <TruncatedValue value={ value } isLoading={ isLoading }/>
        <CopyToClipboard text={ value } isLoading={ isLoading }/>
      </Flex>
    );
  })();

  return (
    <>
      <TruncatedValue value={ name } isLoading={ isLoading }/>
      <TruncatedValue value={ type } isLoading={ isLoading }/>
      <Skeleton isLoaded={ !isLoading } display="inline-block">{ content }</Skeleton>
    </>
  );
};

const LogDecodedInputDataTable = ({ data, isLoading }: Props) => {
  const bgColor = useColorModeValue('blackAlpha.50', 'whiteAlpha.50');
  //const hasIndexed = data.some(({ indexed }) => indexed !== undefined);

  const gridTemplateColumnsBase = '50px 60px minmax(0, 1fr)';
  const gridTemplateColumnsLg = '80px 80px minmax(0, 1fr)';

  return (
    <Grid
      gridTemplateColumns={{ base: gridTemplateColumnsBase, lg: gridTemplateColumnsLg }}
      fontSize="sm"
      lineHeight={ 5 }
      bgColor={ bgColor }
      p={ 4 }
      mt={ 2 }
      w="100%"
      columnGap={ 5 }
      rowGap={ 5 }
      borderBottomLeftRadius="md"
      borderBottomRightRadius="md"
    >
      <HeaderItem isLoading={ isLoading }>Name</HeaderItem>
      <HeaderItem isLoading={ isLoading }>Type</HeaderItem>
      { /*{ hasIndexed && <HeaderItem isLoading={ isLoading }>Inde<wbr/>xed?</HeaderItem> }*/ }
      <HeaderItem isLoading={ isLoading }>Data</HeaderItem>
      { data ?
      data
      .filter(item => item.type !== 'address' && item.name !== 'address') // Filters out 'address' type or name
      .map(({ indexed, ...item }) => {
        return <Row key={ item.name } { ...item } isLoading={ isLoading }/>;
      }) : null }
    </Grid>
  );
};

export default LogDecodedInputDataTable;