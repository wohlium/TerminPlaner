
import React, { useState, useEffect, useMemo } from 'react';
import { Appointment, Resident, Location } from '../types';
import { useAppContext } from '../context/AppContext';
import Modal from './common/Modal';
import Button from './common/Button';
import Input from './common/Input';
import Select from './common/Select';
import Textarea from './common/Textarea';
import Toggle from './common/Toggle';
import { TRANSPORT_OPTIONS, TO_BRING_OPTIONS } from '../constants';
import { InformationCircleIcon } from './icons/InformationCircleIcon';
import { isHausbusBlocked } from '../utils/hausbus';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentToEdit?: Appointment;
}

const AppointmentModal: React.FC<AppointmentModalProps> = ({ isOpen, onClose, appointmentToEdit }) => {
  const { residents, locations, addAppointment, updateAppointment, hausbusBlocks, appointments } = useAppContext();
  const [formState, setFormState] = useState<Omit<Appointment, 'id' | 'createdBy' | 'createdAt'>>({
    residentId: '',
    locationId: '',
    dateTime: '',
    reason: '',
    toBring: [],
    toBringOther: '',
    escortNeeded: false,
    escortName: '',
    transportType: TRANSPORT_OPTIONS[0],
    transportOrganized: false,
  });
  const [nearbyAppointment, setNearbyAppointment] = useState<Appointment | null>(null);

  const isHausbusBlockedAtSelectedDateTime = useMemo(() => {
    return isHausbusBlocked(formState.dateTime, hausbusBlocks);
  }, [formState.dateTime, hausbusBlocks]);

  useEffect(() => {
    if (appointmentToEdit) {
      setFormState({
        ...appointmentToEdit,
        dateTime: appointmentToEdit.dateTime.substring(0, 16) // Format for datetime-local
      });
    } else {
      // Reset form
      setFormState({
        residentId: '',
        locationId: '',
        dateTime: '',
        reason: '',
        toBring: [],
        toBringOther: '',
        escortNeeded: false,
        escortName: '',
        transportType: TRANSPORT_OPTIONS[0],
        transportOrganized: false,
      });
    }
  }, [appointmentToEdit, isOpen]);

  // Effect to reset transport type if Hausbus is selected and date changes to a blocked day/time
  useEffect(() => {
      if (formState.transportType === 'Hausbus' && isHausbusBlockedAtSelectedDateTime) {
          // Maybe show a notification to the user in a real app
          setFormState(prev => ({...prev, transportType: TRANSPORT_OPTIONS[0]}));
      }
  }, [isHausbusBlockedAtSelectedDateTime, formState.transportType]);

  // Effect to check for nearby appointments to suggest ride sharing
  useEffect(() => {
    if (!formState.dateTime || !formState.locationId) {
        setNearbyAppointment(null);
        return;
    }

    const currentDateTime = new Date(formState.dateTime);
    if (isNaN(currentDateTime.getTime())) {
        setNearbyAppointment(null);
        return;
    }

    const timeWindowMinutes = 90;

    const foundAppointment = appointments.find(apt => {
        if (appointmentToEdit && apt.id === appointmentToEdit.id) {
            return false;
        }

        if (apt.locationId !== formState.locationId) {
            return false;
        }
        
        if (apt.isHausbusBlock) {
            return false;
        }

        const aptDateTime = new Date(apt.dateTime);
        if (isNaN(aptDateTime.getTime())) {
            return false;
        }

        const isSameDay = aptDateTime.getFullYear() === currentDateTime.getFullYear() &&
                          aptDateTime.getMonth() === currentDateTime.getMonth() &&
                          aptDateTime.getDate() === currentDateTime.getDate();
        
        if (!isSameDay) {
            return false;
        }

        const timeDiffMinutes = Math.abs(currentDateTime.getTime() - aptDateTime.getTime()) / (1000 * 60);

        return timeDiffMinutes <= timeWindowMinutes;
    });

    setNearbyAppointment(foundAppointment || null);

  }, [formState.dateTime, formState.locationId, appointments, appointmentToEdit]);

  const nearbyResident = useMemo(() => {
    if (!nearbyAppointment) return null;
    return residents.find(r => r.id === nearbyAppointment.residentId) || null;
  }, [nearbyAppointment, residents]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setFormState(prev => {
        const newToBring = checked ? [...prev.toBring, value] : prev.toBring.filter(item => item !== value);
        return { ...prev, toBring: newToBring };
    });
  };

  const handleToggleChange = (name: 'escortNeeded' | 'transportOrganized') => {
    setFormState(prev => ({...prev, [name]: !prev[name] }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.dateTime) {
      // Should be caught by 'required' but good to have
      return;
    }
    const dataToSubmit = {
        ...formState,
        dateTime: new Date(formState.dateTime).toISOString()
    };
    if (appointmentToEdit) {
      updateAppointment({ ...dataToSubmit, id: appointmentToEdit.id, createdBy: appointmentToEdit.createdBy, createdAt: appointmentToEdit.createdAt });
    } else {
      addAppointment(dataToSubmit);
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={appointmentToEdit ? "Termin bearbeiten" : "Neuer Termin"}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select label="Bewohner" name="residentId" value={formState.residentId} onChange={handleChange} required>
                <option value="" disabled>Bitte auswählen</option>
                {residents.map((r: Resident) => <option key={r.id} value={r.id}>{r.name} {r.station ? `(${r.station})` : ''}</option>)}
            </Select>
            <Select label="Ort / Kontakt" name="locationId" value={formState.locationId} onChange={handleChange} required>
                <option value="" disabled>Bitte auswählen</option>
                {locations.map((l: Location) => <option key={l.id} value={l.id}>{l.name}</option>)}
            </Select>
        </div>
        
        <Input label="Datum & Uhrzeit" type="datetime-local" name="dateTime" value={formState.dateTime} onChange={handleChange} required />
        <Textarea label="Grund" name="reason" value={formState.reason} onChange={handleChange} rows={3} required />
        
        <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Mitzunehmen</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {TO_BRING_OPTIONS.map(option => (
                    <label key={option} className="flex items-center space-x-2">
                        <input type="checkbox" value={option} checked={formState.toBring.includes(option)} onChange={handleCheckboxChange} className="h-4 w-4 rounded border-gray-300 text-brand-blue-600 focus:ring-brand-blue-500"/>
                        <span>{option}</span>
                    </label>
                ))}
            </div>
            <Input type="text" placeholder="Sonstiges..." name="toBringOther" value={formState.toBringOther} onChange={handleChange} className="mt-4" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <Toggle label="Begleitung benötigt" enabled={formState.escortNeeded} setEnabled={() => handleToggleChange('escortNeeded')} />
                {formState.escortNeeded && (
                    <Input label="Name der Begleitung" name="escortName" value={formState.escortName} onChange={handleChange} required/>
                )}
            </div>
            <Select label="Transportart" name="transportType" value={formState.transportType} onChange={handleChange}>
                {TRANSPORT_OPTIONS.map(opt => (
                    <option 
                        key={opt} 
                        value={opt} 
                        disabled={opt === 'Hausbus' && isHausbusBlockedAtSelectedDateTime}
                    >
                        {opt}{opt === 'Hausbus' && isHausbusBlockedAtSelectedDateTime ? ' (gesperrt)' : ''}
                    </option>
                ))}
            </Select>
        </div>
        
        <Toggle label="Transport organisiert" enabled={formState.transportOrganized} setEnabled={() => handleToggleChange('transportOrganized')} />

        {nearbyAppointment && nearbyResident && (
            <div className="mt-4 p-4 rounded-md bg-blue-50">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <InformationCircleIcon className="h-5 w-5 text-blue-400" aria-hidden="true" />
                    </div>
                    <div className="ml-3 flex-1">
                        <p className="text-sm text-blue-800">
                            Mögliche Fahrgemeinschaft: <strong>{nearbyResident.name}</strong> hat um{' '}
                            <strong className="font-semibold">
                                {new Date(nearbyAppointment.dateTime).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} Uhr
                            </strong>
                            {' '}einen Termin am selben Ort.
                        </p>
                    </div>
                </div>
            </div>
        )}

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>Abbrechen</Button>
          <Button type="submit">{appointmentToEdit ? "Änderungen speichern" : "Termin erstellen"}</Button>
        </div>
      </form>
    </Modal>
  );
};

export default AppointmentModal;