import { useEffect, useState } from 'react';
import Button from '@watsonserve/ui/button';
import { useStore } from '@/store';
import classes from './index.module.styl';

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
const currencies = ['USD', 'HKD', 'SGD', 'CNY'];

export default function Settings() {
  const { state, updateSettings } = useStore();
  const [currency, setCurrency] = useState('USD');
  const [month, setMonth] = useState(1);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const { settings } = state;
    if (!settings) return;
    setCurrency(settings.defaultCurrency);
    setMonth(settings.fiscalYearStartMonth);
  }, [state.settings]);

  const handleSave = async () => {
    await updateSettings({
      defaultCurrency: currency,
      fiscalYearStartMonth: month
    });
    setMsg('Saved');
  };

  return (
    <div className={`app ${classes.settings}`}>
      <h5 className={classes.title}>Settings</h5>
      <div className={classes.form}>
        <div className={classes.line}>
          <label className={classes.label}>Default currency</label>
          <select className={classes.select} value={currency} onChange={ev => setCurrency(ev.target.value)}>
            {currencies.map(item => <option value={item} key={item}>{item}</option>)}
          </select>
        </div>
        <div className={classes.line}>
          <label className={classes.label}>Fiscal year starts in</label>
          <select className={classes.select} value={month} onChange={ev => setMonth(+ev.target.value)}>
            {months.map((item, idx) => <option value={idx + 1} key={item}>{item}</option>)}
          </select>
        </div>
        <Button type="submit" title="Save" onClick={handleSave} />
      </div>
      {msg && <div className={classes.result}>{msg}</div>}
    </div>
  );
}
