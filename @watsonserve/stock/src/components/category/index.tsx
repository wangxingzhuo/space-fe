import { useMemo } from 'react';
import { IViewData } from '@/entities';
import classes from './index.module.styl';

const pfTable = [
  { title: '>=10%', percent: [10, 100] },
  { title: '4-10%', percent: [4, 10] },
  { title: '<4%', percent: [0, 4] },
];

const gainTable = [
  { title: '>=50%', percent: [50, 200] },
  { title: '10-50%', percent: [10, 50] },
  { title: '<10%', percent: [0, 10] },
  { title: 'loss', percent: [-100, 0] },
];

interface IProps {
  holdings: IViewData[];
  categoryDict: Record<string, string>;
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

function PanView(props: { data: ICate[]; offset?: number; step?: number; }) {
  const { data, offset = 0, step = 1 } = props;

  const viewData = useMemo(() => {
    const list = data.sort((a, b) => b.percent - a.percent);

    const comp = getDash(300);
    let off = 0;
    let cIdx = offset;
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
  }, [data, offset, step]);

  return (
    <div className={classes['pan-view']}>
      <svg viewBox="0 0 1000 1000" style={{ width: '120px', transform: 'rotate(-90deg)' }}>
        {viewData.map(item =>
          <circle
            key={item.category}
            cx="500" cy="500" r="300" fill="none"
            stroke={item.color}
            strokeWidth="400"
            strokeDasharray={item.dash}
            strokeDashoffset={item.off}
          />
        )}
      </svg>
      <table>
        <tbody>
        {viewData.map((item, idx) => (
          <tr key={idx}>
            <th style={{ textAlign: 'left' }}>{item.category}</th>
            <td style={{ textAlign: 'right', fontFamily: 'source-code-pro, Menlo, Monaco, Consolas, Courier New, monospace' }}>{item.percent}%</td>
          </tr>
        ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Category(props: IProps) {
  const { holdings = [], categoryDict = {} } = props;

  const data = useMemo(() => Object.values(holdings?.reduce<Record<string, ICate>>((pre, item) => {
    const cate = categoryDict[item.nc] || 'another';
    const percent = +((pre[cate]?.percent ?? 0) + item.percent).toFixed(2);
    pre[cate] = { category: cate, percent };
    return pre;
  }, {})), [categoryDict, holdings]);

  const markets = useMemo(() => Object.values(holdings?.reduce<Record<string, ICate>>((pre, item) => {
    const cate = item.currency;
    const percent = +((pre[cate]?.percent ?? 0) + item.percent).toFixed(2);
    pre[cate] = { category: cate, percent };
    return pre;
  }, {})), [holdings]);

  const pf = useMemo(() => Object.values(holdings?.reduce<Record<string, ICate>>((pre, item) => {
    const val = item.percent;
    const dst = pfTable.find(({ percent }) => {
      const [min, max] = percent;
      return min <= val && val < max;
    });
    const cate = dst!.title;
    const percent = +((pre[cate]?.percent ?? 0) + val).toFixed(2);
    pre[cate] = { category: cate, percent };
    return pre;
  }, {})), [holdings]);

  const gain = useMemo(() => Object.values(holdings?.reduce<Record<string, ICate>>((pre, item) => {
    const val = item.gainRate;
    const dst = gainTable.find(({ percent }) => {
      const [min, max] = percent;
      return min <= val && val < max;
    });
    const cate = dst!.title;
    const percent = +((pre[cate]?.percent ?? 0) + item.percent).toFixed(2);
    pre[cate] = { category: cate, percent };
    return pre;
  }, {})), [holdings]);

  return (
    <div className={classes['pan-set']}>
      <PanView data={data} />
      <PanView data={markets} step={2} />
      <PanView data={pf} offset={1} step={2} />
      <PanView data={gain} offset={2} step={2} />
    </div>
  )
}
