import { Decimal } from 'decimal.js';
import { IROR } from '@/entities';

interface IMWR {
  t: number;
  netCash: number;
}

interface IDaily {
  date: number;
  amount: number;
}

function sliceByDate(divs: IDaily[], s: number, e: number) {  
  const sIdx = divs.findIndex(item => s < item.date);
  if (sIdx < 0) return [];

  divs = divs.slice(sIdx);
  const eIdx = divs.findLastIndex(item => item.date <= e);
  if (eIdx < 0) return [];

  return divs.slice(0, eIdx+1);
}

function compXIRR(xir: IMWR[], xirr: Decimal) {
  const _compXIRR = (r: Decimal) => {
    return +xir.reduce((pre, item) => {
      const { t, netCash } = item;

      const _t = new Decimal(t.toFixed(3));
      const _netCash = new Decimal(netCash.toFixed(3));

      return pre.add(_netCash.div(r.pow(_t)));
    }, new Decimal(0)).toFixed(3);
  };

  let s = new Decimal(0.1);
  let e = new Decimal(2);

  for (let n = 20; 0 <= n && e.sub(s).gt(0.00005); n--) {
    switch (Math.sign(_compXIRR(xirr))) {
      case 1:
        s = xirr;
        break;
      case -1:
        e = xirr;
        break;
      default:
        return xirr;
    }
    xirr = s.add(e).div(2);
  }

  return xirr;
}

function exchange(ror: IROR, curr = 'USD') {
  let { twr: _twr, mwr: _xir, dividend: _dividend, realised: _realised } = ror;
  const twr = _twr.map(item => {
    const { fxs, gap, date } = item;
    const fx = fxs[curr] || 1;
    return { date, nextOpen: fx * gap.next_open, prevClose: fx * gap.prev_close };
  });
  const xir = _xir.map(item => {
    const { t, fxs, net_cash } = item;
    return { t, netCash: (fxs[curr] || 1) * net_cash };
  });
  const dividend = _dividend.map(item => {
    const { date, fxs, amount } = item;
    return { date, amount: (fxs[curr] || 1) * amount };
  });
  const realised = _realised.reduce((sum, item) => {
    const { fxs, amount } = item;
    return sum + (fxs[curr] || 1) * amount;
  }, 0);
  return { twr, xir, dividend, realised };
}

function sumCashStream(sDay: number, xir: IMWR[], dividend: IDaily[]) {
  let simCost = 0;
  let simYield = 0;
  xir.forEach(item => {
    const { netCash } = item;
    if (netCash < 0) {
      simCost += -netCash;
      return;
    }
    simYield += netCash;
  });

  xir = xir.slice();
  const allDivid = +dividend.reduce((sum, item) => {
    const { date, amount } = item;
    xir.push({ t: ~~(date / 86400 - sDay) / 365, netCash: amount });
    return sum + amount;
  }, 0).toFixed(2);
  const appreciation = simYield - simCost;
  const srr = +new Decimal(appreciation + allDivid).div(new Decimal(simCost)).mul(100).toFixed(2);
  return { srr, allDivid, xir, appreciation: simYield - simCost };
}

export function comput(sTime: number, eTime: number, curr = 'USD', ror: IROR) {
  const { twr, xir: _xir, dividend, realised } = exchange(ror, curr);
  const sDay = ~~(sTime / 86400) - 1;
  const { srr, allDivid, xir, appreciation } = sumCashStream(sDay, _xir, dividend);

  let gain = new Decimal(1);
  for (let i = 1; i < twr.length; i++) {
    const { date: prevDate, nextOpen } = twr[i - 1];
    const { date: nextDate, prevClose } = twr[i];
    const dl = sliceByDate(dividend, prevDate, nextDate);
    const divi = dl.reduce((sum, item) => sum + item.amount, 0);

    gain = new Decimal(prevClose).add(divi.toFixed(3)).mul(gain).div(nextOpen);
    // debugFoo.push(
    //   `${new Date(prevDate*1000).toJSON().substring(0, 10)}~${new Date(nextDate*1000).toJSON().substring(0, 10)} ${close.sub(open).toFixed(3)}`
    // );
  }

  // console.log(debugFoo.join('\n'));
  const progressOfYear = 365 / (~~(eTime / 86400) - sDay - 1);
  const twrr = +gain.sub(1).mul(100).toFixed(2);
  
  const twrrForYear = +gain.pow(progressOfYear).sub(1).mul(100).toFixed(2)
  const srrForYear = srr * progressOfYear;
  const xirr = +compXIRR(xir, new Decimal(1 + twrrForYear / 100)).sub(1).mul(100).toFixed(2);

  return {
    xirr,
    srr, srrForYear,
    twrr, twrrForYear,
    allDivid, realised,
    unrealised: appreciation - realised,
    lastDivDate: dividend[dividend.length-1]?.date || 0
  };
}
