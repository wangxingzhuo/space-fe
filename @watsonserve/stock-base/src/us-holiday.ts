import { A_DAY_S } from "./close-time.js";

// ==================== 工具函数 ====================
function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}${m}${day}`;
}

// 获取第N个周X
function getNthWeekday(y: number, m: number, n: number, weekday: number): Date {
  const first = new Date(y, m - 1, 1);
  const diff = (weekday - first.getDay() + 7) % 7;
  const d = new Date(first);
  d.setDate(1 + diff + (n - 1) * 7);
  return d;
}

// 获取最后一个周X
function getLastWeekday(y: number, m: number, weekday: number): Date {
  const last = new Date(y, m, 0);
  const diff = (last.getDay() - weekday + 7) % 7;
  const d = new Date(last);
  d.setDate(last.getDate() - diff);
  return d;
}

function getGoodFriday(y: number): Date {
  const a = y % 19;
  const b = Math.floor(y / 100);
  const c = y % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  const easter = new Date(y, month - 1, day);
  const goodFriday = new Date(easter);
  goodFriday.setDate(easter.getDate() - 2);
  return goodFriday;
}

function createEvent(
    uid: string,
    dateStr: string,
    summary: string,
    description: string
  ): string {
    return `BEGIN:VEVENT
UID:${uid}-${dateStr}@usstockmarket
DTSTART;VALUE=DATE:${dateStr}
DTEND;VALUE=DATE:${dateStr}
SUMMARY:${summary}
DESCRIPTION:${description}
STATUS:CONFIRMED
END:VEVENT
`;
}

function toUTCs(d: Date) {
  return ~~(Date.UTC(d.getFullYear(), d.getMonth() - 1, d.getDate()) / 1000);
}

/**
 * 生成美股休市 & 提前收盘日历（ICS格式）
 * @param year 年份 如 2025
 * @returns ics 文本，可直接保存为 .ics 文件
 */
export function generateUSHolidays(year: number) {
  const events: any[] = [];

  // 1. 元旦（周六不补，周日补周一）
  const newYear = new Date(year, 0, 1);
  if (6 !== newYear.getDay()) {
    const start = ~~(Date.UTC(year, 0, newYear.getDay() === 0 ? 2 : 1) / 1000);
    events.push({ title: 'New Year\'s Day', start, end: start + A_DAY_S });
  }

  // 2. 马丁路德金纪念日（1月第3个周一）
  const mlkDay = toUTCs(getNthWeekday(year, 1, 3, 1));
  events.push({ title: 'Martin Luther King Jr. Day', start: mlkDay, end: mlkDay + A_DAY_S });

  // 3. 总统日（2月第3个周一）
  const presidentsDay = toUTCs(getNthWeekday(year, 2, 3, 1));
  events.push({ title: 'Presidents\' Day', start: presidentsDay, end: presidentsDay + A_DAY_S });

  // 4. 耶稣受难日（复活节前周五，固定算法）
  const goodFriday = toUTCs(getGoodFriday(year));
  events.push({ title: 'Good Friday', start: goodFriday, end: goodFriday + A_DAY_S });

  // 5. 阵亡将士纪念日（5月最后一个周一）
  const memorialDay = toUTCs(getLastWeekday(year, 5, 1));
  events.push({ title: 'Memorial Friday', start: memorialDay, end: memorialDay + A_DAY_S });

  // 6. 六月节（6.19，周六不补，周日补周一）
  const juneteenth = new Date(year, 5, 19);
  if (6 !== juneteenth.getDay()) {
    const jtDate = ~~(Date.UTC(year, 5, juneteenth.getDay() === 0 ? 20 : 19) / 1000);
    events.push({ title: 'Juneteenth National Independence Day', start: jtDate, end: jtDate + A_DAY_S });
  }

  // 7. 独立日（7.4，周六补周五，周日补周一）
  const independenceDay = new Date(year, 6, 4);
  let indDate = Date.UTC(year, 6, 4);
  if (independenceDay.getDay() === 6) indDate = Date.UTC(year, 6, 3);
  if (independenceDay.getDay() === 0) indDate = Date.UTC(year, 6, 5);
  indDate = ~~(indDate / 1000);
  events.push({ title: 'Independence Day', start: indDate, end: indDate + A_DAY_S });

  // 8. 劳动节（9月第一个周一）
  const laborDay = toUTCs(getNthWeekday(year, 9, 1, 1));
  events.push({ title: 'Labor Day', start: laborDay, end: laborDay + A_DAY_S });

  // 9. 感恩节（11月第4个周四）
  const thanksgiving = toUTCs(getNthWeekday(year, 11, 4, 4));
  events.push({ title: 'Thanksgiving Day And Black Friday', start: thanksgiving, end: thanksgiving + (A_DAY_S << 1) });

  // 10. 圣诞节（12.25，周六补周五，周日补周一）
  const christmasDay = new Date(year, 11, 25);
  let xmasDate = Date.UTC(year, 11, 25);
  let title = 'Christmas Day';
  let during = 0;
  switch (christmasDay.getDay()) {
    case 0:
      xmasDate = Date.UTC(year, 11, 26);
    case 1:
      break;
    default:
      title = 'Christmas Eve & Christmas Day';
      xmasDate = Date.UTC(year, 11, 24);
      during = 1;
  }
  events.push({ title, start: xmasDate, end: xmasDate + (A_DAY_S << during) });

  return events;
}
