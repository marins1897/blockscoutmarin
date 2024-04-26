import React, { useCallback, useMemo, useState } from 'react';

import type { StatsChartInfo, StatsChartsSection } from 'types/api/stats';
import type { StatsIntervalIds } from 'types/client/stats';

import useApiQuery from 'lib/api/useApiQuery';
import useDebounce from 'lib/hooks/useDebounce';
import { STATS_CHARTS } from 'stubs/stats';

function isSectionMatches(section: StatsChartsSection, currentSection: string): boolean {
  return currentSection === 'all' || section.id === currentSection;
}

function isChartNameMatches(q: string, chart: StatsChartInfo) {
  return chart.title.toLowerCase().includes(q.toLowerCase());
}

export default function useStats() {
  const { data, isPlaceholderData, isError } = useApiQuery('stats_lines', {
    queryOptions: {
      placeholderData: STATS_CHARTS,
    },
  });

  const [ currentSection, setCurrentSection ] = useState('all');
  const [ filterQuery, setFilterQuery ] = useState('');
  const [ interval, setInterval ] = useState<StatsIntervalIds>('oneMonth');

  const filteredSections = useMemo(() => {
    const allowedSections = [ 'transactions', 'blocks', 'contracts' ];
    return data?.sections?.filter(section => allowedSections.includes(section.id));
  }, [ data ]);
  //const sectionIds = useMemo(() => data?.sections?.map(({ id }) => id), [ data ]);
  // Filtered sectionIds to include only 'transactions', 'blocks', and 'contracts'
  const sectionIds = useMemo(() => {
    const allowedSections = [ 'transactions', 'blocks', 'contracts' ];
    return data?.sections?.map(({ id }) => id).filter(id => allowedSections.includes(id));
  }, [ data ]);

  const debouncedFilterQuery = useDebounce(filterQuery, 500);

  const displayedCharts = React.useMemo(() => {
    // excluded chart IDs for each section
    const exclusions: Record<string, Array<string>> = {
      transactions: [ 'averageTxnFee', 'txnsFee' ],
      blocks: [ 'averageBlockRewards' ],
      contracts: [ 'newVerifiedContracts', 'verifiedContractsGrowth' ],
    };

    return filteredSections?.map(section => {
    // Filter out the excluded charts for the current section
      const charts = section.charts.filter(chart =>
        !exclusions[section.id]?.includes(chart.id) &&
        isChartNameMatches(debouncedFilterQuery, chart) && isSectionMatches(section, currentSection),
      );

      return {
        ...section,
        charts,
      };
    }).filter(section => section.charts.length > 0);
  }, [ filteredSections, debouncedFilterQuery, currentSection ]);

  const handleSectionChange = useCallback((newSection: string) => {
    setCurrentSection(newSection);
  }, []);

  const handleIntervalChange = useCallback((newInterval: StatsIntervalIds) => {
    setInterval(newInterval);
  }, []);

  const handleFilterChange = useCallback((q: string) => {
    setFilterQuery(q);
  }, []);

  return React.useMemo(() => ({
    sections: filteredSections,
    sectionIds,
    isPlaceholderData,
    isError,
    filterQuery,
    currentSection,
    handleSectionChange,
    interval,
    handleIntervalChange,
    handleFilterChange,
    displayedCharts,
  }), [
    filteredSections,
    sectionIds,
    isPlaceholderData,
    isError,
    filterQuery,
    currentSection,
    handleSectionChange,
    interval,
    handleIntervalChange,
    handleFilterChange,
    displayedCharts,
  ]);
}
