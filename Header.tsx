import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Role, AppView, User } from '../types';
import Button from './common/Button';
import { PlusIcon } from './icons/PlusIcon';
import AppointmentModal from './AppointmentModal';
import PasswordModal from './PasswordModal';
import { UserIcon } from './icons/UserIcon';

interface HeaderProps {
    setCurrentView: (view: AppView) => void;
}

const Header: React.FC<HeaderProps> = ({ setCurrentView }) => {
    const { currentUser, setCurrentUser, users, isLoading } = useAppContext();
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    
    const [selectedUserId, setSelectedUserId] = useState(currentUser?.id || '');
    const [verificationUser, setVerificationUser] = useState<User | null>(null);

    // Keep local selection in sync with global state
    useEffect(() => {
        if (currentUser) {
            setSelectedUserId(currentUser.id);
        }
    }, [currentUser?.id]);

    if (isLoading || !currentUser) {
        return (
             <header className="bg-white shadow-md print:hidden">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        <h1 className="text-2xl font-bold text-brand-blue-700">Termin-Planer</h1>
                        <div className="animate-pulse">Benutzer wird geladen...</div>
                    </div>
                </div>
            </header>
        )
    }

    const handleRoleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newUserId = event.target.value;
        const selectedUser = users.find(u => u.id === newUserId);
        if (!selectedUser) return;

        setSelectedUserId(newUserId); // Optimistically update dropdown

        const protectedRoles = [Role.ADMIN, Role.STATIONSLEITUNG];
        if (protectedRoles.includes(selectedUser.role)) {
            setVerificationUser(selectedUser);
        } else {
            setCurrentUser(selectedUser);
        }
    };
    
    const handleVerifyPassword = (password: string): boolean => {
        if (!verificationUser) return false;

        let isCorrect = false;
        if (verificationUser.role === Role.ADMIN && password === 'hai33hw') {
            isCorrect = true;
        } else if (verificationUser.role === Role.STATIONSLEITUNG && password === 'hwhai33') {
            isCorrect = true;
        }

        if (isCorrect) {
            setCurrentUser(verificationUser);
            setVerificationUser(null); // Close modal on success
            return true;
        }
        
        return false; // Keep modal open on failure
    };
    
    const handleClosePasswordModal = () => {
        setSelectedUserId(currentUser.id); // Revert dropdown on cancel
        setVerificationUser(null);
    };

    const canAccessMasterData = [Role.ADMIN, Role.STATIONSLEITUNG, Role.MITARBEITER].includes(currentUser.role);

    return (
        <>
            <header className="bg-white shadow-md print:hidden">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        <div className="flex items-center space-x-4">
                            <h1 className="text-2xl font-bold text-brand-blue-700 cursor-pointer" onClick={() => setCurrentView(AppView.DASHBOARD)}>
                                Termin-Planer
                            </h1>
                            <nav className="hidden md:flex items-center space-x-2">
                                <Button variant="ghost" onClick={() => setCurrentView(AppView.DASHBOARD)}>Dashboard</Button>
                                <Button 
                                    variant="ghost" 
                                    onClick={() => setCurrentView(AppView.MASTER_DATA)}
                                    disabled={!canAccessMasterData}
                                    title={!canAccessMasterData ? "Ihre Rolle hat keine Berechtigung für diese Ansicht" : "Stammdaten verwalten"}
                                >
                                    Stammdaten
                                </Button>
                            </nav>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <UserIcon className="h-5 w-5 text-slate-500" />
                                <select 
                                    value={selectedUserId} 
                                    onChange={handleRoleChange} 
                                    className="bg-transparent font-medium text-slate-600 border-none focus:ring-0"
                                    aria-label="Benutzer wechseln"
                                >
                                    {users.map((user: User) => (
                                        <option key={user.id} value={user.id}>{user.name}</option>
                                    ))}
                                </select>
                            </div>
                            <Button onClick={() => setIsModalOpen(true)}>
                                <PlusIcon className="h-5 w-5 mr-2" />
                                Neuer Termin
                            </Button>
                        </div>
                    </div>
                </div>
            </header>
            <AppointmentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
            {verificationUser && (
                 <PasswordModal 
                    isOpen={!!verificationUser}
                    onClose={handleClosePasswordModal}
                    roleToVerify={verificationUser.role}
                    onVerify={handleVerifyPassword}
                />
            )}
        </>
    );
};

export default Header;