import React from 'react';
import { useAppContext } from '../context/AppContext';
import { AuditLogEntry } from '../types';

const AuditLogView: React.FC = () => {
    const { auditLog, users } = useAppContext();

    const getUserName = (userId: string) => {
        return users.find(u => u.id === userId)?.name || 'Unbekanntes System';
    };

    const formatTimestamp = (timestamp: string) => {
        return new Date(timestamp).toLocaleString('de-DE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    };

    return (
        <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Zeitpunkt</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Benutzer</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Aktion</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Details</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {auditLog.map((entry: AuditLogEntry) => (
                            <tr key={entry.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{formatTimestamp(entry.timestamp)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{getUserName(entry.userId)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{entry.action}</td>
                                <td className="px-6 py-4 text-sm text-slate-500">{entry.details}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {auditLog.length === 0 && (
                    <div className="text-center py-10 px-6">
                        <h3 className="text-lg font-semibold text-slate-700">Keine Protokolleinträge vorhanden.</h3>
                        <p className="text-slate-500 mt-1">Das Protokoll ist derzeit leer.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuditLogView;
