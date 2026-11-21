import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { loadRecords } from '@/api';
import { EnMarket, EnTType, type ITade } from '@/entities';
import { viewRow } from '@/helpers/view-data';
import DataTable from '@/components/data-table';
import RecordFilters from '@/components/record-filters';
import classes from '@/components/data-table/index.module.styl';

function getQuarterRange(offset: number, anchor: Date) {
  const quarterMonth = Math.floor(anchor.getUTCMonth() / 3) * 3 - offset * 3;
  const start = Date.UTC(anchor.getUTCFullYear(), quarterMonth, 1);
  const nextQuarter = Date.UTC(anchor.getUTCFullYear(), quarterMonth + 3, 1);

  return {
    start: Math.floor(start / 1000),
    end: offset ? Math.floor(nextQuarter / 1000) - 1 : Math.floor(anchor.getTime() / 1000)
  };
}

export default function Records() {
  const headerFileds = ['ttime', 'nc', 'cost', 'count', 'realise'];
  const [records, setRecords] = useState<ITade[]>([]);
  const [market, setMarket] = useState<EnMarket | null>(null);
  const [tradeType, setTradeType] = useState<EnTType | null>(null);
  const pageOffset = useRef(-1);
  const loading = useRef(false);
  const requestId = useRef(0);
  const quarterAnchor = useRef(new Date());
  const loadArmed = useRef(true);
  const hasMore = useRef(true);

  const loadPage = useCallback(async (offset: number, replace: boolean) => {
    if (loading.current || !hasMore.current) return;

    loading.current = true;
    const currentRequestId = ++requestId.current;

    try {
      let nextOffset = offset;
      while (currentRequestId === requestId.current && hasMore.current) {
        const { start, end } = getQuarterRange(nextOffset, quarterAnchor.current);
        const list = await loadRecords(start, end, market, tradeType);
        if (currentRequestId !== requestId.current) return;

        if (null === list) {
          hasMore.current = false;
          loadArmed.current = false;
          return;
        }

        if (list.length) {
          pageOffset.current = nextOffset;
          setRecords(current => replace ? list : [...current, ...list]);
          return;
        }

        nextOffset++;
      }
    } finally {
      if (currentRequestId === requestId.current) {
        loading.current = false;
        if (hasMore.current) loadArmed.current = true;
      }
    }
  }, [market, tradeType]);

  useEffect(() => {
    requestId.current++;
    loading.current = false;
    quarterAnchor.current = new Date();
    pageOffset.current = -1;
    hasMore.current = true;
    loadArmed.current = true;
    setRecords([]);
    void loadPage(0, true);

    return () => {
      requestId.current++;
      loading.current = false;
    };
  }, [loadPage]);

  useLayoutEffect(() => {
    const distanceToBottom = document.documentElement.scrollHeight - window.scrollY - window.innerHeight;
    if (distanceToBottom > window.innerHeight * 0.2) {
      loadArmed.current = true;
    }
  }, [records]);

  const handleScroll = useCallback(() => {
    const distanceToBottom = document.documentElement.scrollHeight - window.scrollY - window.innerHeight;
    if (distanceToBottom > window.innerHeight * 0.2) {
      loadArmed.current = true;
      return;
    }

    if (loadArmed.current && !loading.current) {
      loadArmed.current = false;
      void loadPage(pageOffset.current + 1, false);
    }
  }, [loadPage]);

  useEffect(() => {
    let frame: number | null = null;
    const scheduleScrollCheck = () => {
      if (null !== frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = null;
        handleScroll();
      });
    };

    window.addEventListener('scroll', scheduleScrollCheck, { passive: true });

    return () => {
      window.removeEventListener('scroll', scheduleScrollCheck);
      if (null !== frame) window.cancelAnimationFrame(frame);
    };
  }, [handleScroll]);

  const data = records.map(item => viewRow(classes, headerFileds, item));

  return (
    <div className="app">
      <RecordFilters
        market={market}
        tradeType={tradeType}
        onMarketChange={setMarket}
        onTradeTypeChange={setTradeType}
      />
      <DataTable headerFileds={headerFileds} viewData={data} />
    </div>
  );
}
