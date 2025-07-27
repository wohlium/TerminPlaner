import React, { useState, useEffect } from 'react';
import { User, Role } from '../types';
import { useAppContext } from '../context/AppContext';
import Modal from './common/Modal';
import Button from './common/Button';
import Input from './common/Input';
import Select from './common/Select';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose }) => {
  const { addUser } = useAppContext();
  const [name, setName] = useState('');
  const [role, setRole] = useState<Role>(Role.MITARBEITER);

  useEffect(() => {
    if (isOpen) {
      setName('');
      setRole(Role.MITARBEITER);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addUser({ name, role });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Neuer Mitarbeiter">
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input 
            label="Name des Mitarbeiters" 
            name="name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required 
            autoFocus
        />
        <Select 
            label="Rolle" 
            name="role" 
            value={role} 
            onChange={(e) => setRole(e.target.value as Role)}
        >
            {Object.values(Role).map(r => (
                <option key={r} value={r}>{r}</option>
            ))}
        </Select>
        
        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>Abbrechen</Button>
          <Button type="submit">Mitarbeiter erstellen</Button>
        </div>
      </form>
    </Modal>
  );
};

export default UserModal;