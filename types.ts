import { STATIONS } from './constants';

export enum Role {
  ADMIN = 'Heim/Pflegeleitung',
  STATIONSLEITUNG = 'Stationsleitung',
  MITARBEITER = 'Mitarbeiter',
}

export interface User {
  id: string;
  name: string;
  role: Role;
}

export type Station = typeof STATIONS[number];

export interface Resident {
  id:string;
  name: string;
  station?: Station;
}

export interface Location {
  id: string;
  name: string;
  specialty?: string;
  address?: string;
  email?: string;
  phone?: string;
  fax?: string;
  dameNumber?: string;
  officeHours?: string;
  comment?: string;
}

export interface HausbusBlock {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  comment: string;
  isAllDay: boolean;
  createdBy: string; // User ID
  createdAt: string; // ISO string
}

export interface Appointment {
  id: string;
  residentId: string;
  locationId: string;
  dateTime: string; // ISO string
  reason: string;
  toBring: string[];
  toBringOther: string;
  escortNeeded: boolean;
  escortName: string;
  transportType: string;
  transportOrganized: boolean;
  createdBy: string; // User ID
  createdAt: string; // ISO string
  // For displaying Hausbus blocks in the same list
  isHausbusBlock?: true;
  hausbusBlockDetails?: HausbusBlock;
}

export enum LogAction {
    CREATE = 'CREATE',
    UPDATE = 'UPDATE',
    DELETE = 'DELETE',
}

export interface AuditLogEntry {
    id: string;
    timestamp: string; // ISO string
    userId: string;
    action: LogAction;
    target: string; // e.g., 'appointment'
    targetId: string;
    details: string; // e.g., "Appointment for resident X created."
}

export enum AppView {
    DASHBOARD = 'DASHBOARD',
    MASTER_DATA = 'MASTER_DATA',
}

export enum MasterDataTab {
    LOCATIONS = 'Orte & Kontakte',
    RESIDENTS = 'Bewohner',
    MITARBEITER = 'Mitarbeiter',
    HAUSBUS = 'Hausbus Sperre',
    AUDIT_LOG = 'Protokoll',
}

export enum AppointmentViewMode {
    SIMPLE = 'Einfach',
    DETAILED = 'Detail',
}

export interface AppState {
  currentUser: User;
  appointments: Appointment[];
  residents: Resident[];
  locations: Location[];
  auditLog: AuditLogEntry[];
  hausbusBlocks: HausbusBlock[];
  users: User[];
}
