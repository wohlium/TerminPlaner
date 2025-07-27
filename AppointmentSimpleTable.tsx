import React from 'react';
import { Appointment, Role } from '../types';
import { useAppContext } from '../context/AppContext';
import { LockClosedIcon } from './icons/LockClosedIcon';
import { isHausbusBlocked } from '../utils/hausbus';
import { ExclamationTriangleIcon } from './icons/ExclamationTriangleIcon';
import Tooltip from './common/Tooltip';

interface AppointmentSimpleTableProps {
  appointments: Appointment[];
}

const AppointmentSimpleTable: React.FC<AppointmentSimpleTableProps> = ({ appointments }) => {
  const { residents, locations, users, currentUser, updateAppointment, hausbusBlocks } = useAppContext();

  const handleToggleTransport = (appointment: Appointment, canModify: boolean) => {
    if (!canModify) return;
    updateAppointment({
      ...appointment,
      transportOrganized: !appointment.transportOrganized,
    });
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden print:shadow-none print:border print:border-slate-200">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50 print:bg-white">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Bewohner / Info</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Datum</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Uhrzeit</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Ort / Grund</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Transportart</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Erstellt von</th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Org.?</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {appointments.map((appointment) => {
              if (appointment.isHausbusBlock) {
                const { hausbusBlockDetails } = appointment;
                if (!hausbusBlockDetails) return null;
                const date = new Date(appointment.dateTime);
                const timeString = hausbusBlockDetails.isAllDay
                  ? 'Ganztägig'
                  : `${hausbusBlockDetails.startTime} - ${hausbusBlockDetails.endTime}`;
                const creator = users.find(u => u.id === hausbusBlockDetails.createdBy);
                
                return (
                  <tr key={appointment.id} className="bg-red-50 print:break-inside-avoid">
                    <td colSpan={7} className="px-6 py-4">
                      <div className="flex items-center justify-between gap-4 text-red-700">
                        <div className="flex items-center gap-4">
                          <LockClosedIcon className="h-5 w-5 flex-shrink-0" />
                          <div>
                            <span className="font-bold">Hausbus gesperrt:</span> {hausbusBlockDetails.comment}
                             <div className="text-xs">
                                {date.toLocaleDateString('de-DE')} ({timeString})
                            </div>
                          </div>
                        </div>
                        <div className="text-sm whitespace-nowrap">
                          Erstellt von: {creator?.name || 'Unbekannt'}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              }

              const resident = residents.find(r => r.id === appointment.residentId);
              const location = locations.find(l => l.id === appointment.locationId);
              const date = new Date(appointment.dateTime);
              const residentDisplayName = resident ? `${resident.name} ${resident.station ? `(${resident.station})` : ''}` : 'Unbekannt';
              const creator = users.find(u => u.id === appointment.createdBy);
              
              const canModify = currentUser.role === Role.ADMIN || 
                                currentUser.role === Role.STATIONSLEITUNG || 
                                (currentUser.role === Role.MITARBEITER && currentUser.id === appointment.createdBy);
              
              const isBlocked = appointment.transportType === 'Hausbus' && isHausbusBlocked(appointment.dateTime, hausbusBlocks);


              return (
                <tr key={appointment.id} className="print:break-inside-avoid">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                    {residentDisplayName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {date.toLocaleDateString('de-DE')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} Uhr
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    <Tooltip content={
                      location ? (
                        <div className="text-left">
                          {location.address && <p>{location.address}</p>}
                          {location.phone && <p>Tel: {location.phone}</p>}
                        </div>
                      ) : 'Details nicht verfügbar'
                    }>
                      <span className="cursor-default">{location?.name || 'Unbekannt'}</span>
                    </Tooltip>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                     <div className="flex items-center">
                        <span className={isBlocked ? 'text-orange-600 font-bold' : ''}>{appointment.transportType}</span>
                        {isBlocked && (
                            <span title="Warnung: Der Hausbus ist zu diesem Zeitpunkt gesperrt!">
                                <ExclamationTriangleIcon className="h-5 w-5 ml-1.5 text-orange-500" />
                            </span>
                        )}
                    </div>
                  </td>
                   <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {creator?.name || 'Unbekannt'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    <button
                      onClick={() => handleToggleTransport(appointment, canModify)}
                      disabled={!canModify}
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          appointment.transportOrganized
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        } ${canModify ? 'cursor-pointer hover:opacity-80' : 'cursor-not-allowed'}`}
                       title={canModify ? "Status umschalten" : "Keine Berechtigung"}
                    >
                      {appointment.transportOrganized ? 'Ja' : 'Nein'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AppointmentSimpleTable;