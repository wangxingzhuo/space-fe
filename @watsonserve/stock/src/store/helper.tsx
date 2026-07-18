import { useCallback, useReducer, useRef } from 'react';
import { loadUsr, loadHandles as __loadHandles, loadRR, loadCalendar } from '@/api';
import { IROR, IState, ISumInfo, IViewData } from '@/entities';
import { comput } from '@/helpers/ror';

interface IDetail {
  fxs: Record<string, number>;
  totalDivTTM: number;
  totalUSDCost: number;
  totalUSDAsset: number;
}

class RInfoMgr {
  private __rorCache: Record<string, IROR> = {};
  private __infoCache: Record<string, string> = {};
  private __totalDetails: Partial<IDetail> = {};
  private __lastDivDate = 0;
  readonly lastYear: number;
  readonly thisYear: number;
  readonly tomorrow: number;
  readonly today: number;

  constructor() {
    const now = new Date();
    const dayStamp = ~~(now.getTime() / 86400000);
    this.today = dayStamp * 86400;
    this.tomorrow = this.today + 86400;
    const year = now.getUTCFullYear();
    this.lastYear = ~~(new Date(Date.UTC(year-1)).getTime() / 1000);
    this.thisYear = ~~(new Date(Date.UTC(year)).getTime() / 1000);
  }

  protected getTimeSegment(tSeg: string): [number, number] {
    const { thisYear, tomorrow, lastYear } = this;
    return 'YTD' === tSeg ? [thisYear, tomorrow] : [lastYear, thisYear];
  }

  async getRInfo(tag: string, currency: string) {
    const info = this.__infoCache[`${tag}_${currency}`];
    if (info) return JSON.parse(info);

    let ror = this.__rorCache[tag];
    const [start, end] = this.getTimeSegment(tag);
    if (!ror) {
      ror = await loadRR(start, end);
      this.__rorCache[tag] = ror;
    }
    const { lastDivDate, ..._info } = comput(start, end, currency, ror);
    this.__infoCache[tag] = JSON.stringify(_info);
    if (!this.__lastDivDate) {
      this.__lastDivDate = lastDivDate;
    }
    return _info;
  }

  async getSumInfo(tag: string, currency: string) {
    const rInfo = await this.getRInfo(tag, currency);
    const { fxs, totalDivTTM = 0, totalUSDCost = 0, totalUSDAsset = 0 } = this.__totalDetails;
    const fx = fxs?.[currency] || 1;

    return {
      ...rInfo,
      totalDivTTM: totalDivTTM * fx,
      totalCost: totalUSDCost * fx,
      totalAsset: totalUSDAsset * fx,
    } as ISumInfo;
  }

  async loadHandles() {
    const today = this.today;
    const recently = today + 60 * 86400;
    const [result, rInfo] = await Promise.all([__loadHandles(), this.getRInfo('YTD', 'USD')]);
    const { fxs, stocks: _stocks, totalUSDAsset, totalUSDCost } = result;

    const stocks: IViewData[] = [];
    let totalDivTTM = 0;
    const recentlyDividends: any[] = [];

    for (const st of _stocks) {
      const { nc, usdMarketValue, gainRate, currency, count, dividendYield, price, cost, usdDividendTTM, dividend } = st;
      totalDivTTM += usdDividendTTM;

      dividend.forEach(item => {
        const { ex, paid } = item;
        if (today <= ex && ex < recently || today <= paid && paid < recently)
          recentlyDividends.push({ ...item, nc, ex, paid });
      });

      const percent = usdMarketValue * 100 / totalUSDAsset;
      stocks.push({ nc, percent, gainRate, currency, count, dividendYield, price, book: +(cost / count).toFixed(3), cost } as IViewData);
    }

    this.__totalDetails = { fxs, totalDivTTM, totalUSDCost, totalUSDAsset };

    return {
      stocks,
      recentlyDividends,
      lastDivDate: this.__lastDivDate,
      sumInfo: {
        ...rInfo,
        totalDivTTM,
        totalCost: totalUSDCost,
        totalAsset: totalUSDAsset,
      } as ISumInfo
    };
  }
}

function comingDividends(stocks: IViewData[], recentlyDividends: any[], lastDivDate: number) {
  const startIdx = recentlyDividends.findIndex(item => lastDivDate < item.paid);
  const stMap = new Map(stocks.map(item => [item.nc, item]));

  return recentlyDividends.slice(startIdx).map(item => {
    const { nc, paid: _paid, currency, amount: _amount } = item;
    const st = stMap.get(nc)!;
    const paid = new Date(_paid * 1000).toJSON().substring(0, 10);
    const amount = (_amount * st.count * ('USD' === st.currency ? 0.9 : 1)).toLocaleString();

    return { paid, nc, currency, amount };
  })
  .sort((a, b) => a.paid.localeCompare(b.paid))
  .map(item => {
    const { nc, paid, currency, amount } = item;
    return `${paid}\t${nc}\t${currency.substring(0, 2)}$ ${amount}`;
  });
}

export function useData() {
  const rInfoMgr = useRef(new RInfoMgr());
  const [state, dispatch] = useReducer(
    (prevState, payload) => ({ ...prevState, ...payload }),
    {
      usr: { name: '', avatar: '' },
      handles: [] as IViewData[],
      comingDivs: [],
      currency: 'USD',
      dateSeg: 'YTD',
      sumInfo: {} as ISumInfo,
      holidays: []
    } as IState
  );

  const changeGain = useCallback(async (tSeg: string, currency = 'USD') => {
    dispatch({ dateSeg: tSeg, currency });
    const sumInfo = await rInfoMgr.current.getSumInfo(tSeg, currency);
    dispatch({ sumInfo });
  }, [state]);

  const initial = useCallback(async () => {
    const { stocks, recentlyDividends, lastDivDate, sumInfo } = await rInfoMgr.current.loadHandles();
    const comingDivs = comingDividends(stocks, recentlyDividends, lastDivDate);

    dispatch({ handles: stocks, comingDivs, currency: 'USD', dateSeg: 'YTD', sumInfo });
  }, []);

  const loadUser = useCallback(() => {
    loadUsr().then(usr => usr && dispatch({ usr }));
  }, []);

  const loadCalendarTips = useCallback(async () => {
    const list = await loadCalendar();
    const holidays = [] as any[];

    for (const item of list) {
      const { market, title, start, end } = item;
      const startDate = new Date(start * 1000);
      const endDate = new Date(end * 1000 - 86400000);
      const afterOne = holidays[0];
      const strStart = startDate.toJSON().substring(0, 10);
      const strEnd = endDate.toJSON().substring(0, 10);
      const desc = strStart === strEnd ? strStart : `${strStart} ~ ${strEnd}`;

      if (afterOne && afterOne.start <= end) {
        Object.assign(afterOne, {
          start: start,
          end: Math.max(end, afterOne.end),
          title: `${title} & ${afterOne.title}`,
          desc: `${market}: ${desc}; ${afterOne.desc}`
        });
        continue;
      }

      holidays.unshift({
        start, end, title,
        desc: `${market}: ${desc}`
      });
    }

    dispatch({ holidays });
  }, []);

  return { state, loadUser, initial, loadCalendarTips, changeGain };
}
