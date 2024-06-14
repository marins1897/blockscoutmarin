import { Divider, Flex, Skeleton, VStack } from '@chakra-ui/react';
import React from 'react';

interface Props {
  methodCall: string;
  isLoading?: boolean;
}

const Item = ({ label, text, isLoading }: { label: string; text: string; isLoading?: boolean}) => {
  return (
    <Flex
      columnGap={ 5 }
      rowGap={ 2 }
      px={{ base: 0, lg: 4 }}
      flexDir={{ base: 'column', lg: 'row' }}
      alignItems="flex-start"
    >
      <Skeleton fontWeight={ 600 } w={{ base: 'auto', lg: '80px' }} flexShrink={ 0 } isLoaded={ !isLoading }>
        { label }
      </Skeleton >
      <Skeleton isLoaded={ !isLoading } whiteSpace="pre-wrap">{ text }</Skeleton>
    </Flex>
  );
};

const removeAddressArg = (methodCall: string) => {
  // Replace 'address arg0,' with an empty string
  return methodCall.replace(/address arg\d+,\s*/, '');
};

const LogDecodedInputDataHeader = ({ methodCall, isLoading }: Props) => {
  const cleanedMethodCall = removeAddressArg(methodCall);

  return (
    <VStack
      align="flex-start"
      divider={ <Divider/> }
      fontSize="sm"
      lineHeight={ 5 }
    >
      { /*<Item label="Id metode" text={ methodId } isLoading={ isLoading }/>*/ }
      <Item label="Metoda" text={ cleanedMethodCall } isLoading={ isLoading }/>
    </VStack>
  );
};

export default LogDecodedInputDataHeader;
