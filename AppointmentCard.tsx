import React, { useState } from 'react';
import { Appointment, Role } from '../types';
import { useAppContext } from '../context/AppContext';
import Button from './common/Button';
import { PencilIcon } from './icons/PencilIcon';
import { TrashIcon } from './icons/TrashIcon';
import { CalendarDaysIcon } from './icons/CalendarDaysIcon';
import { ClockIcon } from './icons/ClockIcon';
import { MapPinIcon } from './icons/MapPinIcon';
import { UsersIcon } from './icons/UsersIcon';
import { LockClosedIcon } from './icons/LockClosedIcon';
import AppointmentModal from './AppointmentModal';
import { isHausbusBlocked } from '../utils/hausbus';
import { ExclamationTriangleIcon } from './icons/ExclamationTriangleIcon';
import Tooltip from './common/Tooltip';

interface AppointmentCardProps {
  appointment: Appointment;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointment }) => {
  const { residents, locations, currentUser, deleteAppointment, users, updateAppointment, hausbusBlocks } = useAppContext();
  const [isEditModalOpen, setEditModalOpen] = useState(false);

  if (appointment.isHausbusBlock) {
    const { hausbusBlockDetails } = appointment;
    if (!hausbusBlockDetails) return null;
    const creator = users.find(u => u.id === hausbusBlockDetails.createdBy);

    const date = new Date(appointment.dateTime);
    const timeString = hausbusBlockDetails.isAllDay
      ? 'Ganztägig'
      : `${hausbusBlockDetails.startTime} - ${hausbusBlockDetails.endTime} Uhr`;

    return (
      <div className="bg-red-50 border border-red-200 shadow-md rounded-lg p-5 print:shadow-none">
        <div className="flex flex-col sm:flex-row justify-between">
          <div className="flex-grow">
            <div className="flex items-center mb-3">
              <span className="px-3 py-1 text-sm font-bold rounded-full bg-red-200 text-red-800">
                Hausbus nicht verfügbar
              </span>
            </div>
            <h3 className="text-xl font-bold text-red-800 flex items-center">
              <LockClosedIcon className="h-6 w-6 mr-2" />
              Hausbus gesperrt
            </h3>
            <p className="text-red-700 font-medium mt-1">{hausbusBlockDetails.comment}</p>
            
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm text-red-700">
              <div className="flex items-center space-x-2">
                <CalendarDaysIcon className="h-5 w-5 text-red-400" />
                <span>{date.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
              </div>
              <div className="flex items-center space-x-2">
                <ClockIcon className="h-5 w-5 text-red-400" />
                <span>{timeString}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-red-100 text-xs text-red-600 flex items-center justify-end">
             <span>
                Erstellt von <strong>{creator?.name || 'Unbekannt'}</strong> am {new Date(hausbusBlockDetails.createdAt).toLocaleDateString('de-DE')}
             </span>
        </div>
      </div>
    );
  }

  const resident = residents.find(r => r.id === appointment.residentId);
  const location = locations.find(l => l.id === appointment.locationId);
  const date = new Date(appointment.dateTime);
  const creator = users.find(user => user.id === appointment.createdBy);
  
  const isBlocked = appointment.transportType === 'Hausbus' && isHausbusBlocked(appointment.dateTime, hausbusBlocks);

  const canModify = currentUser.role === Role.ADMIN || 
                    currentUser.role === Role.STATIONSLEITUNG || 
                    (currentUser.role === Role.MITARBEITER && currentUser.id === appointment.createdBy);

  const handleDelete = () => {
    if (window.confirm(`Sind Sie sicher, dass Sie diesen Termin löschen möchten?`)) {
      deleteAppointment(appointment.id);
    }
  };

  const handleToggleTransport = () => {
    if (!canModify) return;
    updateAppointment({
      ...appointment,
      transportOrganized: !appointment.transportOrganized,
    });
  };

  const toBringItems = [...appointment.toBring, appointment.toBringOther].filter(Boolean).join(', ');

  const residentDisplayName = resident ? `${resident.name} ${resident.station ? `(${resident.station})` : ''}` : 'Unbekannter Bewohner';

  return (
    <>
      <div className="bg-white shadow-md rounded-lg p-5 transition-all hover:shadow-lg print:shadow-none print:border print:border-slate-200">
        <div className="flex flex-col sm:flex-row justify-between">
          {/* Main Info */}
          <div className="flex-grow">
            <div className="flex items-center mb-3">
              <button
                onClick={handleToggleTransport}
                disabled={!canModify}
                className={`px-3 py-1 text-sm font-bold rounded-full transition-opacity ${
                    appointment.transportOrganized ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                } ${canModify ? 'hover:opacity-80 cursor-pointer' : 'cursor-not-allowed'}`}
                title={canModify ? "Status umschalten" : "Keine Berechtigung zum Ändern"}
                aria-label={`Status 'Transport organisiert' auf ${appointment.transportOrganized ? 'offen' : 'organisiert'} umschalten`}
              >
                {appointment.transportOrganized ? 'Transport organisiert' : 'Transport offen'}
              </button>
            </div>
            <h3 className="text-xl font-bold text-brand-blue-800">{residentDisplayName}</h3>
            <p className="text-slate-600 font-medium">{appointment.reason}</p>
            
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm text-slate-700">
              <div className="flex items-center space-x-2">
                <CalendarDaysIcon className="h-5 w-5 text-slate-400" />
                <span>{date.toLocaleDateString('de-DE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="flex items-center space-x-2">
                <ClockIcon className="h-5 w-5 text-slate-400" />
                <span>{date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} Uhr</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPinIcon className="h-5 w-5 text-slate-400" />
                  <Tooltip content={
                    location ? (
                      <div className="text-left">
                        {location.address && <p>{location.address}</p>}
                        {location.phone && <p>Tel: {location.phone}</p>}
                      </div>
                    ) : 'Details nicht verfügbar'
                  }>
                    <span className="cursor-default">{location?.name || 'Unbekannter Ort'}</span>
                  </Tooltip>
              </div>
              {appointment.escortNeeded && (
                <div className="flex items-center space-x-2">
                  <UsersIcon className="h-5 w-5 text-slate-400" />
                  <span>Begleitung: {appointment.escortName}</span>
                </div>
              )}
            </div>

            {toBringItems && (
                <div className="mt-3 text-sm">
                    <span className="font-semibold">Mitzunehmen:</span> {toBringItems}
                </div>
            )}
            <div className="mt-3 text-sm flex items-center">
                <span className="font-semibold">Transport:</span>
                <span className={`ml-1 flex items-center ${isBlocked ? 'text-orange-600 font-bold' : ''}`}>
                    {appointment.transportType}
                    {isBlocked && (
                        <span title="Warnung: Der Hausbus ist zu diesem Zeitpunkt gesperrt!">
                            <ExclamationTriangleIcon className="h-5 w-5 inline-block ml-1.5 text-orange-500" />
                        </span>
                    )}
                </span>
            </div>
          </div>
          
          {/* Actions */}
          {canModify && (
            <div className="flex-shrink-0 mt-4 sm:mt-0 sm:ml-6 flex sm:flex-col space-x-2 sm:space-x-0 sm:space-y-2 print:hidden">
              <Button variant="outline" size="sm" onClick={() => setEditModalOpen(true)}>
                <PencilIcon className="h-4 w-4 mr-2" />
                Bearbeiten
              </Button>
              <Button variant="danger" size="sm" onClick={handleDelete}>
                <TrashIcon className="h-4 w-4 mr-2" />
                Löschen
              </Button>
            </div>
          )}
        </div>
        <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-end">
             <span>
                Erstellt von <strong>{creator?.name || 'Unbekannt'}</strong> am {new Date(appointment.createdAt).toLocaleDateString('de-DE')}
             </span>
        </div>
      </div>
      {isEditModalOpen && (
        <AppointmentModal 
          isOpen={isEditModalOpen} 
          onClose={() => setEditModalOpen(false)} 
          appointmentToEdit={appointment} 
        />
      )}
    </>
  );
};

export default AppointmentCard;