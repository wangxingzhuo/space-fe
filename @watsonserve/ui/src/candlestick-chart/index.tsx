import './index.css';

export type Candlestick = {
  x: number;
  open: number;
  high: number;
  low: number;
  close: number;
};

export type CandlestickChartProps = {
  data: Candlestick[];
  width?: number;
  height?: number;
  label?: string;
  upColor?: string;
  downColor?: string;
};

export default function CandlestickChart({
  data,
  width = 640,
  height = 320,
  label = 'Candlestick chart',
  upColor = '#56b4a9',
  downColor = '#dc6b64',
}: CandlestickChartProps) {
  const candles = data.filter(({ x, open, high, low, close }) =>
    [x, open, high, low, close].every(Number.isFinite)
      && high >= Math.max(open, close)
      && low <= Math.min(open, close));

  if (candles.length === 0 || width <= 0 || height <= 0) {
    return <div className="ws-ui-candlestick-chart-empty" role="img" aria-label={`${label}: no data`} />;
  }

  const padding = 16;
  let minX = candles[0].x;
  let maxX = candles[0].x;
  let minY = candles[0].low;
  let maxY = candles[0].high;
  for (const { x, low, high } of candles) {
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, low);
    maxY = Math.max(maxY, high);
  }
  const xSpan = maxX - minX || candles.length;
  const ySpan = maxY - minY || 1;
  const plotWidth = Math.max(0, width - padding * 2);
  const plotHeight = Math.max(0, height - padding * 2);
  const candleWidth = Math.max(1, Math.min(12, plotWidth / candles.length * 0.6));
  const yPosition = (value: number) => height - padding - ((value - minY) / ySpan) * plotHeight;

  return (
    <svg className="ws-ui-candlestick-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label}>
      <title>{label}</title>
      {candles.map(({ x, open, high, low, close }, index) => {
        const px = padding + (maxX === minX
          ? (index + 0.5) * (plotWidth / candles.length)
          : ((x - minX) / xSpan) * plotWidth);
        const color = close >= open ? upColor : downColor;
        const bodyTop = Math.min(yPosition(open), yPosition(close));
        const bodyHeight = Math.max(1, Math.abs(yPosition(open) - yPosition(close)));
        return (
          <g key={`${x}-${index}`} stroke={color} fill={color}>
            <line x1={px} x2={px} y1={yPosition(high)} y2={yPosition(low)} />
            <rect x={px - candleWidth / 2} y={bodyTop} width={candleWidth} height={bodyHeight} fillOpacity={0.8} />
          </g>
        );
      })}
    </svg>
  );
}
