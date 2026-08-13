import { useMemo } from 'react';
import { IViewData } from '@/entities';
import { PanView, type ICate } from './pan-view';
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

const yieldTable = [
  { title: '>=5%', percent: [5, 100] },
  { title: '2-5%', percent: [2, 5] },
  { title: '<2%', percent: [0, 2] },
];

interface IProps {
  holdings: IViewData[];
  categoryDict: Record<string, string>;
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

  const divYield = useMemo(() => Object.values(holdings?.reduce<Record<string, ICate>>((pre, item) => {
    const val = item.dividendYield;
    const dst = yieldTable.find(({ percent }) => {
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
      <PanView title="Category" data={data} sort />
      <PanView title="Markets" data={markets} sort step={2} />
      <PanView title="Portfolio" data={pf} offset={1} step={2} />
      <PanView title="Gain" data={gain} sort offset={2} step={2} />
      <PanView title="Dividend Yield" data={divYield} offset={0} step={3} />
    </div>
  )
}
