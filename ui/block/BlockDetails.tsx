import { Grid, GridItem, Text, Link, Box, Tooltip, useColorModeValue, Skeleton } from '@chakra-ui/react';
import BigNumber from 'bignumber.js';
import capitalize from 'lodash/capitalize';
import { useRouter } from 'next/router';
import React from 'react';
import { scroller, Element } from 'react-scroll';

import { ZKSYNC_L2_TX_BATCH_STATUSES } from 'types/api/zkSyncL2';

import { route } from 'nextjs-routes';

import config from 'configs/app';
import getBlockReward from 'lib/block/getBlockReward';
import { /*GWEI,*/ WEI, /*WEI_IN_GWEI,*/ ZERO } from 'lib/consts';
import { space } from 'lib/html-entities';
import getNetworkValidatorTitle from 'lib/networks/getNetworkValidatorTitle';
import getQueryParamString from 'lib/router/getQueryParamString';
import { currencyUnits } from 'lib/units';
import CopyToClipboard from 'ui/shared/CopyToClipboard';
import DetailsInfoItem from 'ui/shared/DetailsInfoItem';
import DetailsInfoItemDivider from 'ui/shared/DetailsInfoItemDivider';
import DetailsTimestamp from 'ui/shared/DetailsTimestamp';
import AddressEntity from 'ui/shared/entities/address/AddressEntity';
import BatchEntityL2 from 'ui/shared/entities/block/BatchEntityL2';
import GasUsedToTargetRatio from 'ui/shared/GasUsedToTargetRatio';
import HashStringShortenDynamic from 'ui/shared/HashStringShortenDynamic';
import IconSvg from 'ui/shared/IconSvg';
import LinkInternal from 'ui/shared/LinkInternal';
import PrevNext from 'ui/shared/PrevNext';
import RawDataSnippet from 'ui/shared/RawDataSnippet';
import TextSeparator from 'ui/shared/TextSeparator';
import Utilization from 'ui/shared/Utilization/Utilization';
import VerificationSteps from 'ui/shared/verificationSteps/VerificationSteps';
import ZkSyncL2TxnBatchHashesInfo from 'ui/txnBatches/zkSyncL2/ZkSyncL2TxnBatchHashesInfo';

import BlockDetailsBlobInfo from './details/BlockDetailsBlobInfo';
import type { BlockQuery } from './useBlockQuery';

interface Props {
  query: BlockQuery;
}

const rollupFeature = config.features.rollup;

const BlockDetails = ({ query }: Props) => {
  const [ isExpanded, setIsExpanded ] = React.useState(true);
  const router = useRouter();
  const heightOrHash = getQueryParamString(router.query.height_or_hash);

  const separatorColor = useColorModeValue('gray.200', 'gray.700');

  const { data, isPlaceholderData } = query;

  const handleCutClick = React.useCallback(() => {
    setIsExpanded((flag) => !flag);
    scroller.scrollTo('BlockDetails__cutLink', {
      duration: 500,
      smooth: true,
    });
  }, []);

  const handlePrevNextClick = React.useCallback((direction: 'prev' | 'next') => {
    if (!data) {
      return;
    }

    const increment = direction === 'next' ? +1 : -1;
    const nextId = String(data.height + increment);

    router.push({ pathname: '/block/[height_or_hash]', query: { height_or_hash: nextId } }, undefined);
  }, [ data, router ]);

  if (!data) {
    return null;
  }

  const { totalReward, staticReward, burntFees, txFees } = getBlockReward(data);

  const validatorTitle = getNetworkValidatorTitle();

  const rewardBreakDown = (() => {
    if (rollupFeature.isEnabled || totalReward.isEqualTo(ZERO) || txFees.isEqualTo(ZERO) || burntFees.isEqualTo(ZERO)) {
      return null;
    }

    if (isPlaceholderData) {
      return <Skeleton w="525px" h="20px"/>;
    }

    return (
      <Text variant="secondary" whiteSpace="break-spaces">
        <Tooltip label="Nagrada za blok">
          <span>{ staticReward.dividedBy(WEI).toFixed() }</span>
        </Tooltip>
        { !txFees.isEqualTo(ZERO) && (
          <>
            { space }+{ space }
            <Tooltip label="Naknada za transakcije">
              <span>{ txFees.dividedBy(WEI).toFixed() }</span>
            </Tooltip>
          </>
        ) }
        { !burntFees.isEqualTo(ZERO) && (
          <>
            { space }-{ space }
            <Tooltip label="Naknada za odbačene jedinice">
              <span>{ burntFees.dividedBy(WEI).toFixed() }</span>
            </Tooltip>
          </>
        ) }
      </Text>
    );
  })();

  const verificationTitle = (() => {
    if (rollupFeature.isEnabled && rollupFeature.type === 'zkEvm') {
      return 'Sequenced by';
    }

    return config.chain.verificationType === 'validation' ? 'Potvrdio' : 'Stvorio';
  })();

  const txsNum = (() => {
    const blockTxsNum = (
      <LinkInternal href={ route({ pathname: '/block/[height_or_hash]', query: { height_or_hash: heightOrHash, tab: 'txs' } }) }>
        { data.tx_count } txn{ data.tx_count === 1 ? '' : 'i' }
      </LinkInternal>
    );

    const blockBlobTxsNum = data.blob_tx_count ? (
      <>
        <span> and </span>
        <LinkInternal href={ route({ pathname: '/block/[height_or_hash]', query: { height_or_hash: heightOrHash, tab: 'blob_txs' } }) }>
          { data.blob_tx_count } blob txn{ data.blob_tx_count === 1 ? '' : 'i' }
        </LinkInternal>
      </>
    ) : null;

    return (
      <>
        { blockTxsNum }
        { blockBlobTxsNum }
        <span> u ovok bloku</span>
      </>
    );
  })();

  const blockTypeLabel = (() => {
    switch (data.type) {
      case 'reorg':
        return 'Reorg';
      case 'uncle':
        return 'Ujak';
      default:
        return 'Blok';
    }
  })();

  return (
    <Grid
      columnGap={ 8 }
      rowGap={{ base: 3, lg: 3 }}
      templateColumns={{ base: 'minmax(0, 1fr)', lg: 'minmax(min-content, 200px) minmax(0, 1fr)' }}
      overflow="hidden"
    >
      <DetailsInfoItem
        title={ `${ blockTypeLabel } broj` }
        hint="Redni broj bloka"
        isLoading={ isPlaceholderData }
      >
        <Skeleton isLoaded={ !isPlaceholderData }>
          { data.height }
        </Skeleton>
        { data.height === 0 && <Text whiteSpace="pre"> - Genesis Blok</Text> }
        <PrevNext
          ml={ 6 }
          onClick={ handlePrevNextClick }
          prevLabel="Prethodni blok"
          nextLabel="Sljedeći blok"
          isPrevDisabled={ data.height === 0 }
          isLoading={ isPlaceholderData }
        />
      </DetailsInfoItem>
      <DetailsInfoItem
        title="Veličina"
        hint="Veličina blokova u bajtovima"
        isLoading={ isPlaceholderData }
      >
        <Skeleton isLoaded={ !isPlaceholderData }>
          { data.size.toLocaleString() }
        </Skeleton>
      </DetailsInfoItem>
      <DetailsInfoItem
        title="Datum"
        hint="Datum kada je blok kreiran"
        isLoading={ isPlaceholderData }
      >
        <DetailsTimestamp timestamp={ data.timestamp } isLoading={ isPlaceholderData }/>
      </DetailsInfoItem>
      <DetailsInfoItem
        title="Količina transakcija"
        hint="Količina transakcija u bloku"
        isLoading={ isPlaceholderData }
      >
        <Skeleton isLoaded={ !isPlaceholderData }>
          { txsNum }
        </Skeleton>
      </DetailsInfoItem>
      { config.features.beaconChain.isEnabled && Boolean(data.withdrawals_count) && (
        <DetailsInfoItem
          title="Isplate"
          hint="Broj isplata u bloku"
          isLoading={ isPlaceholderData }
        >
          <Skeleton isLoaded={ !isPlaceholderData }>
            <LinkInternal href={ route({ pathname: '/block/[height_or_hash]', query: { height_or_hash: heightOrHash, tab: 'withdrawals' } }) }>
              { data.withdrawals_count } withdrawal{ data.withdrawals_count === 1 ? '' : 's' }
            </LinkInternal>
          </Skeleton>
        </DetailsInfoItem>
      ) }

      { rollupFeature.isEnabled && rollupFeature.type === 'zkSync' && data.zksync && (
        <>
          <DetailsInfoItem
            title="Serija"
            hint="Broj serije"
            isLoading={ isPlaceholderData }
          >
            { data.zksync.batch_number ? (
              <BatchEntityL2
                isLoading={ isPlaceholderData }
                number={ data.zksync.batch_number }
              />
            ) : <Skeleton isLoaded={ !isPlaceholderData }>U tijeku</Skeleton> }
          </DetailsInfoItem>
          <DetailsInfoItem
            title="Status"
            hint="Status je kratka interpretacija životnog ciklusa serije"
            isLoading={ isPlaceholderData }
          >
            <VerificationSteps steps={ ZKSYNC_L2_TX_BATCH_STATUSES } currentStep={ data.zksync.status } isLoading={ isPlaceholderData }/>
          </DetailsInfoItem>
        </>
      ) }

      { !config.UI.views.block.hiddenFields?.miner && (
        <DetailsInfoItem
          title={ verificationTitle }
          hint="Validator koji je uspješno izgradio block na lancu blokova"
          columnGap={ 1 }
          isLoading={ isPlaceholderData }
        >
          <AddressEntity
            address={ data.miner }
            isLoading={ isPlaceholderData }
          />
          { /* api doesn't return the block processing time yet */ }
          { /* <Text>{ dayjs.duration(block.minedIn, 'second').humanize(true) }</Text> */ }
        </DetailsInfoItem>
      ) }
      { !rollupFeature.isEnabled && !totalReward.isEqualTo(ZERO) && !config.UI.views.block.hiddenFields?.total_reward && (
        <DetailsInfoItem
          title="Nagrada za blok"
          hint={
            `Za svaki blok, validator je nagrađen s određenom količinom ${ config.chain.currency.symbol || 'tokena' } `
          }
          columnGap={ 1 }
          isLoading={ isPlaceholderData }
        >
          <Skeleton isLoaded={ !isPlaceholderData }>
            { totalReward.dividedBy(WEI).toFixed() } { currencyUnits.ether }
          </Skeleton>
          { rewardBreakDown }
        </DetailsInfoItem>
      ) }
      { data.rewards
        ?.filter(({ type }) => type !== 'Validator Reward' && type !== 'Miner Reward')
        .map(({ type, reward }) => (
          <DetailsInfoItem
            key={ type }
            title={ type }
            // is this text correct for validators?
            hint={ `Količina zajedničke nagrade. Validator dobiva nagradu za blok + naknadu za transakciju + naknade od blokova ujaka` }
          >
            { BigNumber(reward).dividedBy(WEI).toFixed() } { currencyUnits.ether }
          </DetailsInfoItem>
        ))
      }

      <DetailsInfoItemDivider/>
      <DetailsInfoItem
        title="Korištene jedinice"
        hint="Ukupna količina korištenih jedinica u bloku i postotak ispunjenosti bloka"
        isLoading={ isPlaceholderData }
      >
        <Skeleton isLoaded={ !isPlaceholderData }>
          { BigNumber(data.gas_used || 0).toFormat() }
        </Skeleton>
        <Utilization
          ml={ 4 }
          colorScheme="gray"
          value={ BigNumber(data.gas_used || 0).dividedBy(BigNumber(data.gas_limit)).toNumber() }
          isLoading={ isPlaceholderData }
        />
        { data.gas_target_percentage && (
          <>
            <TextSeparator color={ separatorColor } mx={ 1 }/>
            <GasUsedToTargetRatio value={ data.gas_target_percentage } isLoading={ isPlaceholderData }/>
          </>
        ) }
      </DetailsInfoItem>
      <DetailsInfoItem
        title="Limit jedinica"
        hint="Ukupni zajednički limit jedinica svih transakcija u bloku"
        isLoading={ isPlaceholderData }
      >
        <Skeleton isLoaded={ !isPlaceholderData }>
          { BigNumber(data.gas_limit).toFormat() }
        </Skeleton>
      </DetailsInfoItem>
      { /*
      { data.minimum_gas_price && (
        <DetailsInfoItem
          title="Minimum gas price"
          hint="The minimum gas price a transaction should have in order to be included in this block"
          isLoading={ isPlaceholderData }
        >
          <Skeleton isLoaded={ !isPlaceholderData }>
            { BigNumber(data.minimum_gas_price).dividedBy(GWEI).toFormat() } { currencyUnits.gwei }
          </Skeleton>
        </DetailsInfoItem>
      ) }
      { data.base_fee_per_gas && (
        <DetailsInfoItem
          title="Base fee per gas"
          hint="Minimum fee required per unit of gas. Fee adjusts based on network congestion"
          isLoading={ isPlaceholderData }
        >
          { isPlaceholderData ? (
            <Skeleton isLoaded={ !isPlaceholderData } h="20px" maxW="380px" w="100%"/>
          ) : (
            <>
              <Text>{ BigNumber(data.base_fee_per_gas).dividedBy(WEI).toFixed() } { currencyUnits.ether } </Text>
              <Text variant="secondary" whiteSpace="pre">
                { space }({ BigNumber(data.base_fee_per_gas).dividedBy(WEI_IN_GWEI).toFixed() } { currencyUnits.gwei })
              </Text>
            </>
          ) }
        </DetailsInfoItem>
      ) }
      */ }
      { !config.UI.views.block.hiddenFields?.burnt_fees && !burntFees.isEqualTo(ZERO) && (
        <DetailsInfoItem
          title="Naknada za odbačene jedinice"
          hint={
            `Količina odbačenih ${ config.chain.currency.symbol || 'tokena' } iz transakcije u bloku`
          }
          isLoading={ isPlaceholderData }
        >
          <IconSvg name="flame" boxSize={ 5 } color="gray.500" isLoading={ isPlaceholderData }/>
          <Skeleton isLoaded={ !isPlaceholderData } ml={ 2 }>
            { burntFees.dividedBy(WEI).toFixed() } { currencyUnits.ether }
          </Skeleton>
          { !txFees.isEqualTo(ZERO) && (
            <Tooltip label="Nakanada za odbačene jedinice / Naknada za transakcije * 100%">
              <Box>
                <Utilization
                  ml={ 4 }
                  value={ burntFees.dividedBy(txFees).toNumber() }
                  isLoading={ isPlaceholderData }
                />
              </Box>
            </Tooltip>
          ) }
        </DetailsInfoItem>
      ) }
      { data.priority_fee !== null && BigNumber(data.priority_fee).gt(ZERO) && (
        <DetailsInfoItem
          title="Napojnica za prioritet"
          hint="Napojnica koju korisnik daje za prioritet transakcije"
          isLoading={ isPlaceholderData }
        >
          <Skeleton isLoaded={ !isPlaceholderData }>
            { BigNumber(data.priority_fee).dividedBy(WEI).toFixed() } { currencyUnits.ether }
          </Skeleton>
        </DetailsInfoItem>
      ) }
      { /* api doesn't support extra data yet */ }
      { /* <DetailsInfoItem
        title="Extra data"
        hint={ `Any data that can be included by the ${ validatorTitle } in the block` }
      >
        <Text whiteSpace="pre">{ data.extra_data } </Text>
        <Text variant="secondary">(Hex: { data.extra_data })</Text>
      </DetailsInfoItem> */ }

      { /* CUT */ }
      { /*
      <GridItem colSpan={{ base: undefined, lg: 2 }}>
        <Element name="BlockDetails__cutLink">
          <Skeleton isLoaded={ !isPlaceholderData } mt={ 6 } display="inline-block">
            <Link
              fontSize="sm"
              textDecorationLine="underline"
              textDecorationStyle="dashed"
              onClick={ handleCutClick }
            >
              { isExpanded ? 'Sakrij detalje' : 'Prikaži detalje' }
            </Link>
          </Skeleton>
        </Element>
      </GridItem>
    */ }

      { /* ADDITIONAL INFO */ }
      { !isPlaceholderData && (
        <>
          <GridItem colSpan={{ base: undefined, lg: 2 }} mt={{ base: 1, lg: 4 }}/>

          { rollupFeature.isEnabled && rollupFeature.type === 'zkSync' && data.zksync &&
            <ZkSyncL2TxnBatchHashesInfo data={ data.zksync } isLoading={ isPlaceholderData }/> }

          { !isPlaceholderData && <BlockDetailsBlobInfo data={ data }/> }

          { data.bitcoin_merged_mining_header && (
            <DetailsInfoItem
              title="Bitcoin merged mining header"
              hint="Merged-mining field: Bitcoin header"
              flexWrap="nowrap"
              alignSelf="flex-start"
            >
              <Box whiteSpace="nowrap" overflow="hidden">
                <HashStringShortenDynamic hash={ data.bitcoin_merged_mining_header }/>
              </Box>
              <CopyToClipboard text={ data.bitcoin_merged_mining_header }/>
            </DetailsInfoItem>
          ) }
          { data.bitcoin_merged_mining_coinbase_transaction && (
            <DetailsInfoItem
              title="Bitcoin merged mining coinbase transaction"
              hint="Merged-mining field: Coinbase transaction"
            >
              <RawDataSnippet
                data={ data.bitcoin_merged_mining_coinbase_transaction }
                isLoading={ isPlaceholderData }
                showCopy={ false }
                textareaMaxHeight="100px"
              />
            </DetailsInfoItem>
          ) }
          { data.bitcoin_merged_mining_merkle_proof && (
            <DetailsInfoItem
              title="Bitcoin merged mining Merkle proof"
              hint="Merged-mining field: Merkle proof"
            >
              <RawDataSnippet
                data={ data.bitcoin_merged_mining_merkle_proof }
                isLoading={ isPlaceholderData }
                showCopy={ false }
                textareaMaxHeight="100px"
              />
            </DetailsInfoItem>
          ) }
          { data.hash_for_merged_mining && (
            <DetailsInfoItem
              title="Hash for merged mining"
              hint="Merged-mining field: Rootstock block header hash"
              flexWrap="nowrap"
              alignSelf="flex-start"
            >
              <Box whiteSpace="nowrap" overflow="hidden">
                <HashStringShortenDynamic hash={ data.hash_for_merged_mining }/>
              </Box>
              <CopyToClipboard text={ data.hash_for_merged_mining }/>
            </DetailsInfoItem>
          ) }
          { /*
          <DetailsInfoItem
            title="Težina"
            hint={ `Težina bloka za validatore koja se koristi za podešavanje vremena izgradnje bloka` }
          >
            <Box whiteSpace="nowrap" overflow="hidden">
              <HashStringShortenDynamic hash={ BigNumber(data.difficulty).toFormat() }/>
            </Box>
          </DetailsInfoItem>
          { data.total_difficulty && (
            <DetailsInfoItem
              title="Ukupna težina"
              hint="Ukupna težina lanca do trenutnog bloka"
            >
              <Box whiteSpace="nowrap" overflow="hidden">
                <HashStringShortenDynamic hash={ BigNumber(data.total_difficulty).toFormat() }/>
              </Box>
            </DetailsInfoItem>
          ) }

          <DetailsInfoItemDivider/>
          */ }
          <DetailsInfoItem
            title="Sažetak"
            hint="SHA256 sažetak bloka"
            flexWrap="nowrap"
          >
            <Box overflow="hidden">
              <HashStringShortenDynamic hash={ data.hash }/>
            </Box>
            <CopyToClipboard text={ data.hash }/>
          </DetailsInfoItem>
          { data.height > 0 && (
            <DetailsInfoItem
              title="Sažetak roditeljskog bloka"
              hint="Sažetak bloka iz kojeg je ovaj blok izgrađen"
              flexWrap="nowrap"
            >
              <LinkInternal
                href={ route({ pathname: '/block/[height_or_hash]', query: { height_or_hash: String(data.height - 1) } }) }
                overflow="hidden"
                whiteSpace="nowrap"
              >
                <HashStringShortenDynamic
                  hash={ data.parent_hash }
                />
              </LinkInternal>
              <CopyToClipboard text={ data.parent_hash }/>
            </DetailsInfoItem>
          ) }
          { /* api doesn't support state root yet */ }
          { /* <DetailsInfoItem
            title="State root"
            hint="The root of the state trie"
          >
            <Text wordBreak="break-all" whiteSpace="break-spaces">{ data.state_root }</Text>
          </DetailsInfoItem> */ }
          { /*
          { !config.UI.views.block.hiddenFields?.nonce && (
            <DetailsInfoItem
              title="Nonce"
              hint="Kriptografski broj korišten pri izgradnji bloka"
            >
              { data.nonce }
            </DetailsInfoItem>
          ) }
        */ }
        </>
      ) }
    </Grid>
  );
};

export default BlockDetails;
