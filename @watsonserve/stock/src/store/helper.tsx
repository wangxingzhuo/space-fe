import { useCallback, useReducer, useRef } from 'react';
import { loadUsr, loadHoldings as __loadHoldings, loadRR, loadCalendar } from '@/api';
import { IROR, IState, ISumInfo, IViewData } from '@/entities';
import { comput } from '@/helpers/ror';
import { loadSettings } from '@/helpers/settings';

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
  readonly tomorrow: number;
  readonly today: number;
  protected _thisYear = 0;
  protected _lastYear = 0;

  constructor() {
    const now = new Date();
    const dayStamp = ~~(now.getTime() / 86400000);
    this.today = dayStamp * 86400;
    this.tomorrow = this.today + 86400;
  }

  setFiscalYearStartDate(fiscalYearStartDate: string) {
    const [month = '1', day = '1'] = String(fiscalYearStartDate).split('-');
    const startMonth = Math.max(1, Math.min(12, Number(month) || 1));
    const startDay = Math.max(1, Math.min(31, Number(day) || 1));
    const now = new Date();
    const curYear = now.getUTCFullYear();
    const curMonth = now.getUTCMonth() + 1;
    const curDay = now.getUTCDate();
    const fiscalYear = curMonth > startMonth || (curMonth === startMonth && curDay >= startDay) ? curYear : curYear - 1;
    this._thisYear = ~~(new Date(Date.UTC(fiscalYear, startMonth - 1, startDay)).getTime() / 1000);
    this._lastYear = ~~(new Date(Date.UTC(fiscalYear - 1, startMonth - 1, startDay)).getTime() / 1000);
    this.__rorCache = {};
    this.__infoCache = {};
  }

  protected getTimeSegment(tSeg: string): [number, number] {
    const { _thisYear, tomorrow, _lastYear } = this;
    return 'YTD' === tSeg ? [_thisYear, tomorrow] : [_lastYear, _thisYear];
  }

  protected async getRInfo(tag: string, currency: string) {
    const info = this.__infoCache[`${tag}_${currency}`];
    if (info) return JSON.parse(info);

    let ror = this.__rorCache[tag];
    const [start, end] = this.getTimeSegment(tag);
    if (!ror) {
      ror = await loadRR(start, end);
      this.__rorCache[tag] = ror;
    }
    const { lastDivDate, ..._info } = comput(start, end, currency, ror);
    this.__infoCache[`${tag}_${currency}`] = JSON.stringify(_info);
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

  async loadHoldings(currency: string = 'USD') {
    const today = this.today;
    const recently = today + 60 * 86400;
    const [result, rInfo] = await Promise.all([__loadHoldings(), this.getRInfo('YTD', currency)]);
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
      fiscalYear: '',
      currency: 'USD',
      dateSeg: 'YTD',
      sumInfo: {} as ISumInfo,
      holidays: [],
      categoryDict: {} as Record<string, string>
    } as IState
  );

  const changeGain = useCallback(async (tSeg: string, currency = 'USD') => {
    dispatch({ dateSeg: tSeg, currency });
    const sumInfo = await rInfoMgr.current.getSumInfo(tSeg, currency);
    dispatch({ sumInfo });
  }, [state]);

  const initial = useCallback(async () => {
    const settings = await loadSettings();
    const { currency, fiscalYear } = settings;
    rInfoMgr.current.setFiscalYearStartDate(fiscalYear);
    const { stocks, recentlyDividends, lastDivDate, sumInfo } = await rInfoMgr.current.loadHoldings(currency);
    const comingDivs = comingDividends(stocks, recentlyDividends, lastDivDate);

    const resp = await fetch(`/category.json?ncs=${stocks.map(({ nc }) => nc).join(',')}`);
    const categoryDict = await resp.json();

    dispatch({ handles: stocks, comingDivs, currency, fiscalYear, dateSeg: 'YTD', sumInfo, categoryDict });
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
