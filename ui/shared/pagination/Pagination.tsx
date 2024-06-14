import { Button, Skeleton, Flex, IconButton, chakra } from '@chakra-ui/react';
import React from 'react';

import type { PaginationParams } from './types';

import IconSvg from 'ui/shared/IconSvg';

interface Props extends PaginationParams {
  className?: string;
}

const Pagination = ({ page, onNextPageClick, onPrevPageClick, resetPage, hasPages, hasNextPage, className, canGoBackwards, isLoading, isVisible }: Props) => {

  if (!isVisible) {
    return null;
  }

  const showSkeleton = page === 1 && !hasPages && isLoading;

  return (
    <Flex
      className={ className }
      fontSize="sm"
      alignItems="center"
    >
      <Skeleton isLoaded={ !showSkeleton } display="inline-block" mr={ 4 } borderRadius="base">
        <Button
          variant="outline"
          size="sm"
          onClick={ resetPage }
          isDisabled={ page === 1 || isLoading }
          borderColor="#3AADA8"
          color="#3AADA8"
        >
        First
        </Button>
      </Skeleton>
      <Skeleton isLoaded={ !showSkeleton } display="inline-block" mr={ 3 } borderRadius="base">
        <IconButton
          variant="outline"
          onClick={ onPrevPageClick }
          size="sm"
          aria-label="Prethodna stranica"
          w="36px"
          icon={ <IconSvg name="arrows/east-mini" w={ 5 } h={ 5 }/> }
          isDisabled={ !canGoBackwards || isLoading }
          borderColor="#3AADA8"
          color="#3AADA8"
        />
      </Skeleton>
      <Skeleton isLoaded={ !showSkeleton } display="inline-block" borderRadius="base">
        <Button
          variant="outline"
          size="sm"
          isActive
          borderWidth="1px"
          fontWeight={ 400 }
          h={ 8 }
          minW="36px"
          cursor="unset"
        >
          { page }
        </Button>
      </Skeleton>
      <Skeleton isLoaded={ !showSkeleton } display="inline-block" ml={ 3 } borderRadius="base">
        <IconButton
          variant="outline"
          onClick={ onNextPageClick }
          size="sm"
          aria-label="Sljedeća stranica"
          w="36px"
          icon={ <IconSvg name="arrows/east-mini" w={ 5 } h={ 5 } transform="rotate(180deg)"/> }
          isDisabled={ !hasNextPage || isLoading }
          borderColor="#3AADA8"
          color="#3AADA8"
        />
      </Skeleton>
      { /* not implemented yet */ }
      { /* <Flex alignItems="center" width="132px" ml={ 16 } display={{ base: 'none', lg: 'flex' }}>
            Go to <Input w="84px" size="xs" ml={ 2 }/>
      </Flex> */ }
    </Flex>

  );
};

export default chakra(Pagination);
