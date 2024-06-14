import { Skeleton } from '@chakra-ui/react';
import React from 'react';

import type { Address } from 'types/api/address';

import DetailsInfoItem from 'ui/shared/DetailsInfoItem';
import TokenEntity from 'ui/shared/entities/token/TokenEntity';

interface Props {
  data: Pick<Address, 'name' | 'token' | 'is_contract'>;
  isLoading: boolean;
}

const AddressNameInfo = ({ data, isLoading }: Props) => {
  if (data.token) {
    return (
      <DetailsInfoItem
        title="Ime tokena"
        hint="Ime tokena i simbol"
        isLoading={ isLoading }
      >
        <TokenEntity
          token={ data.token }
          isLoading={ isLoading }
          noIcon
          noCopy
        />
      </DetailsInfoItem>
    );
  }

  if (data.is_contract && data.name) {
    return (
      <DetailsInfoItem
        title="Ime ugovora"
        hint="Ime ugovora pronađeno u izvornom kodu"
        isLoading={ isLoading }
      >
        <Skeleton isLoaded={ !isLoading }>
          { data.name }
        </Skeleton>
      </DetailsInfoItem>
    );
  }

  if (data.name) {
    return (
      <DetailsInfoItem
        title="Ime validatora"
        hint="Ime validatora"
        isLoading={ isLoading }
      >
        <Skeleton isLoaded={ !isLoading }>
          { data.name }
        </Skeleton>
      </DetailsInfoItem>
    );
  }

  return null;
};

export default React.memo(AddressNameInfo);
