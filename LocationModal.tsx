
import React, { useState, useEffect } from 'react';
import { Location } from '../types';
import { useAppContext } from '../context/AppContext';
import Modal from './common/Modal';
import Button from './common/Button';
import Input from './common/Input';
import Textarea from './common/Textarea';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  locationToEdit?: Location;
}

const LocationModal: React.FC<LocationModalProps> = ({ isOpen, onClose, locationToEdit }) => {
  const { addLocation, updateLocation } = useAppContext();
  const [formState, setFormState] = useState<Omit<Location, 'id'>>({
    name: '',
    specialty: '',
    address: '',
    email: '',
    phone: '',
    fax: '',
    dameNumber: '',
    officeHours: '',
    comment: '',
  });

  const initialFormState = {
    name: '', specialty: '', address: '', email: '', phone: '',
    fax: '', dameNumber: '', officeHours: '', comment: '',
  };

  useEffect(() => {
    if (isOpen) {
      if (locationToEdit) {
        setFormState({
            name: locationToEdit.name || '',
            specialty: locationToEdit.specialty || '',
            address: locationToEdit.address || '',
            email: locationToEdit.email || '',
            phone: locationToEdit.phone || '',
            fax: locationToEdit.fax || '',
            dameNumber: locationToEdit.dameNumber || '',
            officeHours: locationToEdit.officeHours || '',
            comment: locationToEdit.comment || '',
        });
      } else {
        setFormState(initialFormState);
      }
    }
  }, [isOpen, locationToEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (locationToEdit) {
        updateLocation({ ...formState, id: locationToEdit.id });
    } else {
        addLocation(formState);
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={locationToEdit ? "Eintrag bearbeiten" : "Neuer Stammdaten-Eintrag"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Name" name="name" value={formState.name || ''} onChange={handleChange} required />
        <Input label="Fachgebiet" name="specialty" value={formState.specialty || ''} onChange={handleChange} />
        <Input label="Adresse" name="address" value={formState.address || ''} onChange={handleChange} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="E-Mail" type="email" name="email" value={formState.email || ''} onChange={handleChange} />
            <Input label="Telefon" name="phone" value={formState.phone || ''} onChange={handleChange} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Fax" name="fax" value={formState.fax || ''} onChange={handleChange} />
            <Input label="DAME-Nummer" name="dameNumber" value={formState.dameNumber || ''} onChange={handleChange} />
        </div>
        <Textarea 
            label="Ordinationszeiten" 
            name="officeHours" 
            value={formState.officeHours || ''} 
            onChange={handleChange} 
            rows={4}
            placeholder={"Mo: 08:00 - 12:00\nDi: 08:00 - 12:00 & 14:00 - 17:00"}
        />
        <Textarea label="Kommentar" name="comment" value={formState.comment || ''} onChange={handleChange} rows={3} />
        
        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>Abbrechen</Button>
          <Button type="submit">{locationToEdit ? "Änderungen speichern" : "Eintrag erstellen"}</Button>
        </div>
      </form>
    </Modal>
  );
};

export default LocationModal;
