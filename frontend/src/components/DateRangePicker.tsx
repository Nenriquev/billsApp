import { forwardRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import styled from "styled-components";
import { IconCalendarEvent } from "@tabler/icons-react";

const Wrapper = styled.div`
  width: 100%;
  
  .react-datepicker-wrapper {
    width: 100%;
  }

  .react-datepicker__input-container {
    position: relative;
    width: 100%;
  }

  .custom-input {
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 10px 12px 10px 36px;
    width: 100%;
    font-size: 0.88rem;
    font-family: inherit;
    color: var(--text-primary);
    background: var(--bg-card);
    transition: border-color 0.2s, box-shadow 0.2s;
    cursor: pointer;

    &::placeholder {
      color: var(--text-muted);
    }

    &:focus {
      outline: none;
      border-color: var(--accent);
      box-shadow: 0 0 0 3px var(--accent-light);
    }
  }

  .calendar-icon {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-muted);
    pointer-events: none;
    z-index: 2;
  }

  /* DatePicker Premium Overrides */
  .react-datepicker {
    font-family: inherit;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background-color: var(--bg-card);
    box-shadow: var(--shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1));
    overflow: hidden;
  }

  .react-datepicker__header {
    background-color: var(--bg-primary);
    border-bottom: 1px solid var(--border);
    padding-top: 12px;
  }

  .react-datepicker__current-month {
    color: var(--text-primary);
    font-weight: 600;
    font-size: 1rem;
    padding-bottom: 4px;
  }

  .react-datepicker__day-name {
    color: var(--text-secondary);
    font-weight: 500;
  }

  .react-datepicker__day {
    color: var(--text-primary);
    border-radius: 6px;
    transition: all 0.2s;
    
    &:hover {
      background-color: var(--bg-hover);
    }
  }

  .react-datepicker__day--keyboard-selected {
    background-color: var(--accent-light);
    color: var(--accent);
  }

  .react-datepicker__day--in-selecting-range,
  .react-datepicker__day--in-range {
    background-color: var(--accent-light);
    color: var(--accent);
    border-radius: 0;
  }

  .react-datepicker__day--range-start,
  .react-datepicker__day--range-end,
  .react-datepicker__day--selecting-range-start,
  .react-datepicker__day--selecting-range-end {
    background-color: var(--accent) !important;
    color: white !important;
  }

  .react-datepicker__day--range-start {
    border-top-left-radius: 6px;
    border-bottom-left-radius: 6px;
  }

  .react-datepicker__day--range-end {
    border-top-right-radius: 6px;
    border-bottom-right-radius: 6px;
  }

  .react-datepicker__day--today {
    font-weight: bold;
    color: var(--accent);
  }

  .react-datepicker__navigation-icon::before {
    border-color: var(--text-secondary);
  }

  .react-datepicker__navigation:hover *::before {
    border-color: var(--text-primary);
  }
`;

interface FormattedDateRangePickerProps {
  startDate: Date | null;
  endDate: Date | null;
  onChange: (dates: [Date | null, Date | null]) => void;
  placeholder?: string;
}

const CustomInput = forwardRef<HTMLInputElement, any>(({ value, onClick, placeholder }, ref) => (
  <div style={{ position: "relative", width: "100%" }}>
    <IconCalendarEvent className="calendar-icon" size={18} />
    <input
      className="custom-input"
      onClick={onClick}
      value={value}
      placeholder={placeholder}
      ref={ref}
      readOnly
    />
  </div>
));
CustomInput.displayName = "CustomInput";

const DateRangePicker = ({ startDate, endDate, onChange, placeholder = "Seleccionar fechas..." }: FormattedDateRangePickerProps) => {
  return (
    <Wrapper>
      <DatePicker
        selectsRange={true}
        startDate={startDate}
        endDate={endDate}
        onChange={(update) => {
          onChange(update);
        }}
        isClearable={false}
        customInput={<CustomInput placeholder={placeholder} />}
        dateFormat="dd MMM yyyy"
        monthsShown={2}
      />
    </Wrapper>
  );
};

export default DateRangePicker;
