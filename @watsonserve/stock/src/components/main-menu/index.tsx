import Menu from '@watsonserve/ui/menu';
import { type IMenuTree } from '@watsonserve/ui/types';
import classes from './index.module.styl';
import IconPlus from '@/assets/icons/plus.svg';
import { useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';

interface IContextMenuProps {
  onClick: (name: string) => void;
  onClose?: () => void;
}

export default function ContextMenu(props: IContextMenuProps) {
  const loc = useLocation();

  const menuList: IMenuTree<string>[] = useMemo(() => {
    const isHome = loc.pathname === '/';
    return [{
      name: isHome ? 'records' : 'home',
      title: isHome ? 'records' : 'home',
    }, {
      name: 'add',
      title: 'add',
      Icon: IconPlus
    }];
  }, [loc.pathname]);

  const handleClick = useCallback((dist: IMenuTree<string>) => {
    props.onClick(dist.name);
  }, [props.onClick]);

  return (
    <div className={classes['main-menu']}>
      <Menu tree={menuList} onClick={handleClick} onClose={props.onClose} />
    </div>
  );
}
