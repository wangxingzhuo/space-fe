import { useCallback, useEffect, useState } from 'react';
import Button from '@watsonserve/ui/button';
import Avatar from '@watsonserve/ui/avatar';
import { useStore } from '@/store';
import { ITade } from '@/entities';
import { recordAtrade } from '@/api';
import RecordTrade from '@/components/record-trade';
import Tips from '@/components/tips';
import classes from './index.module.styl';
import IconBell from '@/assets/icons/bell.svg';
import IconPlus from '@/assets/icons/plus.svg';

export default function Header() {
  const { state, loadCalendarTips } = useStore();
  const { usr, comingDivs = [], holidays = [] } = state;
  const [recordFormHasShow, showRecordForm] = useState(false);
  const [tipsShow, showTips] = useState(false);

  const handleSubmit = useCallback(async (dataSet: ITade) => {
    try {
      await recordAtrade(dataSet);
      showRecordForm(false);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    loadCalendarTips();
  }, []);

  return (
    <>
      <header className={classes['header']}>
        <div className={classes['user']}>
          <Avatar src={usr.avatar} alt={usr.name[0]} />
          <div className={classes['nick-name']}>{ usr.name }</div>
        </div>

        <div className={classes['btn-group']}>
          <Button type="round" className={classes['btn-bell']} title="tip" onClick={() => showTips(true)}>
            <IconBell className={classes['icon']} />
          </Button>
          <Button type="round" className={classes['btn-plus']} onClick={() => showRecordForm(true)}>
            <IconPlus className={classes['icon']} />
          </Button>
        </div>
      </header>
      {recordFormHasShow && <RecordTrade onSubmit={handleSubmit} onClose={() => showRecordForm(false)} />}
      {tipsShow && <Tips holidays={holidays} comingDivs={comingDivs} onClose={() => showTips(false)} />}
    </>
  );
}
