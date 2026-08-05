# API 呼叫文件

來源：`src/api`

---

## 1. 取得持倉資料

### `GET /api/handles`

#### 請求參數：`void`

#### 回傳型別

| 欄位 | 型別 | 說明 |
| --- | --- | --- |
| `stocks` | `HandleStock[]` | 持倉清單；每筆資料會依匯率包成 `HandleStock`。 |
| `fxs` | `Record<string, number>` | 幣別匯率對照表。 |
| `totalUSDAsset` | `number` | 以美元計算的總資產。 |
| `totalUSDCost` | `number` | 以美元計算的總成本。 |

**Type `HandleStock`**

| 欄位 | 型別 | 說明 |
| --- | --- | --- |
| `nc` | `string` | 標的代號。 |
| `currency` | `string` | 持倉幣別。 |
| `price` | `number` | 目前價格。 |
| `count` | `number` | 持有數量。 |
| `cost` | `number` | 持倉成本。 |
| `recognizedGain` | `number` | 已認列損益。 |
| `openingMarketValue` | `number` | 期初市值。 |
| `dividend` | `Dividend[]` | 配息明細。 |

#### Type `Dividend`

| 欄位 | 型別 | 說明 |
| --- | --- | --- |
| `ex` | `number` | 除權／除息日時間戳（秒）。 |
| `paid` | `number` | 發放／入帳時間戳（秒）。 |
| `currency` | `string` | 配息幣別。 |
| `amount` | `number` | 每單位配息金額。 |

#### Request 範例

```http
GET /api/handles HTTP/1.1
Host: example.com
```

#### Response 範例

```json
{
  "status": 200,
  "msg": "",
  "data": {
    "stocks": [
      {
        "nc": "AAPL",
        "currency": "USD",
        "price": 190.12,
        "count": 10,
        "cost": 1800,
        "recognizedGain": 0,
        "openingMarketValue": 1750,
        "dividend": [
          {
            "ex": 0,
            "paid": 0,
            "currency": "USD",
            "amount": 0
          }
        ]
      }
    ],
    "fxs": {
      "USD": 1,
      "HKD": 7.8,
      "SGD": 1.35
    }
  }
}
```

---

## 2. 交易紀錄

### 2.1 型別定義

#### Type `ITade`

| 欄位 | 型別 | 必填 | 說明 |
| --- | --- | --- | --- |
| `nc` | `string` | 是 | 標的代號，例如 `AAPL`。 |
| `cost` | `number` | 是 | 交易總成本。 |
| `count` | `number` | 是 | 交易股數或單位數。 |
| `currency` | `'USD' \| 'SGD' \| 'HKD'` | 是 | 幣別。 |
| `ttype` | `EnTType` | 是 | 交易類型代碼。 |
| `ttime` | `number` | 是 | 交易時間戳（秒）。 |

#### Enum `EnTType`

| 值 | 名稱 | 說明 |
| --- | --- | --- |
| `1` | `BUY` | 買入。 |
| `2` | `SELL` | 賣出。 |
| `4` | `XD` | 除息。 |
| `8` | `XR` | 除權。 |
| `-1` | `BALANCE` | 平衡調整。 |

### 2.2 查詢 - `GET /api/record`

#### 請求參數

| 欄位 | 型別 | 必填 | 說明 |
| --- | --- | --- | --- |
| `start` | `number` | 是 | 查詢區間起始時間戳（秒）。 |
| `end` | `number` | 是 | 查詢區間結束時間戳（秒）。 |

#### 回傳型別

| 欄位 | 型別 | 說明 |
| --- | --- | --- |
| 項目清單 | `ITade[]` | 交易紀錄陣列；每筆為一筆完整交易資料。 |

#### Request 範例

```http
GET /api/record?start=1722470400&end=1725062400 HTTP/1.1
Host: example.com
```

#### Response 範例

```json
{
  "status": 200,
  "msg": "",
  "data": [
    {
      "nc": "AAPL",
      "cost": 1800,
      "count": 10,
      "currency": "USD",
      "ttype": 1,
      "ttime": 1722855600
    }
  ]
}
```

---

### 2.3 送出 - `PUT /api/record`

#### 請求資料：`ITade`

#### 回傳型別：`void`

#### Request 範例

```http
PUT /api/record HTTP/1.1
Host: example.com
Content-Type: application/x-www-form-urlencoded; charset=utf-8
Cookie: ...

nc=AAPL&cost=1800&count=10&currency=USD&ttype=1&ttime=1722855600
```

#### Response 範例

```json
{
  "status": 200,
  "msg": "",
  "data": null
}
```

---

## 3. 取得區間報酬資料

#### `GET /api/capital`

#### 請求參數

| 欄位 | 型別 | 必填 | 說明 |
| --- | --- | --- | --- |
| `start` | `number` | 是 | 查詢區間起始時間戳（秒）。 |
| `end` | `number` | 是 | 查詢區間結束時間戳（秒）。 |

#### 回傳型別

| 欄位 | 型別 | 說明 |
| --- | --- | --- |
| `twr` | `IGap[]` | 時間加權報酬資料。 |
| `mwr` | `INetCash[]` | 資金加權報酬資料。 |
| `dividend` | `IDividend[]` | 股利資料。 |
| `realised` | `IDividend[]` | 已實現損益資料。 |

#### Type `IGap`

| 欄位 | 型別 | 說明 |
| --- | --- | --- |
| `date` | `number` | 資料日期時間戳（秒）。 |
| `fxs` | `Record<string, number>` | 該日期匯率表。 |
| `gap` | `{ prev_close: number; next_open: number }` | 前收與次日開盤的缺口資訊。 |

#### Type `INetCash`

| 欄位 | 型別 | 說明 |
| --- | --- | --- |
| `t` | `number` | 資料時間戳（秒）。 |
| `fxs` | `Record<string, number>` | 該時間點匯率表。 |
| `net_cash` | `number` | 淨現金流。 |

#### Type `IDividend`

| 欄位 | 型別 | 說明 |
| --- | --- | --- |
| `date` | `number` | 配息資料日期時間戳（秒）。 |
| `fxs` | `Record<string, number>` | 該日期匯率表。 |
| `amount` | `number` | 配息金額。 |

#### Request 範例

```http
GET /api/capital?start=1722470400&end=1725062400 HTTP/1.1
Host: example.com
```

#### Response 範例

```json
{
  "data": {
    "twr": [
      {
        "date": 1722470400,
        "fxs": {
          "USD": 1
        },
        "gap": {
          "prev_close": 100,
          "next_open": 101
        }
      }
    ],
    "mwr": [
      {
        "t": 1722470400,
        "fxs": {
          "USD": 1
        },
        "net_cash": 500
      }
    ],
    "dividend": [
      {
        "date": 1722470400,
        "fxs": {
          "USD": 1
        },
        "amount": 100
      }
    ],
    "realised": [
      {
        "date": 1722470400,
        "fxs": {
          "USD": 1
        },
        "amount": 100
      }
    ]
  }
}
```

---

## 4. 取得行事曆資料

### `GET /api/calendar`

#### 請求參數：`void`

#### 回傳型別

| 欄位 | 型別 | 說明 |
| --- | --- | --- |
| 項目清單 | `ICalendar[]` | 行事曆事件陣列；每筆為一筆完整日曆事件。 |

#### Type `ICalendar`

| 欄位 | 型別 | 說明 |
| --- | --- | --- |
| `market` | `string` | 市場代碼。 |
| `title` | `string` | 事件標題。 |
| `start` | `number` | 起始時間戳（秒）。 |
| `end` | `number` | 結束時間戳（秒）。 |

#### Request 範例

```http
GET /api/calendar HTTP/1.1
Host: example.com
```

#### Response 範例

```json
{
  "status": 200,
  "msg": "",
  "data": [
    {
      "market": "US",
      "title": "Independence Day",
      "start": 1720051200,
      "end": 1720137600
    }
  ]
}
```

#### 資料處理

- 依 `market` 分組
- 若週末假期相鄰，會合併標題與區間
- 最後依 `start` 由新到舊排序

---
