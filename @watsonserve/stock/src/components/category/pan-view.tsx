import { useMemo } from 'react';
import classes from './index.module.styl';

export interface ICate {
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

interface IPanViewProps {
  data: ICate[];
  title?: string;
  offset?: number;
  step?: number;
  sort?: boolean;
}

export function PanView(props: IPanViewProps) {
  const { title, data, offset = 0, step = 1, sort = false } = props;

  const viewData = useMemo(() => {
    const list = sort ? data.sort((a, b) => b.percent - a.percent) : data;

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
      <div className={classes['pan-view-left']}>
        {title ? <h6 className={classes['pan-view-title']}>{title}</h6> : null}
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
      </div>
      <table className={classes['pan-view-table']}>
        <tbody>
        {viewData.map((item, idx) => (
          <tr key={idx}>
            <th style={{ textAlign: 'left' }}>{item.category}</th>
            <td className={classes['pan-view-td']}>{item.percent}%</td>
          </tr>
        ))}
        </tbody>
      </table>
    </div>
  );
}
