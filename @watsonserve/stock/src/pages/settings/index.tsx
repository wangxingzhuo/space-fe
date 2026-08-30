import { useEffect, useState } from 'react';
import Button from '@watsonserve/ui/button';
import Selector from '@watsonserve/ui/selector';
import { type INameTitle } from '@watsonserve/ui/types';
import { loadSettings, saveSettings } from '@/helpers/settings';
import classes from './index.module.styl';

export default function Settings() {
  const [msg, setMsg] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [fiscalYearStartDate, setFiscalYearStartDate] = useState('');
  const [fiscalYearOptions, setFiscalYearOptions] = useState<INameTitle<string>[]>([]);
  const [currencies, setCurrencies] = useState<string[]>([]);

  const init = async () => {
    const { supportedCurrencies, options, fiscalYear, currency } = await loadSettings();
    setCurrency(currency);
    setFiscalYearStartDate(fiscalYear);
    setFiscalYearOptions(options);
    setCurrencies(supportedCurrencies);
  };

  useEffect(() => { init() }, []);

  const handleSave = async (ev: React.MouseEvent<HTMLButtonElement>) => {
    ev.preventDefault();
    ev.stopPropagation();

    await saveSettings({ currency, fiscalYear: fiscalYearStartDate });
    setMsg('Saved');
  };

  return (
    <div className={`app ${classes.settings}`}>
      <h5 className={classes.title}>Settings</h5>
      <form className={classes.form}>
        <fieldset className={classes.line}>
          <label className={classes.label}>Default currency</label>
          <Selector
            className={classes.select}
            value={currency}
            options={currencies.map(item => ({ name: item, title: item }))}
            onInput={setCurrency}
          />
        </fieldset>
        <fieldset className={classes.line}>
          <label className={classes.label}>Fiscal year starts in</label>
          <Selector
            className={classes.select}
            value={fiscalYearStartDate}
            options={fiscalYearOptions}
            onInput={setFiscalYearStartDate}
          />
        </fieldset>
        <Button type="primary" title="Save" onClick={handleSave} />
      </form>
      {msg && <div className={classes.result}>{msg}</div>}
    </div>
  );
}
