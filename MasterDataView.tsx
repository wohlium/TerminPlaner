
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Location, Role, MasterDataTab, Resident, User, Station } from '../types';
import Button from './common/Button';
import LocationModal from './LocationModal';
import ResidentModal from './ResidentModal';
import HausbusSperreView from './HausbusSperreView';
import UserModal from './UserModal';
import AuditLogView from './AuditLogView';
import { PlusIcon } from './icons/PlusIcon';
import { PencilIcon } from './icons/PencilIcon';
import { TrashIcon } from './icons/TrashIcon';
import Input from './common/Input';
import Select from './common/Select';
import { STATIONS } from '../constants';

const MasterDataView: React.FC = () => {
    const { 
        locations, deleteLocation, updateLocation,
        residents, deleteResident, updateResident,
        users, deleteUser, updateUser,
        currentUser 
    } = useAppContext();
    
    const isUserAdmin = currentUser.role === Role.ADMIN;
    const isStationsleitung = currentUser.role === Role.STATIONSLEITUNG;
    const isMitarbeiter = currentUser.role === Role.MITARBEITER;

    const canViewLocations = true;
    const canViewResidents = isUserAdmin || isStationsleitung;
    const canViewMitarbeiter = isUserAdmin;
    const canViewHausbus = isUserAdmin || isStationsleitung || isMitarbeiter;
    const canViewAuditLog = isUserAdmin || isStationsleitung;
    
    const [activeTab, setActiveTab] = useState<MasterDataTab>(MasterDataTab.LOCATIONS);

    // State for Modals
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
    const [isResidentModalOpen, setIsResidentModalOpen] = useState(false);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [locationToEdit, setLocationToEdit] = useState<Location | null>(null);
    
    // State for Inline Editing (Residents, Users)
    const [editingRowId, setEditingRowId] = useState<string | null>(null);
    const [editingData, setEditingData] = useState<any | null>(null);

    useEffect(() => {
        if (activeTab === MasterDataTab.RESIDENTS && !canViewResidents) setActiveTab(MasterDataTab.LOCATIONS);
        else if (activeTab === MasterDataTab.MITARBEITER && !canViewMitarbeiter) setActiveTab(MasterDataTab.LOCATIONS);
        else if (activeTab === MasterDataTab.HAUSBUS && !canViewHausbus) setActiveTab(MasterDataTab.LOCATIONS);
        else if (activeTab === MasterDataTab.AUDIT_LOG && !canViewAuditLog) setActiveTab(MasterDataTab.LOCATIONS);
    }, [currentUser, activeTab, canViewResidents, canViewMitarbeiter, canViewHausbus, canViewAuditLog]);

    const handleCancelEdit = () => {
        setEditingRowId(null);
        setEditingData(null);
    };

    const handleEdit = (item: Location | Resident | User) => {
        handleCancelEdit(); // Ensure only one edit is active
        if (activeTab === MasterDataTab.LOCATIONS) {
            setLocationToEdit(item as Location);
            setIsLocationModalOpen(true);
        } else {
            setEditingRowId(item.id);
            setEditingData({ ...item });
        }
    };

    const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setEditingData((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSave = async () => {
        if (!editingData) return;

        switch (activeTab) {
            case MasterDataTab.LOCATIONS:
                // This is now handled by the modal
                break;
            case MasterDataTab.RESIDENTS:
                await updateResident(editingData as Resident);
                break;
            case MasterDataTab.MITARBEITER:
                await updateUser(editingData as User);
                break;
        }
        handleCancelEdit();
    };
    
    const handleAddNew = () => {
        handleCancelEdit(); // Close any inline editing before opening a modal
        if (activeTab === MasterDataTab.LOCATIONS) setIsLocationModalOpen(true);
        else if (activeTab === MasterDataTab.RESIDENTS && canViewResidents) setIsResidentModalOpen(true);
        else if (activeTab === MasterDataTab.MITARBEITER && canViewMitarbeiter) setIsUserModalOpen(true);
    };

    const handleDeleteLocation = async (locationId: string) => {
        if (window.confirm("Sind Sie sicher, dass Sie diesen Eintrag löschen möchten?")) {
            await deleteLocation(locationId);
        }
    };
    
    const handleDeleteResident = async (residentId: string) => {
        if (window.confirm("Sind Sie sicher, dass Sie diesen Bewohner löschen möchten?")) {
            await deleteResident(residentId)
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (window.confirm("Sind Sie sicher, dass Sie diesen Mitarbeiter löschen möchten?")) {
            await deleteUser(userId);
        }
    };
    
    const closeLocationModal = () => {
        setIsLocationModalOpen(false);
        setLocationToEdit(null);
    };

    const tabClasses = (tab: MasterDataTab) => 
        `px-3 py-2 text-sm font-medium rounded-t-md focus:outline-none transition-colors border-b-2 ${
        activeTab === tab 
        ? 'border-brand-blue-600 text-brand-blue-700' 
        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
        }`;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800">Stammdaten</h2>
                {activeTab !== MasterDataTab.HAUSBUS && activeTab !== MasterDataTab.AUDIT_LOG && (
                    <Button onClick={handleAddNew}>
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Neuer Eintrag
                    </Button>
                )}
            </div>
            
            <div className="border-b border-slate-200">
                <nav className="-mb-px flex space-x-4 overflow-x-auto" aria-label="Tabs">
                    {canViewLocations && <button onClick={() => setActiveTab(MasterDataTab.LOCATIONS)} className={tabClasses(MasterDataTab.LOCATIONS)}>{MasterDataTab.LOCATIONS}</button>}
                    {canViewResidents && <button onClick={() => setActiveTab(MasterDataTab.RESIDENTS)} className={tabClasses(MasterDataTab.RESIDENTS)}>{MasterDataTab.RESIDENTS}</button>}
                    {canViewMitarbeiter && <button onClick={() => setActiveTab(MasterDataTab.MITARBEITER)} className={tabClasses(MasterDataTab.MITARBEITER)}>{MasterDataTab.MITARBEITER}</button>}
                    {canViewHausbus && <button onClick={() => setActiveTab(MasterDataTab.HAUSBUS)} className={tabClasses(MasterDataTab.HAUSBUS)}>{MasterDataTab.HAUSBUS}</button>}
                    {canViewAuditLog && <button onClick={() => setActiveTab(MasterDataTab.AUDIT_LOG)} className={tabClasses(MasterDataTab.AUDIT_LOG)}>{MasterDataTab.AUDIT_LOG}</button>}
                </nav>
            </div>

            {activeTab === MasterDataTab.HAUSBUS && canViewHausbus && <HausbusSperreView />}
            {activeTab === MasterDataTab.AUDIT_LOG && canViewAuditLog && <AuditLogView />}

            {activeTab !== MasterDataTab.HAUSBUS && activeTab !== MasterDataTab.AUDIT_LOG && (
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        {activeTab === MasterDataTab.LOCATIONS && canViewLocations && (
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name & Adresse</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Fachgebiet</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Kontakt</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Details</th>
                                        <th scope="col" className="relative px-6 py-3"><span className="sr-only">Aktionen</span></th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-200">
                                    {locations.map((location) => (
                                        <tr key={location.id}>
                                            <td className="px-6 py-4 align-top" title={location.comment || ''}>
                                                <div className="text-sm font-medium text-slate-900">{location.name}</div>
                                                <div className="text-sm text-slate-500">{location.address}</div>
                                                {location.comment && <div className="text-xs text-slate-400 italic mt-1 max-w-xs truncate">"{location.comment}"</div>}
                                            </td>
                                            <td className="px-6 py-4 align-top whitespace-nowrap text-sm text-slate-500">{location.specialty}</td>
                                            <td className="px-6 py-4 align-top text-sm text-slate-500">
                                                {location.phone && <div>{location.phone}</div>}
                                                {location.email && <div>{location.email}</div>}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-500 align-top">
                                                {location.dameNumber && <div className="whitespace-nowrap"><strong>DAME:</strong> {location.dameNumber}</div>}
                                                {location.officeHours && <div className="whitespace-pre-line"><strong>Zeiten:</strong> {location.officeHours}</div>}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium align-top">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <Button variant="ghost" size="sm" onClick={() => handleEdit(location)}><PencilIcon className="h-4 w-4" /></Button>
                                                    <Button variant="ghost" size="sm" onClick={() => handleDeleteLocation(location.id)}><TrashIcon className="h-4 w-4 text-red-500" /></Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                        {activeTab === MasterDataTab.RESIDENTS && canViewResidents && (
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Station</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ID</th>
                                        <th scope="col" className="relative px-6 py-3"><span className="sr-only">Aktionen</span></th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-200">
                                    {residents.map((resident) => editingRowId === resident.id ? (
                                        <tr key={resident.id} className="bg-blue-50">
                                            <td className="px-6 py-4"><Input name="name" value={editingData.name} onChange={handleEditChange} /></td>
                                            <td className="px-6 py-4">
                                                <Select name="station" value={editingData.station || ''} onChange={handleEditChange}>
                                                    <option value="">Keine Angabe</option>
                                                    {STATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                                </Select>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{resident.id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <Button size="sm" onClick={handleSave}>Speichern</Button>
                                                    <Button size="sm" variant="ghost" onClick={handleCancelEdit}>Abbrechen</Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        <tr key={resident.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{resident.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{resident.station || '-'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{resident.id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <Button variant="ghost" size="sm" onClick={() => handleEdit(resident)}><PencilIcon className="h-4 w-4" /></Button>
                                                    <Button variant="ghost" size="sm" onClick={() => handleDeleteResident(resident.id)}><TrashIcon className="h-4 w-4 text-red-500" /></Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                         {activeTab === MasterDataTab.MITARBEITER && canViewMitarbeiter && (
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Rolle</th>
                                        <th scope="col" className="relative px-6 py-3"><span className="sr-only">Aktionen</span></th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-200">
                                    {users.map((user) => editingRowId === user.id ? (
                                        <tr key={user.id} className="bg-blue-50">
                                            <td className="px-6 py-4"><Input name="name" value={editingData.name} onChange={handleEditChange} /></td>
                                            <td className="px-6 py-4">
                                                <Select name="role" value={editingData.role} onChange={handleEditChange} disabled={user.role === Role.ADMIN} title={user.role === Role.ADMIN ? "Rolle des Admins kann nicht geändert werden." : ""}>
                                                    {Object.values(Role).map(r => <option key={r} value={r}>{r}</option>)}
                                                </Select>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <Button size="sm" onClick={handleSave}>Speichern</Button>
                                                    <Button size="sm" variant="ghost" onClick={handleCancelEdit}>Abbrechen</Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        <tr key={user.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{user.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{user.role}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <Button variant="ghost" size="sm" onClick={() => handleEdit(user)}><PencilIcon className="h-4 w-4" /></Button>
                                                    <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(user.id)} disabled={user.role === Role.ADMIN}><TrashIcon className={`h-4 w-4 ${user.role === Role.ADMIN ? 'text-slate-300' : 'text-red-500'}`} /></Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            )}

            <LocationModal isOpen={isLocationModalOpen} onClose={closeLocationModal} locationToEdit={locationToEdit ?? undefined} />
            <ResidentModal isOpen={isResidentModalOpen} onClose={() => setIsResidentModalOpen(false)} />
            <UserModal isOpen={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} />
        </div>
    );
};

export default MasterDataView;