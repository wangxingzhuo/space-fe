import './index.css';

export type DateTimePickerProps = {
  label: string;
  name?: string;
  value: string;
  required?: boolean;
  inModal?: boolean;
  onChange: (value: string) => void;
};

export default function DateTimePicker({
  label,
  name,
  value,
  required = false,
  inModal = false,
  onChange,
}: DateTimePickerProps) {
  const date = value.slice(0, 10);
  const time = value.slice(11, 16) || '00:00';
  const updateValue = (nextDate: string, nextTime: string) =>
    onChange(!nextDate ? '' : `${nextDate}T${nextTime || '00:00'}:00Z`);

  return (
    <fieldset className={`ws-ui-date-time-picker${inModal ? ' ws-ui-date-time-picker--modal' : ''}`}>
      <legend>{label}</legend>
      <div className="ws-ui-date-time-picker__inputs">
        <label>
          Date (UTC)
          <input
            type="date"
            value={date}
            required={required}
            onChange={(event) => updateValue(event.target.value, time)}
          />
        </label>
        <label>
          Time (UTC)
          <input
            type="time"
            value={time}
            disabled={!date}
            onChange={(event) => updateValue(date, event.target.value)}
          />
        </label>
      </div>
      {name && <input type="hidden" name={name} value={value} />}
    </fieldset>
  );
}
