import React, { useState, useEffect } from 'react';
import { Role } from '../types';
import Modal from './common/Modal';
import Input from './common/Input';
import Button from './common/Button';

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  roleToVerify: Role;
  onVerify: (password: string) => boolean;
}

const PasswordModal: React.FC<PasswordModalProps> = ({ isOpen, onClose, roleToVerify, onVerify }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Reset state when modal is reopened
    if (isOpen) {
      setPassword('');
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onVerify(password)) {
      onClose();
    } else {
      setError('Falsches Passwort. Bitte versuchen Sie es erneut.');
      setPassword('');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Passwort für ${roleToVerify}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <p>Bitte geben Sie das Passwort für die ausgewählte Rolle ein.</p>
        <Input
          type="password"
          label="Passwort"
          name="password-prompt"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
          required
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>Abbrechen</Button>
          <Button type="submit">Bestätigen</Button>
        </div>
      </form>
    </Modal>
  );
};

export default PasswordModal;
