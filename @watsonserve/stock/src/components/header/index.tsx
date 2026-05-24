import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import Button from '@watsonserve/ui/button';
import Avatar from '@watsonserve/ui/avatar';
import { useStore } from '@/store';
import { ITade } from '@/entities';
import { recordAtrade } from '@/api';
import RecordTrade from '@/components/record-trade';
import Tips from '@/components/tips';
import ContextMenu from '../main-menu';
import classes from './index.module.styl';
import IconBell from '@/assets/icons/bell.svg';
import IconList from '@/assets/icons/list.svg';

export default function Header() {
  const { state, loadCalendarTips } = useStore();
  const { usr, comingDivs = [], holidays = [] } = state;
  const [menuShow, showMenu] = useState(false);
  const [recordFormHasShow, showRecordForm] = useState(false);
  const [tipsShow, showTips] = useState(false);
  const navigate = useNavigate();

  const handleMenuBtn = useCallback((ev: React.MouseEvent) => {
    ev.stopPropagation();
    showMenu(true);
  }, []);

  const handleMenu = useCallback((name: string) => {
    showMenu(false);
    switch (name) {
      case 'home':
        return navigate('/');
      case 'records':
        return navigate('/records');
      case 'add':
        return showRecordForm(true);
      default:
        break;
    }
  }, []);

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
          <Button type="round" className={classes['btn-menu']} onClick={handleMenuBtn}>
            <IconList className={classes['icon']} />
          </Button>
        </div>
      </header>
      {menuShow && <ContextMenu onClick={handleMenu} onClose={() => showMenu(false)} />}
      {recordFormHasShow && <RecordTrade onSubmit={handleSubmit} onClose={() => showRecordForm(false)} />}
      {tipsShow && <Tips holidays={holidays} comingDivs={comingDivs} onClose={() => showTips(false)} />}
    </>
  );
}
