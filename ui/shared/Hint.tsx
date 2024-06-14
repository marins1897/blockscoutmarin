import type { TooltipProps } from '@chakra-ui/react';
import { chakra, IconButton, Tooltip, useDisclosure, Skeleton } from '@chakra-ui/react';
import React from 'react';

import IconSvg from 'ui/shared/IconSvg';

interface Props {
  label: string | React.ReactNode;
  className?: string;
  tooltipProps?: Partial<TooltipProps>;
  isLoading?: boolean;
}

const Hint = ({ label, className, tooltipProps, isLoading }: Props) => {
  // have to implement controlled tooltip because of the issue - https://github.com/chakra-ui/chakra-ui/issues/7107
  const { isOpen, onOpen, onToggle, onClose } = useDisclosure();

  const handleClick = React.useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    onToggle();
  }, [ onToggle ]);

  function switchHint(baseHint: string) {
    let hintHR = baseHint; 
    if (baseHint === 'Average time taken in seconds for a block to be included in the blockchain') hintHR = 'Prosječno vrijeme potrebno u sekundama da se blok doda lanac blokova';
    else if (baseHint === 'Number of transactions with success status') hintHR = 'Broj transakcija sa statusom uspješnosti';
    else if (baseHint === 'Number of blocks over all time') hintHR = 'Broj blokova tijekom cijelog vremena';
    else if (baseHint === 'Number of contracts') hintHR = 'Broj ugovora';
    else if (baseHint === 'All transactions including pending, dropped, replaced, failed transactions') hintHR = 'Sve transakcije uključujući transakcije na čekanju, odbačene, zamijenjene, neuspjele transakcije';
    return hintHR; 
  }

  if (isLoading) {
    return <Skeleton className={ className } boxSize={ 5 } borderRadius="sm"/>;
  }

  const tooltipLabel = typeof label === 'string' ? switchHint(label) : '';

  return (
    <Tooltip
      label={ tooltipLabel }
      placement="top"
      maxW="320px"
      isOpen={ isOpen }
      { ...tooltipProps }
    >
      <IconButton
        colorScheme="none"
        aria-label="hint"
        icon={ <IconSvg name="info" w="100%" h="100%"/> }
        boxSize={ 5 }
        variant="simple"
        display="inline-block"
        flexShrink={ 0 }
        className={ className }
        onMouseEnter={ onOpen }
        onMouseLeave={ onClose }
        onClick={ handleClick }
      />
    </Tooltip>
  );
};

export default React.memo(chakra(Hint));
