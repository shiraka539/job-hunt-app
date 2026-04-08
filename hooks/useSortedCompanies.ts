import { useState, useMemo } from 'react';
import { CompanyViewData } from '../types';
import { STATUS_SORT_ORDER } from '../constants/status';

export type SortType = 'deadline' | 'name' | 'status';

export function useSortedCompanies(initialCompanies: CompanyViewData[]) {
  const [sortType, setSortType] = useState<SortType>('deadline');

  const sortedCompanies = useMemo(() => {
    return [...initialCompanies].sort((a, b) => {
      if (sortType === 'name') {
        return a.name.localeCompare(b.name, 'ja');
      } else if (sortType === 'status') {
        const idxA = STATUS_SORT_ORDER.indexOf(a.status as any);
        const idxB = STATUS_SORT_ORDER.indexOf(b.status as any);
        return (idxA > -1 ? idxA : 99) - (idxB > -1 ? idxB : 99);
      } else {
        // deadline
        if (!a.deadline && !b.deadline) return 0;
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      }
    });
  }, [initialCompanies, sortType]);

  return {
    sortType,
    setSortType,
    sortedCompanies
  };
}
