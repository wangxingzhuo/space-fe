import { useEffect, useState } from 'react';
import Button from '@watsonserve/ui/button';
import { useStore } from '@/store';
import classes from './index.module.styl';

const currencies = ['USD', 'HKD', 'SGD', 'CNY'];
const fiscalYearOptions = [
  { value: '01-01', label: '1月1日' },
  { value: '04-01', label: '4月1日' },
  { value: '04-05', label: '4月5日' },
  { value: '07-01', label: '7月1日' }
];

export default function Settings() {
  const { state, updateSettings } = useStore();
  const [currency, setCurrency] = useState('USD');
  const [fiscalYearStartDate, setFiscalYearStartDate] = useState('01-01');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const { settings } = state;
    if (!settings) return;
    setCurrency(settings.defaultCurrency);
    setFiscalYearStartDate(settings.fiscalYearStartDate);
  }, [state.settings]);

  const handleSave = async () => {
    await updateSettings({
      defaultCurrency: currency,
      fiscalYearStartDate
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
          <select className={classes.select} value={fiscalYearStartDate} onChange={ev => setFiscalYearStartDate(ev.target.value)}>
            {fiscalYearOptions.map(item => <option value={item.value} key={item.value}>{item.label}</option>)}
          </select>
        </div>
        <Button type="submit" title="Save" onClick={handleSave} />
      </div>
      {msg && <div className={classes.result}>{msg}</div>}
    </div>
  );
}
