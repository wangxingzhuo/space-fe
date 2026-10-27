import './index.css';

export type LineChartPoint = { x: number; y: number };

export type LineChartProps = {
  data: LineChartPoint[];
  width?: number;
  height?: number;
  label?: string;
  color?: string;
};

export default function LineChart({
  data,
  width = 640,
  height = 320,
  label = 'Line chart',
  color = '#56b4a9',
}: LineChartProps) {
  const points = data.filter(({ x, y }) => Number.isFinite(x) && Number.isFinite(y));
  if (points.length === 0 || width <= 0 || height <= 0) {
    return <div className="ws-ui-line-chart-empty" role="img" aria-label={`${label}: no data`} />;
  }

  const padding = 16;
  let minX = points[0].x;
  let maxX = points[0].x;
  let minY = points[0].y;
  let maxY = points[0].y;
  for (const { x, y } of points) {
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  }
  const xSpan = maxX - minX || 1;
  const ySpan = maxY - minY || 1;
  const plotWidth = Math.max(0, width - padding * 2);
  const plotHeight = Math.max(0, height - padding * 2);
  const path = points.map(({ x, y }, index) => {
    const px = padding + ((x - minX) / xSpan) * plotWidth;
    const py = height - padding - ((y - minY) / ySpan) * plotHeight;
    return `${index === 0 ? 'M' : 'L'}${px},${py}`;
  }).join(' ');

  return (
    <svg className="ws-ui-line-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label}>
      <title>{label}</title>
      <path d={path} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
