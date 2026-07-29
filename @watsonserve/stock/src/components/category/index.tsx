import { useMemo } from 'react';
import { IViewData } from '@/entities';

const categoryDict = new Map([
    ['D05', 'Bank'],
    ['00005', 'Bank'],
    ['C', 'Bank'],
    ['C6L', 'Airline'],
    ['00293', 'Airline'],
    ['BRK.B', 'Finance'],
    ['AXP', 'Finance'],
    ['AAPL', 'Technology'],
    ['GOOGL', 'Technology'],
    ['MSFT', 'Technology'],
    ['TXN', 'Technology'],
    ['CVX', 'Petroleum'],
    ['OXY', 'Petroleum'],
]);

interface IProps {
  holdings: IViewData[];
}

interface ICate {
  category: string;
  percent: number;
}

interface IPan extends ICate {
  color: string;
  dash: string;
  off: number;
}

const colors = [
  '255, 56, 60',
  '255, 141, 40',
  '255, 204, 0',
  '52, 199, 89',
  '0, 195, 208',
  '0, 136, 255',
  '97, 85, 245',
  '203, 48, 224',
  '255, 45, 85',
  '172, 127, 94',
  '0, 200, 179',
  '0, 192, 232',
];

const PI = 3.1415926;
function getDash(r: number) {
  const foo = 2 * PI * r;

  return (percent: number) => {
    const bar = +(foo * percent).toFixed(3);
    return [bar, foo - bar] as [number, number];
  };
}

function PanView(props: { data: ICate[]; step?: number; }) {
  const { data, step = 1 } = props;

  const viewData = useMemo(() => {
    const list = data.sort((a, b) => b.percent - a.percent);

    const comp = getDash(300);
    let off = 0;
    let cIdx = 0;
    for (let i = 0; i < list.length; i++) {
      const item = list[i];
      const [dash, space] = comp(item.percent / 100);
      Object.assign(item, {
        color: `rgb(${colors[cIdx]})`,
        dash: [dash, space].join(','),
        off
      });
      off -= dash;
      cIdx += step;
    }

    return list as IPan[];
  }, [data, step]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <svg viewBox="0 0 1000 1000" style={{ width: '120px' }}>
        {viewData.map(item =>
          <circle
            cx="500" cy="500" r="300" fill="none"
            stroke={item.color}
            stroke-width="400"
            stroke-dasharray={item.dash}
            stroke-dashoffset={item.off}
          />
        )}
      </svg>
      <table>
        {viewData.map((item, idx) => (
          <tr key={idx}>
            <th style={{ textAlign: 'left' }}>{item.category}</th>
            <td style={{ textAlign: 'right', fontFamily: 'source-code-pro, Menlo, Monaco, Consolas, Courier New, monospace' }}>{item.percent}%</td>
          </tr>
        ))}
      </table>
    </div>
  );
}

export default function Category(props: IProps) {
  const { holdings = [] } = props;

  const markets = useMemo(() => Object.values(holdings?.reduce<Record<string, ICate>>((pre, item) => {
    const cate = item.currency;
    const percent = +((pre[cate]?.percent ?? 0) + item.percent).toFixed(2);
    pre[cate] = { category: cate, percent };
    return pre;
  }, {})), [holdings]);

  const data = useMemo(() => Object.values(holdings?.reduce<Record<string, ICate>>((pre, item) => {
    const cate = categoryDict.get(item.nc) || 'another';
    const percent = +((pre[cate]?.percent ?? 0) + item.percent).toFixed(2);
    pre[cate] = { category: cate, percent };
    return pre;
  }, {})), [holdings]);

  return (
    <>
      <PanView data={data} />
      <PanView data={markets} step={2} />
    </>
  )
}
