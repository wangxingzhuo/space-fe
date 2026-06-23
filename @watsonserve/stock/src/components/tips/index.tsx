import { useMemo } from 'react';
import { IHoliday } from '@/entities';
import Modal from '@/components/modal';
import classes from './index.module.styl';

interface IProps {
  holidays: IHoliday[];
  comingDivs: string[];
  onClose: () => void;
}

export default function Tips(props: IProps) {
  const { holidays: _holidays, comingDivs, onClose } = props;
  const holidays = useMemo(() => _holidays.map(item => ({
    ...item,
    desc: item.desc.split('; ')
  })), [comingDivs]);
  const dividends = useMemo(() => comingDivs.map(item => item.split('\t')), [comingDivs]);

  return (
    <Modal onClose={onClose}>
      <div className={classes['tips']}>
        <h4 className={classes['tips-category']}>Holidays</h4>
        {holidays.map(item => (
          <dl className={classes['tips-detail']} key={item.title}>
            <dt className={classes['tips-holiday']}>{item.title}</dt>
            {item.desc.map(desc => (<dd key={desc}>{desc}</dd>))}
          </dl>
        ))}

        <hr />

        <h4 className={classes['tips-category']}>Dividends</h4>
        <table className={classes['tips-table']}>
          <thead>
            <tr>
              <th className={classes['tips-date']}>date</th>
              <th className={classes['tips-code']}>code</th>
              <th className={classes['tips-amount']}>amount</th>
            </tr>
          </thead>
          <tbody>
            {dividends.map((row, idx) => (
              <tr key={idx}>
                <td className={classes['tips-date']}>{row[0]}</td>
                <td className={classes['tips-code']}>{row[1]}</td>
                <td className={classes['tips-amount']}>{row[2]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Modal>
  );
}
