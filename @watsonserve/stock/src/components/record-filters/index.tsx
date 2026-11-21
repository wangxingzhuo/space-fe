import Selector from '@watsonserve/ui/selector';
import { type INameTitle } from '@watsonserve/ui/types';
import { EnMarket, EnTType } from '@/entities';
import classes from './index.module.styl';

const marketOptions: INameTitle<EnMarket | null>[] = [
  { name: null, title: 'All' },
  { name: EnMarket.US, title: 'US' },
  { name: EnMarket.SG, title: 'SG' },
  { name: EnMarket.HK, title: 'HK' }
];

const tradeTypeOptions: INameTitle<EnTType | null>[] = [
  { name: null, title: 'All' },
  { name: EnTType.BUY, title: 'BUY' },
  { name: EnTType.SELL, title: 'SELL' },
  { name: EnTType.XD, title: 'XD' },
  { name: EnTType.XR, title: 'XR' }
];

interface IProps {
  market: EnMarket | null;
  tradeType: EnTType | null;
  onMarketChange: (market: EnMarket | null) => void;
  onTradeTypeChange: (tradeType: EnTType | null) => void;
}

export default function RecordFilters({ market, tradeType, onMarketChange, onTradeTypeChange }: IProps) {
  return (
    <div className={classes.filters}>
      <div className={classes.filter}>
        <span>Market</span>
        <Selector value={market} options={marketOptions} onInput={onMarketChange} />
      </div>
      <div className={classes.filter}>
        <span>Transaction type</span>
        <Selector value={tradeType} options={tradeTypeOptions} onInput={onTradeTypeChange} />
      </div>
    </div>
  );
}
