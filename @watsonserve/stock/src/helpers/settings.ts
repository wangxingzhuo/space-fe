import { ISettings } from '@/entities';

const KEY = 'stock-settings';
const supportedFiscalYearDates = ['01-01', '04-01', '04-05', '07-01'];
const defaultSettings: ISettings = {
  fiscalYearStartDate: '01-01',
  defaultCurrency: 'USD'
};
const supportedCurrencies = ['USD', 'HKD', 'SGD', 'CNY'];

function normalizeFiscalYearStartDate(value: unknown) {
  const date = String(value);
  if (supportedFiscalYearDates.includes(date)) return date;
  if (value === 1) return '01-01';
  if (value === 4) return '04-01';
  if (value === 7) return '07-01';
  return defaultSettings.fiscalYearStartDate;
}

function normalizeCurrency(currency: unknown) {
  return supportedCurrencies.includes(String(currency)) ? String(currency) : defaultSettings.defaultCurrency;
}

export function loadSettings(): ISettings {
  if (typeof window === 'undefined') return defaultSettings;
  const raw = localStorage.getItem(KEY);
  if (!raw) return defaultSettings;

  try {
    const parsed = JSON.parse(raw);
    return {
      fiscalYearStartDate: normalizeFiscalYearStartDate(parsed?.fiscalYearStartDate ?? parsed?.fiscalYearStartMonth),
      defaultCurrency: normalizeCurrency(parsed?.defaultCurrency)
    };
  } catch (err) {
    return defaultSettings;
  }
}

export function saveSettings(settings: ISettings) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify({
    fiscalYearStartDate: normalizeFiscalYearStartDate(settings.fiscalYearStartDate),
    defaultCurrency: normalizeCurrency(settings.defaultCurrency)
  }));
}
