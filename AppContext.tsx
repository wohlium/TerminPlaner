
import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
import { AppState, User, Appointment, Location, Resident, HausbusBlock } from '../types';
import * as api from '../services/api';

// Define the shape of the context value
export interface AppContextValue extends AppState {
  setCurrentUser: (user: User) => void;
  addUser: (user: Omit<User, 'id'>) => Promise<void>;
  updateUser: (user: User) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  addAppointment: (appointment: Omit<Appointment, 'id' | 'createdBy' | 'createdAt'>) => Promise<void>;
  updateAppointment: (appointment: Appointment) => Promise<void>;
  deleteAppointment: (appointmentId: string) => Promise<void>;
  addLocation: (location: Omit<Location, 'id'>) => Promise<void>;
  updateLocation: (location: Location) => Promise<void>;
  deleteLocation: (locationId: string) => Promise<void>;
  addResident: (resident: Omit<Resident, 'id'>) => Promise<void>;
  updateResident: (resident: Resident) => Promise<void>;
  deleteResident: (residentId: string) => Promise<void>;
  addHausbusBlock: (block: Omit<HausbusBlock, 'id' | 'createdBy' | 'createdAt'>) => Promise<void>;
  updateHausbusBlock: (block: HausbusBlock) => Promise<void>;
  deleteHausbusBlock: (blockId: string) => Promise<void>;
  isLoading: boolean;
}


const AppContext = createContext<AppContextValue | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<Omit<AppState, 'currentUser'>>({
      users: [],
      appointments: [],
      residents: [],
      locations: [],
      auditLog: [],
      hausbusBlocks: [],
  });
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      const initialData = await api.initializeDatabase();
      setState(initialData);
      if (initialData.users && initialData.users.length > 0) {
        setCurrentUser(initialData.users[0]);
      }
      setIsLoading(false);
    }
    initialize();
  }, []);

  const addUser = useCallback(async (data: Omit<User, 'id'>) => {
    if (!currentUser) return;
    const originalState = { ...state };
    try {
        const newUser = await api.addUser(data, currentUser);
        setState(prev => ({ ...prev, users: [...prev.users, newUser], auditLog: [api.getLatestLog(), ...prev.auditLog] }));
    } catch (error) {
        console.error("Failed to add user:", error);
        setState(originalState);
        alert("Fehler beim Hinzufügen des Benutzers.");
    }
  }, [currentUser, state]);

  const updateUser = useCallback(async (data: User) => {
    if (!currentUser) return;
    const originalUsers = state.users;
    setState(prev => ({ ...prev, users: prev.users.map(u => u.id === data.id ? data : u) }));
    try {
        await api.updateUser(data, currentUser);
        setState(prev => ({ ...prev, auditLog: [api.getLatestLog(), ...prev.auditLog] }));
    } catch (error) {
        console.error("Failed to update user:", error);
        setState(prev => ({ ...prev, users: originalUsers }));
    }
  }, [currentUser, state.users]);

  const deleteUser = useCallback(async (userId: string) => {
    if (!currentUser) return;
    const originalState = { ...state };
    const userToDelete = state.users.find(u => u.id === userId);
    if (!userToDelete) return;

    setState(prev => ({ ...prev, users: prev.users.filter(u => u.id !== userId) }));
    try {
        await api.deleteUser(userId, currentUser);
        setState(prev => ({...prev, auditLog: [api.getLatestLog(), ...prev.auditLog]}));
    } catch (error) {
        console.error("Failed to delete user:", error);
        alert(error); // Show error from API (e.g., "Cannot delete admin")
        setState(originalState);
    }
  }, [currentUser, state]);
  
  const addAppointment = useCallback(async (data: Omit<Appointment, 'id' | 'createdBy' | 'createdAt'>) => {
    if (!currentUser) return;
    try {
        const newAppointment = await api.addAppointment(data, currentUser);
        setState(prev => ({ ...prev, appointments: [newAppointment, ...prev.appointments], auditLog: [api.getLatestLog(), ...prev.auditLog] }));
    } catch (error) {
        console.error("Failed to add appointment:", error);
        alert("Fehler beim Erstellen des Termins.");
    }
  }, [currentUser]);
  
  const updateAppointment = useCallback(async (data: Appointment) => {
    if (!currentUser) return;
    const originalAppointments = state.appointments;
    setState(prev => ({ ...prev, appointments: prev.appointments.map(a => a.id === data.id ? data : a) }));
    try {
        await api.updateAppointment(data, currentUser);
        setState(prev => ({...prev, auditLog: [api.getLatestLog(), ...prev.auditLog]}));
    } catch (error) {
        console.error("Failed to update appointment:", error);
        setState(prev => ({ ...prev, appointments: originalAppointments }));
    }
  }, [currentUser, state.appointments]);

  const deleteAppointment = useCallback(async (appointmentId: string) => {
    if (!currentUser) return;
    const originalAppointments = state.appointments;
    setState(prev => ({...prev, appointments: prev.appointments.filter(a => a.id !== appointmentId) }));
    try {
        await api.deleteAppointment(appointmentId, currentUser);
        setState(prev => ({...prev, auditLog: [api.getLatestLog(), ...prev.auditLog]}));
    } catch (error) {
        console.error("Failed to delete appointment:", error);
        setState(prev => ({ ...prev, appointments: originalAppointments }));
    }
  }, [currentUser, state.appointments]);
  
  const addLocation = useCallback(async (data: Omit<Location, 'id'>) => {
    if (!currentUser) return;
    try {
        const newLocation = await api.addLocation(data, currentUser);
        setState(prev => ({ ...prev, locations: [newLocation, ...prev.locations], auditLog: [api.getLatestLog(), ...prev.auditLog] }));
    } catch (error) {
        console.error("Failed to add location:", error);
    }
  }, [currentUser]);

  const updateLocation = useCallback(async (data: Location) => {
    if (!currentUser) return;
    const originalLocations = state.locations;
    setState(prev => ({ ...prev, locations: prev.locations.map(l => l.id === data.id ? data : l) }));
    try {
        await api.updateLocation(data, currentUser);
        setState(prev => ({...prev, auditLog: [api.getLatestLog(), ...prev.auditLog]}));
    } catch (error) {
        console.error("Failed to update location:", error);
        setState(prev => ({ ...prev, locations: originalLocations }));
    }
  }, [currentUser, state.locations]);

  const deleteLocation = useCallback(async (locationId: string) => {
    if (!currentUser) return;
    const originalLocations = state.locations;
    setState(prev => ({...prev, locations: prev.locations.filter(l => l.id !== locationId) }));
    try {
        await api.deleteLocation(locationId, currentUser);
        setState(prev => ({...prev, auditLog: [api.getLatestLog(), ...prev.auditLog]}));
    } catch (error) {
        console.error("Failed to delete location:", error);
        setState(prev => ({ ...prev, locations: originalLocations }));
    }
  }, [currentUser, state.locations]);

  const addResident = useCallback(async (data: Omit<Resident, 'id'>) => {
    if (!currentUser) return;
    try {
        const newResident = await api.addResident(data, currentUser);
        setState(prev => ({...prev, residents: [...prev.residents, newResident].sort((a,b) => a.name.localeCompare(b.name)), auditLog: [api.getLatestLog(), ...prev.auditLog] }));
    } catch (error) {
        console.error("Failed to add resident:", error);
    }
  }, [currentUser]);

  const updateResident = useCallback(async (data: Resident) => {
    if (!currentUser) return;
    const originalResidents = state.residents;
    setState(prev => ({...prev, residents: prev.residents.map(r => r.id === data.id ? data : r).sort((a,b) => a.name.localeCompare(b.name)) }));
    try {
        await api.updateResident(data, currentUser);
        setState(prev => ({...prev, auditLog: [api.getLatestLog(), ...prev.auditLog]}));
    } catch (error) {
        console.error("Failed to update resident:", error);
        setState(prev => ({ ...prev, residents: originalResidents }));
    }
  }, [currentUser, state.residents]);
  
  const deleteResident = useCallback(async (residentId: string) => {
      if (!currentUser) return;
      const originalState = { ...state };
      setState(prev => ({ ...prev, residents: prev.residents.filter(r => r.id !== residentId) }));
      try {
          await api.deleteResident(residentId, currentUser);
          setState(prev => ({...prev, auditLog: [api.getLatestLog(), ...prev.auditLog]}));
      } catch (error) {
          console.error("Failed to delete resident:", error);
          alert(error); // Show error from API
          setState(originalState);
      }
  }, [currentUser, state]);
  
  const addHausbusBlock = useCallback(async (data: Omit<HausbusBlock, 'id' | 'createdBy' | 'createdAt'>) => {
      if (!currentUser) return;
      try {
          const newBlock = await api.addHausbusBlock(data, currentUser);
          setState(prev => ({ ...prev, hausbusBlocks: [...prev.hausbusBlocks, newBlock], auditLog: [api.getLatestLog(), ...prev.auditLog] }));
      } catch (error) {
          console.error("Failed to add hausbus block:", error);
      }
  }, [currentUser]);
  
  const updateHausbusBlock = useCallback(async (data: HausbusBlock) => {
      if (!currentUser) return;
      const originalBlocks = state.hausbusBlocks;
      setState(prev => ({ ...prev, hausbusBlocks: prev.hausbusBlocks.map(b => b.id === data.id ? data : b) }));
      try {
          await api.updateHausbusBlock(data, currentUser);
          setState(prev => ({...prev, auditLog: [api.getLatestLog(), ...prev.auditLog]}));
      } catch (error) {
          console.error("Failed to update hausbus block:", error);
          setState(prev => ({ ...prev, hausbusBlocks: originalBlocks }));
      }
  }, [currentUser, state.hausbusBlocks]);
  
  const deleteHausbusBlock = useCallback(async (blockId: string) => {
      if (!currentUser) return;
      const originalBlocks = state.hausbusBlocks;
      setState(prev => ({ ...prev, hausbusBlocks: prev.hausbusBlocks.filter(b => b.id !== blockId) }));
      try {
          await api.deleteHausbusBlock(blockId, currentUser);
          setState(prev => ({...prev, auditLog: [api.getLatestLog(), ...prev.auditLog]}));
      } catch (error) {
          console.error("Failed to delete hausbus block:", error);
          setState(prev => ({ ...prev, hausbusBlocks: originalBlocks }));
      }
  }, [currentUser, state.hausbusBlocks]);
  
  const value: AppContextValue = {
    ...state,
    currentUser: currentUser!, // Can assert not-null after loading effect
    setCurrentUser: (user: User) => setCurrentUser(user),
    addUser,
    updateUser,
    deleteUser,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    addLocation,
    updateLocation,
    deleteLocation,
    addResident,
    updateResident,
    deleteResident,
    addHausbusBlock,
    updateHausbusBlock,
    deleteHausbusBlock,
    isLoading
  };

  return (
    <AppContext.Provider value={value}>
      {isLoading ? (
        <div className="flex items-center justify-center min-h-screen text-lg font-semibold">
          Daten werden geladen...
        </div>
      ) : (
        children
      )}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextValue => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
