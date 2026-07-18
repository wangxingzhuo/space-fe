import { classify } from '@watsonserve/utils';
import { IViewData } from '@/entities';

const ginsColor = ['st-loss', 'st-gray', 'st-gins'];

export interface IDataFiled {
  filed: string;
  className: string;
  viewVal: any;
  isImp: boolean;
}

type VFunc = string|((row: Partial<IViewData>) => [string, number]);

export const dict: Record<string, { title: string; vType: VFunc; impLine?: number; }> = {
  nc:            { title: 'Code',     vType: 'str' },
  percent:       { title: 'Pa.',      vType: 'rate', impLine: 5 },
  gainRate:      { title: 'Chg',      vType: 'rate', impLine: 20 },
  price:         { title: 'Price',    vType: 'money' },
  count:         { title: 'Count',    vType: 'num' },
  cost:          { title: 'Cost',     vType: 'money' },
  book:          { title: 'book',     vType: 'money' },
  dividendYield: { title: 'Yield',    vType: 'rate', impLine: 5 },
  ttime:         { title: 'Date',     vType: 'date' },
  realise:       { title: 'Realised', vType: 'money' },
};

const dataRender: Record<string, (n: number) => string> = {
  date: (n: number) => new Date(n * 1000).toJSON().substring(0, 10),
  rate: (n: number) => `${n.toFixed(2)}%`,
  num: (n: number) => n.toLocaleString()
};

export function viewRow(classes: Record<string, string>, headerOrder: string[], row: Partial<IViewData>): IDataFiled[] {
  const { gainRate = 0, currency } = row;
  const curr = `${currency?.substring(0, 2)}$`;
  const glStyl = ginsColor[Math.sign(gainRate) + 1];

  const vRow = headerOrder.map(filed => {
    let { vType: _vType, impLine = 0 } = dict[filed];
    let val = 0;
    let vType = '';
    if ('string' !== typeof _vType) {
      [vType, val] = _vType(row)
    } else {
      vType = _vType;
      val = (row as any)[filed];
    }
    const isImp = 'rate' === vType && impLine < val;
    const className = classify({
      [classes[`st-${vType}`]]: true,
      [classes[glStyl]]: 'gainRate' === filed,
      [classes['st-imp']]: isImp
    });
    const viewVal = 'money' === vType ? `${curr} ${dataRender.num(val)}` : dataRender[vType]?.(val) || val;
    return { filed, className, viewVal, isImp };
  });

  if (1 < vRow.filter(cell => cell.isImp).length) {
    vRow[0].className += ` ${classes['st-imp']}`;
  }

  return vRow;
}
