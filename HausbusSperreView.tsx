
import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';
import { HausbusBlock } from '../types';
import Button from './common/Button';
import Input from './common/Input';
import Textarea from './common/Textarea';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import Toggle from './common/Toggle';

const toYYYYMMDD = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const HausbusSperreView: React.FC = () => {
    const { hausbusBlocks, addHausbusBlock, updateHausbusBlock, deleteHausbusBlock } = useAppContext();
    const [viewDate, setViewDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    
    // Form state for adding/editing a block
    const [editingBlock, setEditingBlock] = useState<HausbusBlock | null>(null);
    const [comment, setComment] = useState('');
    const [isAllDay, setIsAllDay] = useState(true);
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('17:00');

    useEffect(() => {
        // When selectedDate changes, reset the form
        setEditingBlock(null);
        resetForm();
    }, [selectedDate]);

    useEffect(() => {
        if(editingBlock) {
            setComment(editingBlock.comment);
            setIsAllDay(editingBlock.isAllDay);
            setStartTime(editingBlock.startTime);
            setEndTime(editingBlock.endTime);
        } else {
            resetForm();
        }
    }, [editingBlock]);

    const resetForm = () => {
        setComment('');
        setIsAllDay(true);
        setStartTime('09:00');
        setEndTime('17:00');
        setEditingBlock(null);
    };

    const handleSaveBlock = () => {
        if (!comment.trim()) {
            alert("Bitte geben Sie einen Kommentar ein.");
            return;
        }

        const blockData = {
            date: toYYYYMMDD(selectedDate),
            comment,
            isAllDay,
            startTime: isAllDay ? '' : startTime,
            endTime: isAllDay ? '' : endTime,
        };

        if (editingBlock) {
            updateHausbusBlock({ ...editingBlock, ...blockData });
        } else {
            addHausbusBlock(blockData);
        }
        resetForm();
    };
    
    const handleDeleteBlock = (blockId: string) => {
        if(window.confirm("Sind Sie sicher, dass Sie diese Sperre löschen möchten?")) {
            deleteHausbusBlock(blockId);
        }
    }

    const handlePrevMonth = () => setViewDate(current => new Date(current.getFullYear(), current.getMonth() - 1, 1));
    const handleNextMonth = () => setViewDate(current => new Date(current.getFullYear(), current.getMonth() + 1, 1));
    
    const calendarGrid = useMemo(() => {
        const month = viewDate.getMonth();
        const year = viewDate.getFullYear();
        const firstDayOfMonth = new Date(year, month, 1);
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const startDayIndex = firstDayOfMonth.getDay() === 0 ? 6 : firstDayOfMonth.getDay() - 1;

        const days = Array.from({ length: startDayIndex }, (_, i) => <div key={`empty-${i}`} className="border-r border-b border-slate-100"></div>);

        for (let day = 1; day <= daysInMonth; day++) {
            const currentDate = new Date(year, month, day);
            const dateString = toYYYYMMDD(currentDate);
            const isBlocked = hausbusBlocks.some(b => b.date === dateString);
            const isToday = toYYYYMMDD(new Date()) === dateString;
            const isSelected = toYYYYMMDD(selectedDate) === dateString;
            
            let dayClasses = "relative p-2 h-20 flex justify-start items-start cursor-pointer transition-colors duration-150 border-r border-b border-slate-100";
            if (isSelected) {
                dayClasses += " bg-brand-blue-100 ring-2 ring-brand-blue-500 z-10";
            } else if (isToday) {
                dayClasses += " bg-blue-50";
            } else {
                dayClasses += " bg-white hover:bg-slate-50";
            }

            days.push(
                <div key={day} className={dayClasses} onClick={() => setSelectedDate(currentDate)}>
                    <time dateTime={dateString} className={`font-semibold ${isSelected ? 'text-brand-blue-700' : isToday ? 'text-blue-600' : 'text-slate-700'}`}>
                        {day}
                    </time>
                    {isBlocked && <span className="absolute bottom-2 right-2 h-2 w-2 bg-red-500 rounded-full"></span>}
                </div>
            );
        }
        return days;
    }, [viewDate, hausbusBlocks, selectedDate]);

    const blocksForSelectedDay = useMemo(() => {
        const dateStr = toYYYYMMDD(selectedDate);
        return hausbusBlocks.filter(b => b.date === dateStr).sort((a,b) => a.startTime.localeCompare(b.startTime));
    }, [selectedDate, hausbusBlocks]);

    return (
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
             <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-slate-800 text-center">
                    {viewDate.toLocaleString('de-DE', { month: 'long', year: 'numeric' })}
                </h3>
                 <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={handlePrevMonth}>
                        <ChevronLeftIcon className="w-5 h-5" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => { setViewDate(new Date()); setSelectedDate(new Date());}}>
                        Heute
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleNextMonth}>
                        <ChevronRightIcon className="w-5 h-5" />
                    </Button>
                 </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Calendar */}
                <div className="md:w-1/2 lg:w-3/5">
                    <div className="grid grid-cols-7 border-t border-l border-slate-200 bg-slate-50 text-center text-xs sm:text-sm font-semibold text-slate-600">
                        {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(day => <div key={day} className="py-2 border-r border-b border-slate-200">{day}</div>)}
                    </div>
                    <div className="grid grid-cols-7 border-l border-slate-100">
                        {calendarGrid}
                    </div>
                </div>

                {/* Details for selected day */}
                <div className="md:w-1/2 lg:w-2/5">
                    <h4 className="font-bold text-lg text-slate-800 mb-2">
                        Sperren für {selectedDate.toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: '2-digit' })}
                    </h4>
                    
                    {/* List of existing blocks */}
                    <div className="space-y-2 mb-6">
                        {blocksForSelectedDay.length > 0 ? blocksForSelectedDay.map(block => (
                            <div key={block.id} className={`p-3 rounded-lg flex justify-between items-center ${editingBlock?.id === block.id ? 'bg-blue-100 border border-blue-300' : 'bg-slate-50'}`}>
                                <div>
                                    <p className="font-semibold text-slate-800">{block.comment}</p>
                                    <p className="text-sm text-slate-500">{block.isAllDay ? 'Ganztägig' : `${block.startTime} - ${block.endTime}`}</p>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <Button size="sm" variant="ghost" onClick={() => setEditingBlock(block)}>Bearbeiten</Button>
                                    <Button size="sm" variant="ghost" onClick={() => handleDeleteBlock(block.id)}>
                                        <TrashIcon className="h-4 w-4 text-red-500"/>
                                    </Button>
                                </div>
                            </div>
                        )) : <p className="text-slate-500 text-sm">Keine Sperren für diesen Tag.</p>}
                    </div>

                    {/* Add/Edit Form */}
                    <div className="bg-slate-100 p-4 rounded-lg">
                        <h5 className="font-bold text-md mb-3">{editingBlock ? 'Sperre bearbeiten' : 'Neue Sperre hinzufügen'}</h5>
                        <div className="space-y-4">
                             <Textarea label="Kommentar / Grund" value={comment} onChange={e => setComment(e.target.value)} rows={2} required />
                             <Toggle label="Ganztägig" enabled={isAllDay} setEnabled={setIsAllDay} />
                            {!isAllDay && (
                                <div className="flex items-center gap-4">
                                    <Input label="Von" type="time" value={startTime} onChange={e => setStartTime(e.target.value)} />
                                    <Input label="Bis" type="time" value={endTime} onChange={e => setEndTime(e.target.value)} />
                                </div>
                            )}
                            <div className="flex items-center justify-end gap-2 pt-2">
                                {editingBlock && <Button variant="secondary" onClick={resetForm}>Abbrechen</Button>}
                                <Button onClick={handleSaveBlock}>
                                    <PlusIcon className="h-4 w-4 mr-1"/>
                                    {editingBlock ? 'Änderung speichern' : 'Sperre speichern'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HausbusSperreView;
