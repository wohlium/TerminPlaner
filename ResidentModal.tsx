import React, { useState, useEffect } from 'react';
import { Resident, Station } from '../types';
import { useAppContext } from '../context/AppContext';
import Modal from './common/Modal';
import Button from './common/Button';
import Input from './common/Input';
import Select from './common/Select';
import { STATIONS } from '../constants';

interface ResidentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ResidentModal: React.FC<ResidentModalProps> = ({ isOpen, onClose }) => {
  const { addResident } = useAppContext();
  const [name, setName] = useState('');
  const [station, setStation] = useState<Station | ''>('');

  useEffect(() => {
    if (isOpen) {
      setName('');
      setStation('');
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return; 

    addResident({ name, station: station || undefined });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Neuer Bewohner">
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input 
            label="Name des Bewohners" 
            name="name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required 
            autoFocus
        />
        <Select label="Station" name="station" value={station} onChange={(e) => setStation(e.target.value as Station)}>
            <option value="">Keine Angabe</option>
            {STATIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </Select>
        
        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>Abbrechen</Button>
          <Button type="submit">Bewohner erstellen</Button>
        </div>
      </form>
    </Modal>
  );
};

export default ResidentModal;