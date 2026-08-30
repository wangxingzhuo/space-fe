import { loadFiscalYear, saveFiscalYear, loadFiscalYearOptions } from '@/api';
import { ISettings } from '@/entities';

export const KEY = 'stock-settings';

const supportedCurrencies = ['USD', 'HKD', 'SGD', 'CNY'];

function normalizeCurrency(currency: string) {
  return supportedCurrencies.includes(currency) ? currency : supportedCurrencies[0];
}

export async function loadSettings() {
  const _settings = JSON.parse(localStorage.getItem(KEY) || '{}') as Partial<ISettings>;
  const [options, selected] = await Promise.all([loadFiscalYearOptions(), loadFiscalYear()]);

  return {
    supportedCurrencies: supportedCurrencies.slice(),
    options: options.map(item => ({ name: item.code, title: item.name })),
    fiscalYear: selected,
    currency: normalizeCurrency(_settings.currency ?? '')
  };
}

export async function saveSettings(settings: ISettings) {
  const { fiscalYear, currency } = settings;
  await saveFiscalYear(fiscalYear);
  localStorage.setItem(KEY, JSON.stringify({
    currency: normalizeCurrency(currency)
  }));
}
