import { useState, useEffect, useMemo, useCallback } from 'react';
import { useStore } from '@/store';
import { viewRow } from '@/helpers/view-data';
import DataTable from '@/components/data-table';
import Summary from './summary';
import Stat from './stat';
import viewTableClasses from '@/components/data-table/index.module.styl';

export default function App() {
  const [statMsg, setStatMsg] = useState(' ');
  const [headerOrder, setHeaderOrder] = useState<string[]>(['nc', 'percent', 'gainRate', 'dividendYield', 'price', 'count', 'cost']);
  const [sortBy, setSortBy] = useState('percent');
  const { state, initial, changeGain } = useStore();
  const { currency = '', handles = [], dateSeg = '', sumInfo = {} } = state;

  const viewData = useMemo(() => (handles as any[])?.sort((a, b) => b[sortBy] - a[sortBy]).map(r => viewRow(viewTableClasses, headerOrder, r)), [sortBy, handles]);

  const handleDataClick = useCallback((y: number, nc: string) => {
  }, []);

  const load = useCallback(async () => {
    setStatMsg('loading');

    try {
      await initial();
      setStatMsg('');
    } catch (err) {
      setStatMsg((err as Error).message);
    }
  }, []);

  useEffect(() => {
    load();
  }, []);

  return statMsg ? <Stat msg={statMsg} reload={load} /> : (
    <>
      <Summary dateSeg={dateSeg} currency={currency} sumInfo={sumInfo} changeGain={changeGain} />
      <DataTable headerFileds={headerOrder} viewData={viewData} sortBy={sortBy} setSortBy={setSortBy} onClick={handleDataClick} />
    </>
  )
}
