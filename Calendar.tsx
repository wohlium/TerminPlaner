
import React, { useState } from 'react';
import { ChevronLeftIcon } from '../icons/ChevronLeftIcon';
import { ChevronRightIcon } from '../icons/ChevronRightIcon';
import { HausbusBlock } from '../../types';

interface CalendarProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  onClose: () => void;
  hausbusBlocks?: HausbusBlock[];
}

const Calendar: React.FC<CalendarProps> = ({ selectedDate, onDateSelect, hausbusBlocks = [] }) => {
  const [viewDate, setViewDate] = useState(selectedDate || new Date());

  const daysOfWeek = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

  const month = viewDate.getMonth();
  const year = viewDate.getFullYear();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();

  const startDayIndex = firstDayOfMonth.getDay() === 0 ? 6 : firstDayOfMonth.getDay() - 1;

  const handlePrevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };
  
  const handleDateClick = (day: number) => {
    const newDate = new Date(year, month, day);
    onDateSelect(newDate);
  };

  const toYYYYMMDD = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
  
  const blockedDatesSet = new Set(hausbusBlocks.map(b => b.date));

  const calendarDays = [];
  for (let i = 0; i < startDayIndex; i++) {
    calendarDays.push(<div key={`empty-${i}`} className="w-9 h-9"></div>);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const currentDate = new Date(year, month, day);
    const isToday = currentDate.toDateString() === new Date().toDateString();
    const isSelected = selectedDate ? currentDate.toDateString() === selectedDate.toDateString() : false;
    const isBlocked = blockedDatesSet.has(toYYYYMMDD(currentDate));

    let buttonClasses = "w-9 h-9 flex items-center justify-center rounded-full transition-colors duration-150 text-sm";
    let title = "";
    
    if (isBlocked) {
        buttonClasses += " bg-red-50 text-red-400 line-through cursor-not-allowed relative";
        title = "Hausbus an diesem Tag teilweise oder ganz gesperrt";
    }
    
    if (isSelected) {
      buttonClasses += " bg-brand-blue-600 text-white font-semibold hover:bg-brand-blue-700";
    } else if (isToday) {
      buttonClasses += " bg-brand-blue-100 text-brand-blue-700 font-semibold";
    } else if (!isBlocked) {
      buttonClasses += " hover:bg-slate-100";
    }

    calendarDays.push(
      <div key={day} className="flex justify-center items-center">
        <button onClick={() => handleDateClick(day)} className={buttonClasses} title={title}>
          {day}
           {isBlocked && <span className="absolute bottom-1 right-1 h-1.5 w-1.5 bg-red-500 rounded-full"></span>}
        </button>
      </div>
    );
  }

  return (
    <div className="absolute top-full mt-2 z-10 bg-white rounded-lg shadow-lg p-4 border border-slate-200 w-80">
      <div className="flex justify-between items-center mb-4">
        <button onClick={handlePrevMonth} className="p-1 rounded-full hover:bg-slate-100" aria-label="Vorheriger Monat">
          <ChevronLeftIcon className="w-5 h-5 text-slate-600" />
        </button>
        <div className="font-semibold text-slate-800">
          {viewDate.toLocaleString('de-DE', { month: 'long', year: 'numeric' })}
        </div>
        <button onClick={handleNextMonth} className="p-1 rounded-full hover:bg-slate-100" aria-label="Nächster Monat">
          <ChevronRightIcon className="w-5 h-5 text-slate-600" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-y-2 text-center text-xs text-slate-500 font-medium">
        {daysOfWeek.map(day => <div key={day} className="w-9 h-9 flex items-center justify-center">{day}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-y-1 mt-1">
        {calendarDays}
      </div>
    </div>
  );
};

export default Calendar;
