import { Appointment, HausbusBlock, Location, Resident, User, Role, LogAction, AuditLogEntry, AppState, Station } from '../types';

// --- SEED DATA (was in constants.ts) ---
const SEED_USERS: User[] = [
  { id: 'user-1', name: 'Fr. Dr. Admin (HL)', role: Role.ADMIN },
  { id: 'user-4', name: 'Hr. Schmidt (SL)', role: Role.STATIONSLEITUNG },
  { id: 'user-2', name: 'Fr. Meier (MA)', role: Role.MITARBEITER },
  { id: 'user-3', name: 'Fr. Klein (MA)', role: Role.MITARBEITER },
];

const STATIONS = ['EG', '1OG', '2OG'] as const;

const SEED_RESIDENTS: Resident[] = Array.from({ length: 25 }, (_, i) => ({
    id: `res-${i + 1}`,
    name: `Bewohner ${String.fromCharCode(65 + i)}`,
    station: STATIONS[i % STATIONS.length],
}));

const SEED_LOCATIONS: Location[] = [
    { id: 'loc-1', name: 'Dr. med. Allwein (Allgemeinmedizin)', specialty: 'Allgemeinmedizin', address: 'Hauptstraße 1, 12345 Musterstadt', phone: '0123-456789', email: 'allwein@praxis.de', dameNumber: 'D12345', officeHours: 'Mo: 08:00 - 12:00\nDi: 08:00 - 12:00\nMi: 08:00 - 12:00 & 14:00 - 17:00\nDo: 08:00 - 12:00\nFr: 08:00 - 12:00', comment: 'Nimmt neue Patienten auf.' },
    { id: 'loc-2', name: 'Zahnarztpraxis Dr. Beißer', specialty: 'Zahnmedizin', address: 'Zahnweg 5, 12345 Musterstadt', phone: '0123-987654', email: 'beisser@praxis.de', dameNumber: 'D67890', officeHours: 'Mo: 09:00 - 18:00\nDi: 09:00 - 18:00\nMi: Geschlossen\nDo: 09:00 - 18:00\nFr: 09:00 - 14:00', comment: 'Spezialisiert auf Angstpatienten.' },
    { id: 'loc-3', name: 'Klinikum Zentral', specialty: 'Krankenhaus', address: 'Klinikallee 10, 12345 Musterstadt', phone: '0123-112233', email: 'info@klinikum-zentral.de', dameNumber: 'D54321', officeHours: 'Notaufnahme: 24/7 geöffnet', comment: 'Alle Kassen.' },
    { id: 'loc-4', name: 'Augenarzt Dr. Weitsicht', specialty: 'Augenheilkunde', address: 'Am Markt 2, 12345 Musterstadt', phone: '0123-445566', email: 'weitsicht@praxis.de', dameNumber: 'D98765', officeHours: 'Mo - Do: 08:00 - 16:00\nFr: 08:00 - 12:00\n(Nur nach Vereinbarung)', comment: 'Lange Wartezeiten für Routinekontrollen.' },
];

const now = new Date();
const getFutureDate = (days: number) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
const toYYYYMMDD = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const SEED_INITIAL_APPOINTMENTS: Appointment[] = [
  { id: 'apt-1', residentId: 'res-1', locationId: 'loc-1', dateTime: getFutureDate(2).toISOString(), reason: 'Jahreskontrolle', toBring: ['E-Card'], toBringOther: '', escortNeeded: true, escortName: 'Frau Klein', transportType: 'Taxi', transportOrganized: true, createdBy: 'user-2', createdAt: new Date().toISOString() },
  { id: 'apt-2', residentId: 'res-3', locationId: 'loc-2', dateTime: getFutureDate(3).toISOString(), reason: 'Zahnschmerzen', toBring: ['E-Card'], toBringOther: '', escortNeeded: false, escortName: '', transportType: 'Kein', transportOrganized: true, createdBy: 'user-3', createdAt: new Date().toISOString() },
  { id: 'apt-3', residentId: 'res-2', locationId: 'loc-3', dateTime: getFutureDate(8).toISOString(), reason: 'MRT Knie', toBring: ['E-Card', 'Überweisung'], toBringOther: 'Vorbefunde', escortNeeded: true, escortName: 'Herr Groß', transportType: 'Rettung', transportOrganized: false, createdBy: 'user-1', createdAt: new Date().toISOString() },
];

const SEED_HAUSBUS_BLOCKS: HausbusBlock[] = [
    { id: 'hblock-1', date: toYYYYMMDD(getFutureDate(5)), isAllDay: true, startTime: '', endTime: '', comment: 'Jährlicher Service in der Werkstatt', createdBy: 'user-1', createdAt: new Date().toISOString() },
    { id: 'hblock-2', date: toYYYYMMDD(getFutureDate(10)), isAllDay: false, startTime: '09:00', endTime: '12:30', comment: 'Ausgeborgt für Einkauf', createdBy: 'user-1', createdAt: new Date().toISOString() },
];

const DB_KEY = 'terminplaner_db';
const SIMULATED_DELAY = 300;

// --- DATABASE (localStorage) ABSTRACTION ---
type Database = Omit<AppState, 'currentUser'>;

const getDb = (): Database => {
    const dbString = localStorage.getItem(DB_KEY);
    return dbString ? JSON.parse(dbString) : createInitialDb();
};

const setDb = (db: Database) => {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
};

const createInitialDb = (): Database => {
    const initialDb: Database = {
        users: SEED_USERS,
        residents: SEED_RESIDENTS,
        locations: SEED_LOCATIONS,
        appointments: SEED_INITIAL_APPOINTMENTS,
        auditLog: [],
        hausbusBlocks: SEED_HAUSBUS_BLOCKS,
    };
    setDb(initialDb);
    return initialDb;
};

// --- AUDIT LOG ---
let lastLogEntry: AuditLogEntry | null = null;

const createLogEntry = (db: Database, userId: string, action: LogAction, target: string, targetId: string, details: string): Database => {
    const newLogEntry: AuditLogEntry = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId,
      action,
      target,
      targetId,
      details,
    };
    lastLogEntry = newLogEntry;
    db.auditLog.unshift(newLogEntry);
    return db;
};

export const getLatestLog = (): AuditLogEntry => {
    if (!lastLogEntry) throw new Error("No log entry available");
    return lastLogEntry;
}

// --- API FUNCTIONS ---

const apiCall = <T>(logic: (db: Database) => T): Promise<T> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            try {
                const db = getDb();
                const result = logic(db);
                setDb(db);
                resolve(result);
            } catch (e: any) {
                reject(e);
            }
        }, SIMULATED_DELAY);
    });
};

export const initializeDatabase = (): Promise<Database> => apiCall(db => db);

// --- User API ---
export const addUser = (data: Omit<User, 'id'>, currentUser: User) => apiCall(db => {
    const newUser: User = { ...data, id: `user-${Date.now()}` };
    db.users.push(newUser);
    createLogEntry(db, currentUser.id, LogAction.CREATE, 'user', newUser.id, `Benutzer "${newUser.name}" mit Rolle "${newUser.role}" erstellt.`);
    return newUser;
});

export const updateUser = (data: User, currentUser: User) => apiCall(db => {
    db.users = db.users.map(u => u.id === data.id ? data : u);
    createLogEntry(db, currentUser.id, LogAction.UPDATE, 'user', data.id, `Benutzer "${data.name}" bearbeitet.`);
    return data;
});

export const deleteUser = (userId: string, currentUser: User) => apiCall(db => {
    const userToDelete = db.users.find(u => u.id === userId);
    if (!userToDelete) throw new Error("User not found");
    if (userToDelete.role === Role.ADMIN) {
        throw new Error("Administratoren können nicht gelöscht werden.");
    }
    db.users = db.users.filter(u => u.id !== userId);
    createLogEntry(db, currentUser.id, LogAction.DELETE, 'user', userId, `Benutzer "${userToDelete.name}" gelöscht.`);
});


// --- Appointment API ---
export const addAppointment = (data: Omit<Appointment, 'id'|'createdBy'|'createdAt'>, currentUser: User) => apiCall(db => {
    const newAppointment: Appointment = { ...data, id: `apt-${Date.now()}`, createdBy: currentUser.id, createdAt: new Date().toISOString() };
    db.appointments.unshift(newAppointment);
    const residentName = db.residents.find(r => r.id === newAppointment.residentId)?.name || 'Unknown';
    createLogEntry(db, currentUser.id, LogAction.CREATE, 'appointment', newAppointment.id, `Termin für ${residentName} erstellt.`);
    return newAppointment;
});

export const updateAppointment = (data: Appointment, currentUser: User) => apiCall(db => {
    db.appointments = db.appointments.map(a => a.id === data.id ? data : a);
    const residentName = db.residents.find(r => r.id === data.residentId)?.name || 'Unknown';
    createLogEntry(db, currentUser.id, LogAction.UPDATE, 'appointment', data.id, `Termin für ${residentName} bearbeitet.`);
    return data;
});

export const deleteAppointment = (appointmentId: string, currentUser: User) => apiCall(db => {
    const appointmentToDelete = db.appointments.find(a => a.id === appointmentId);
    if (!appointmentToDelete) return;
    const residentName = db.residents.find(r => r.id === appointmentToDelete.residentId)?.name || 'Unknown';
    db.appointments = db.appointments.filter(a => a.id !== appointmentId);
    createLogEntry(db, currentUser.id, LogAction.DELETE, 'appointment', appointmentId, `Termin für ${residentName} gelöscht.`);
});

// --- Location API ---
export const addLocation = (data: Omit<Location, 'id'>, currentUser: User) => apiCall(db => {
    const newLocation: Location = { ...data, id: `loc-${Date.now()}` };
    db.locations.unshift(newLocation);
    createLogEntry(db, currentUser.id, LogAction.CREATE, 'location', newLocation.id, `Stammdaten-Eintrag "${newLocation.name}" erstellt.`);
    return newLocation;
});

export const updateLocation = (data: Location, currentUser: User) => apiCall(db => {
    db.locations = db.locations.map(l => l.id === data.id ? data : l);
    createLogEntry(db, currentUser.id, LogAction.UPDATE, 'location', data.id, `Stammdaten-Eintrag "${data.name}" bearbeitet.`);
    return data;
});

export const deleteLocation = (locationId: string, currentUser: User) => apiCall(db => {
    const locationToDelete = db.locations.find(l => l.id === locationId);
    if (!locationToDelete) return;
    db.locations = db.locations.filter(l => l.id !== locationId);
    createLogEntry(db, currentUser.id, LogAction.DELETE, 'location', locationId, `Stammdaten-Eintrag "${locationToDelete.name}" gelöscht.`);
});

// --- Resident API ---
export const addResident = (data: Omit<Resident, 'id'>, currentUser: User) => apiCall(db => {
    const newResident: Resident = { ...data, id: `res-${Date.now()}` };
    db.residents.push(newResident);
    db.residents.sort((a,b) => a.name.localeCompare(b.name));
    createLogEntry(db, currentUser.id, LogAction.CREATE, 'resident', newResident.id, `Bewohner "${newResident.name}" erstellt.`);
    return newResident;
});

export const updateResident = (data: Resident, currentUser: User) => apiCall(db => {
    db.residents = db.residents.map(r => r.id === data.id ? data : r).sort((a,b) => a.name.localeCompare(b.name));
    createLogEntry(db, currentUser.id, LogAction.UPDATE, 'resident', data.id, `Bewohner "${data.name}" bearbeitet.`);
    return data;
});

export const deleteResident = (residentId: string, currentUser: User) => apiCall(db => {
    const residentToDelete = db.residents.find(res => res.id === residentId);
    if (!residentToDelete) return;
    if (db.appointments.some(apt => apt.residentId === residentId)) {
        throw new Error('Dieser Bewohner kann nicht gelöscht werden, da noch Termine vorhanden sind. Bitte löschen oder bearbeiten Sie zuerst die Termine des Bewohners.');
    }
    db.residents = db.residents.filter(r => r.id !== residentId);
    createLogEntry(db, currentUser.id, LogAction.DELETE, 'resident', residentId, `Bewohner "${residentToDelete.name}" gelöscht.`);
});

// --- Hausbus API ---
export const addHausbusBlock = (data: Omit<HausbusBlock, 'id'|'createdBy'|'createdAt'>, currentUser: User) => apiCall(db => {
    const newBlock: HausbusBlock = { ...data, id: `hblock-${Date.now()}`, createdBy: currentUser.id, createdAt: new Date().toISOString() };
    db.hausbusBlocks.push(newBlock);
    createLogEntry(db, currentUser.id, LogAction.CREATE, 'hausbus_block', newBlock.id, `Hausbus-Sperre am ${newBlock.date} erstellt: ${newBlock.comment}`);
    return newBlock;
});

export const updateHausbusBlock = (data: HausbusBlock, currentUser: User) => apiCall(db => {
    db.hausbusBlocks = db.hausbusBlocks.map(b => b.id === data.id ? data : b);
    createLogEntry(db, currentUser.id, LogAction.UPDATE, 'hausbus_block', data.id, `Hausbus-Sperre am ${data.date} bearbeitet.`);
    return data;
});

export const deleteHausbusBlock = (blockId: string, currentUser: User) => apiCall(db => {
    const blockToDelete = db.hausbusBlocks.find(b => b.id === blockId);
    if (!blockToDelete) return;
    db.hausbusBlocks = db.hausbusBlocks.filter(b => b.id !== blockId);
    createLogEntry(db, currentUser.id, LogAction.DELETE, 'hausbus_block', blockId, `Hausbus-Sperre am ${blockToDelete.date} gelöscht.`);
});
