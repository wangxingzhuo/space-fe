import { ISettings } from '@/entities';

const KEY = 'stock-settings';
const defaultSettings: ISettings = {
  fiscalYearStartMonth: 1,
  defaultCurrency: 'USD'
};
const supportedCurrencies = ['USD', 'HKD', 'SGD', 'CNY'];

function normalizeMonth(month: unknown) {
  const value = Number(month);
  if (!Number.isInteger(value) || value < 1 || value > 12) return defaultSettings.fiscalYearStartMonth;
  return value;
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
      fiscalYearStartMonth: normalizeMonth(parsed?.fiscalYearStartMonth),
      defaultCurrency: normalizeCurrency(parsed?.defaultCurrency)
    };
  } catch (err) {
    return defaultSettings;
  }
}

export function saveSettings(settings: ISettings) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify({
    fiscalYearStartMonth: normalizeMonth(settings.fiscalYearStartMonth),
    defaultCurrency: normalizeCurrency(settings.defaultCurrency)
  }));
}
