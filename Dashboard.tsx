
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Appointment, AppointmentViewMode, Station } from '../types';
import AppointmentCard from './AppointmentCard';
import Button from './common/Button';
import Input from './common/Input';
import Calendar from './common/Calendar';
import { PrinterIcon } from './icons/PrinterIcon';
import { Squares2x2Icon } from './icons/Squares2x2Icon';
import { Bars3Icon } from './icons/Bars3Icon';
import AppointmentSimpleTable from './AppointmentSimpleTable';
import { CalendarDaysIcon } from './icons/CalendarDaysIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import { STATIONS } from '../constants';

type FilterType = 'today' | 'week' | 'month' | 'all' | 'date';

const formatDateHeader = (date: Date): string => {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    today.setHours(0, 0, 0, 0);
    tomorrow.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);

    const dateString = date.toLocaleDateString('de-DE', { day: 'numeric', month: 'long' });

    if (checkDate.getTime() === today.getTime()) {
        return `Heute, ${dateString}`;
    }
    if (checkDate.getTime() === tomorrow.getTime()) {
        return `Morgen, ${dateString}`;
    }
    return date.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
};


const Dashboard: React.FC = () => {
    const { appointments, residents, locations, hausbusBlocks } = useAppContext();
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState<FilterType>('week');
    const [stationFilter, setStationFilter] = useState<Station | null>(null);
    const [viewMode, setViewMode] = useState<AppointmentViewMode>(AppointmentViewMode.DETAILED);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [showOpenTransportOnly, setShowOpenTransportOnly] = useState(false);
    const calendarContainerRef = useRef<HTMLDivElement>(null);

    // Close calendar on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (calendarContainerRef.current && !calendarContainerRef.current.contains(event.target as Node)) {
                setIsCalendarOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);


    const handleFilterClick = (newFilter: FilterType) => {
        setFilter(newFilter);
        setSelectedDate(null); // Clear date when another filter is clicked
        setIsCalendarOpen(false);
    };

    const handleStationFilterClick = (station: Station) => {
        setStationFilter(prev => prev === station ? null : station);
    };

    const handleDateSelect = (date: Date) => {
        setSelectedDate(date);
        setFilter('date');
        setIsCalendarOpen(false);
    };

    const clearDateFilter = (e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedDate(null);
        setFilter('week'); // Revert to default
        setIsCalendarOpen(false);
    };

    const groupedAppointments = useMemo(() => {
        const hausbusPseudoAppointments: Appointment[] = hausbusBlocks.map(block => {
            const dateTime = new Date(`${block.date}T${block.isAllDay ? '00:00:00' : block.startTime + ':00'}`);
           
            return {
                id: `block-${block.id}`,
                residentId: 'HAUSBUS_BLOCK', // Special ID to identify this as a block
                locationId: '',
                dateTime: dateTime.toISOString(),
                reason: block.comment,
                toBring: [],
                toBringOther: '',
                escortNeeded: false,
                escortName: '',
                transportType: 'Hausbus',
                transportOrganized: true,
                createdBy: block.createdBy,
                createdAt: block.createdAt,
                isHausbusBlock: true,
                hausbusBlockDetails: block,
            };
        });

        const combinedList = [...appointments, ...hausbusPseudoAppointments];
        
        const now = new Date();
        const startOfToday = new Date(new Date(now).setHours(0, 0, 0, 0));
        const endOfToday = new Date(new Date(now).setHours(23, 59, 59, 999));
        
        const startOfWeek = new Date(startOfToday);
        // Adjust to Monday of the current week
        const day = startOfWeek.getDay();
        const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
        startOfWeek.setDate(diff);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        endOfMonth.setHours(23, 59, 59, 999);
        
        let filteredAppointments = combinedList;

        switch (filter) {
            case 'today':
                filteredAppointments = combinedList.filter(apt => {
                    const aptDate = new Date(apt.dateTime);
                    return aptDate >= startOfToday && aptDate <= endOfToday;
                });
                break;
            case 'week':
                filteredAppointments = combinedList.filter(apt => {
                    const aptDate = new Date(apt.dateTime);
                    return aptDate >= startOfWeek && aptDate <= endOfWeek;
                });
                break;
            case 'month':
                 filteredAppointments = combinedList.filter(apt => {
                    const aptDate = new Date(apt.dateTime);
                    return aptDate >= startOfMonth && aptDate <= endOfMonth;
                });
                break;
            case 'date':
                if (selectedDate) {
                    const startOfSelected = new Date(new Date(selectedDate).setHours(0, 0, 0, 0));
                    const endOfSelected = new Date(new Date(selectedDate).setHours(23, 59, 59, 999));
                     filteredAppointments = combinedList.filter(apt => {
                        const aptDate = new Date(apt.dateTime);
                        return aptDate >= startOfSelected && aptDate <= endOfSelected;
                    });
                }
                break;
            case 'all':
                // No date filtering needed
                break;
        }

        if (stationFilter) {
            const residentIdsOfStation = residents
                .filter(r => r.station === stationFilter)
                .map(r => r.id);

            filteredAppointments = filteredAppointments.filter(apt => 
                apt.isHausbusBlock || residentIdsOfStation.includes(apt.residentId)
            );
        }
        
        if (showOpenTransportOnly) {
            filteredAppointments = filteredAppointments.filter(apt => 
                !apt.isHausbusBlock && !apt.transportOrganized
            );
        }

        if (searchTerm) {
            const lowercasedTerm = searchTerm.toLowerCase();
            filteredAppointments = filteredAppointments.filter(apt => {
                if(apt.isHausbusBlock) {
                    return apt.reason.toLowerCase().includes(lowercasedTerm);
                }
                const resident = residents.find(r => r.id === apt.residentId);
                const location = locations.find(l => l.id === apt.locationId);
                return (
                    resident?.name.toLowerCase().includes(lowercasedTerm) ||
                    location?.name.toLowerCase().includes(lowercasedTerm) ||
                    apt.reason.toLowerCase().includes(lowercasedTerm)
                );
            });
        }
        
        const sorted = filteredAppointments.sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
        
        const grouped = sorted.reduce((acc, appointment) => {
            const date = new Date(appointment.dateTime);
            date.setHours(0,0,0,0);
            const dateStr = date.toISOString();
            
            if (!acc[dateStr]) {
                acc[dateStr] = [];
            }
            acc[dateStr].push(appointment);
            return acc;
        }, {} as Record<string, Appointment[]>);

        return Object.entries(grouped).map(([dateStr, appointments]) => ({
            date: new Date(dateStr),
            appointments,
        }));

    }, [appointments, residents, hausbusBlocks, filter, stationFilter, searchTerm, selectedDate, showOpenTransportOnly, locations]);

    return (
        <div className="space-y-6">
            <div className="bg-white p-4 rounded-lg shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
                <div className="w-full sm:w-auto sm:flex-grow max-w-4xl">
                    <Input
                        placeholder="Suchen nach Bewohner, Ort, Grund..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                 <div className="flex items-center space-x-2 overflow-x-auto">
                     <Button 
                        variant={showOpenTransportOnly ? 'primary' : 'outline'}
                        onClick={() => setShowOpenTransportOnly(!showOpenTransportOnly)}
                     >
                        Nur offene Transporte
                     </Button>
                </div>
            </div>
            
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 print:hidden">
                <div className="flex items-center flex-wrap gap-2">
                    <Button variant={filter === 'today' ? 'primary' : 'secondary'} onClick={() => handleFilterClick('today')}>Heute</Button>
                    <Button variant={filter === 'week' ? 'primary' : 'secondary'} onClick={() => handleFilterClick('week')}>Diese Woche</Button>
                    <Button variant={filter === 'month' ? 'primary' : 'secondary'} onClick={() => handleFilterClick('month')}>Dieser Monat</Button>
                    <Button variant={filter === 'all' ? 'primary' : 'secondary'} onClick={() => handleFilterClick('all')}>Alle</Button>
                    <div className="relative" ref={calendarContainerRef}>
                        <Button 
                            variant={filter === 'date' ? 'primary' : 'secondary'} 
                            onClick={() => setIsCalendarOpen(prev => !prev)}
                        >
                            <CalendarDaysIcon className="h-5 w-5 mr-2" />
                            {selectedDate ? selectedDate.toLocaleDateString('de-DE') : 'Datum wählen'}
                            {selectedDate && (
                                <span onClick={clearDateFilter} className="ml-2 p-0.5 rounded-full hover:bg-black/10">
                                    <XCircleIcon className="h-4 w-4"/>
                                </span>
                            )}
                        </Button>
                        {isCalendarOpen && (
                            <Calendar
                                selectedDate={selectedDate}
                                onDateSelect={handleDateSelect}
                                onClose={() => setIsCalendarOpen(false)}
                                hausbusBlocks={hausbusBlocks}
                            />
                        )}
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <Button variant="ghost" onClick={() => window.print()}>
                        <PrinterIcon className="h-5 w-5 mr-2" /> Drucken
                    </Button>
                     <div className="bg-slate-200 p-0.5 rounded-lg flex items-center">
                        <Button 
                            size="sm" 
                            variant={viewMode === AppointmentViewMode.DETAILED ? 'primary': 'ghost'}
                            onClick={() => setViewMode(AppointmentViewMode.DETAILED)}
                            className={viewMode === AppointmentViewMode.DETAILED ? 'shadow-sm' : ''}
                        >
                           <Squares2x2Icon className="h-5 w-5" />
                        </Button>
                        <Button 
                            size="sm" 
                            variant={viewMode === AppointmentViewMode.SIMPLE ? 'primary': 'ghost'}
                            onClick={() => setViewMode(AppointmentViewMode.SIMPLE)}
                            className={viewMode === AppointmentViewMode.SIMPLE ? 'shadow-sm' : ''}
                        >
                           <Bars3Icon className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 print:hidden">
                <span className="text-sm font-medium text-slate-600">Stationen:</span>
                {STATIONS.map(station => (
                    <Button
                        key={station}
                        size="sm"
                        variant={stationFilter === station ? 'primary' : 'outline'}
                        onClick={() => handleStationFilterClick(station)}
                    >
                        {station}
                    </Button>
                ))}
                {stationFilter && <Button size="sm" variant="ghost" onClick={() => setStationFilter(null)}>Alle anzeigen</Button>}
            </div>

            {groupedAppointments.length > 0 ? (
                <div className="space-y-8">
                     {groupedAppointments.map(({ date, appointments: dayAppointments }) => (
                        <div key={date.toISOString()}>
                            <h2 className="text-lg font-bold text-slate-700 mb-4 pb-2 border-b-2 border-brand-blue-200">
                                {formatDateHeader(date)}
                            </h2>
                            {viewMode === AppointmentViewMode.DETAILED ? (
                                <div className="space-y-4">
                                    {dayAppointments.map(apt => <AppointmentCard key={apt.id} appointment={apt} />)}
                                </div>
                            ) : (
                                <AppointmentSimpleTable appointments={dayAppointments} />
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 px-6 bg-white rounded-lg shadow-sm">
                    <h3 className="text-xl font-semibold text-slate-700">Keine Termine gefunden</h3>
                    <p className="text-slate-500 mt-2">Für die gewählten Filter gibt es keine Einträge.</p>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
