import { classify } from '@watsonserve/utils';
import classes from './stat.module.styl';
import Button from '@watsonserve/ui/button';

export default function Stat(props: { msg: string; reload?: () => void }) {
  const isLoading = 'loading' === props.msg;
  const showBtn = props.reload && props.msg && !isLoading;

  return (
    <div className={classify({ [classes['stat']]: true, [classes['loading']]: isLoading })}>
      <p className={classes['msg']}>{isLoading ? 'loading...' : props.msg}</p>
      {showBtn && <Button type="primary large" className={classes['reload']} title="reload" onClick={() => props.reload?.()} />}
    </div>
  );
}
