import { createChart, LineSeries } from 'lightweight-charts';
import classes from './style.module.styl';

interface IPoint { time: string; value: number; }

interface ILine {
  title: string;
  color: string;
  line: IPoint[];
};

interface IProps {
  lines: ILine[];
}

export default function Charts(props: IProps) {
  const selfRef = useRef();
  const chartRef = useRef();
  const series = useRef();

  useEffect(() => {
    const chart = createChart(selfRef.current, { width: 400, height: 300 });
    const lineSeries = chart.addSeries(LineSeries);
    lineSeries.setData(props.lines);

    return () => {
      chart
    };
  }, []);

  return (
    <div ref={selfRef} className={classes['contain']}></div>
  );
}
