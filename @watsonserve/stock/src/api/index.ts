import { HandleStock, IRedirect, IHandleStock, IUsr, ITade, IROR, ICalendar, IFiscalYearPeriod } from '@/entities';
import { Method, request } from '@watsonserve/connector';

export async function loadUsr() {
  try {
    const { data: body } = await request({
      api: `${globalThis.location?.origin || ''}/api/usr`
    });

    const { location: redirect, ...usr } = (body as { data: Partial<IUsr> & Partial<IRedirect> }).data;

    if (redirect) {
      location.replace(redirect);
      return null;
    }

    return usr as IUsr;
  } catch (err) {
    console.error((err as Error).message);
  }
  return null;
}

interface IHandle {
  stocks: IHandleStock[];
  fxs: Record<string, number>;
}

export async function loadHoldings() {
  const { data: body } = await request({
    api: `${globalThis.location?.origin || ''}/api/holdings`
  });

  const { stocks: _stocks, fxs } = (body as Record<string, IHandle>).data;

  let totalUSDAsset = 0;
  let totalUSDCost = 0;
  const stocks: HandleStock[] = [];

  for (const _st of _stocks) {
    const st = new HandleStock(_st, fxs[_st.currency]);
    stocks.push(st);
    const { usdMarketValue, usdCost } = st;
    totalUSDAsset += usdMarketValue;
    totalUSDCost += usdCost;
  }

  return { stocks, fxs, totalUSDAsset, totalUSDCost };
}

export async function recordAtrade(payload: ITade): Promise<void> {
  const { data: body } = await request({
    api: `${globalThis.location?.origin || ''}/api/record`,
    method: Method.PUT,
    data: payload,
    mode: 'same-origin',
    credentials: 'include'
  });

  const { status, msg } = body as Record<string, any>;
  return 200 === status ? undefined : Promise.reject(new Error(msg));
}

export async function loadRR(start: number, end: number) {
  const { data: body } = await request({
    api: `${globalThis.location?.origin || ''}/api/capital?start=${start}&end=${end}`
  });

  return (body as any).data as IROR;
}

export async function loadRecords(start: number, end: number): Promise<any[]> {
  const { data: body } = await request({
    api: `${globalThis.location?.origin || ''}/api/record`,
    method: Method.GET,
    data: { start, end }
  });

  const { status, msg, data } = body as Record<string, any>;
  return 200 === status ? data : Promise.reject(new Error(msg));
}

export async function loadCalendar() {
  const { data: list } = await request({ api: `${globalThis.location?.origin || ''}/api/calendar` });

  const markets: Record<string, ICalendar[]> = {};

  for (const item of list as ICalendar[]) {
    const { market, title, start, end } = item;

    const subList = markets[market] || [];
    markets[market] = subList;
    const afterOne = subList[0];

    // concat two holidays by weekend
    if (6 === new Date(end * 1000).getUTCDay() && afterOne && end + (86400000 << 1) === afterOne.start) {
      afterOne.start = start;
      afterOne.title = `${title} & ${afterOne.title}`;
      continue;
    }
    subList.unshift({ market, title, start, end });
  }

  return Object.values(markets).flat().sort((a, b) => b.start - a.start);
}

export async function loadFiscalYearOptions() {
  const { data: body } = await request({
    api: `${globalThis.location?.origin || ''}/api/fiscal-year-options`
  });
  return body as IFiscalYearPeriod[];
}

export async function loadFiscalYear() {
  const { data: body } = await request({
    api: `${globalThis.location?.origin || ''}/api/fiscal-year`
  });
  return (body as { data: string }).data;
}

export async function saveFiscalYear(period: string): Promise<void> {
  const { data: body } = await request({
    api: `${globalThis.location?.origin || ''}/api/fiscal-year`,
    method: Method.POST,
    data: { period },
    mode: 'same-origin',
    credentials: 'include'
  });

  const { status, msg } = body as Record<string, any>;
  return 200 === status ? undefined : Promise.reject(new Error(msg));
}
