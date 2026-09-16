import { useMemo } from 'react';
import { ISumInfo } from '@/entities';
import Button from '@watsonserve/ui/button';
import classes from './summary.module.styl';

interface IProps {
  dateSeg: string;
  currency: string;
  sumInfo: Partial<ISumInfo>;
  changeGain: (tag: string, currency: string) => void;
}

export default function Summary(props: IProps) {
  const { dateSeg, currency, sumInfo, changeGain } = props;
  const {
    totalDivTTM = 0, totalCost = 0, totalAsset = 0,
    unrealised = 0, allDividend = 0, realised = 0,
    twrr = 0, twrrForYear = 0, mwrrForYear = 0, srr = 0, srrForYear = 0
  } = sumInfo;

  const list = useMemo(() => {
    let curr = currency.substring(0, 2);
    curr = curr + ('CN' === curr ? '¥' : '$');
    return [
      ['Dividend (TTM)', `${curr} ${totalDivTTM.toLocaleString()}`],
      ['Dividend Yield (TTM)', `${(totalDivTTM / totalCost * 100).toFixed(2)}%`],
      ['Assets', `${curr} ${totalAsset.toLocaleString()}`],

      ['Dividend (YTD)', `${curr} ${allDividend.toLocaleString()}`],
      ['Unrealised (YTD)', `${curr} ${unrealised.toLocaleString()}`],
      ['Realised (YTD)', `${curr} ${realised.toLocaleString()}`],

      ['SRR (YTD / FY)', `${srr.toFixed(2)}% / ${srrForYear.toFixed(2)}%`],
      ['MWRR (FY)', `${mwrrForYear.toFixed(2)}%`],
      ['TWRR (YTD / FY)', `${twrr.toFixed(2)}% / ${twrrForYear.toFixed(2)}%`],
    ].filter(Boolean) as [string, string][];
  }, [totalDivTTM, totalCost, totalAsset, twrr, unrealised, allDividend, twrrForYear, mwrrForYear, srrForYear]);

  return (
    <>
      <div className={classes['data-row']}>
        <div>
          <Button type="round" active={'LFY' === dateSeg} disabled={'LFY' === dateSeg} onClick={() => changeGain('LFY', currency)}>LFY</Button>
          <Button type="round" active={'YTD' === dateSeg} disabled={'YTD' === dateSeg} onClick={() => changeGain('YTD', currency)}>YTD</Button>
        </div>
        <div>
          <Button type="round" active={'USD' === currency} disabled={'USD' === currency} onClick={() => changeGain(dateSeg, 'USD')}>USD</Button>
          <Button type="round" active={'HKD' === currency} disabled={'HKD' === currency} onClick={() => changeGain(dateSeg, 'HKD')}>HKD</Button>
          <Button type="round" active={'SGD' === currency} disabled={'SGD' === currency} onClick={() => changeGain(dateSeg, 'SGD')}>SGD</Button>
          <Button type="round" active={'CNY' === currency} disabled={'CNY' === currency} onClick={() => changeGain(dateSeg, 'CNY')}>CNY</Button>
        </div>
      </div>
      <ul className={classes['summary']}>
        {list.map((item, idx) => (
          <li className={classes['smy-item']} key={idx}>
            <span className={classes['smy-title']}>{ item[0] }</span>
            <span className={classes['smy-val']}>{ item[1] }</span>
          </li>
        ))}
      </ul>
    </>
  );
}
