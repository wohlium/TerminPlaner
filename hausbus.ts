import { HausbusBlock } from '../types';

export const isHausbusBlocked = (dateTime: string | Date, hausbusBlocks: HausbusBlock[]): boolean => {
    if (!dateTime) return false;

    const selectedDateTime = new Date(dateTime);
    if (isNaN(selectedDateTime.getTime())) return false;
    
    const selectedDateStr = `${selectedDateTime.getFullYear()}-${String(selectedDateTime.getMonth() + 1).padStart(2, '0')}-${String(selectedDateTime.getDate()).padStart(2, '0')}`;

    for (const block of hausbusBlocks) {
        if (block.date !== selectedDateStr) continue;

        if (block.isAllDay) return true; // Blocked for the whole day

        if (block.startTime && block.endTime) {
            const appointmentTime = selectedDateTime.getHours() * 60 + selectedDateTime.getMinutes();
            
            const [startH, startM] = block.startTime.split(':').map(Number);
            const blockStartTime = startH * 60 + startM;

            const [endH, endM] = block.endTime.split(':').map(Number);
            const blockEndTime = endH * 60 + endM;

            if (appointmentTime >= blockStartTime && appointmentTime <= blockEndTime) {
                return true;
            }
        }
    }
    return false;
};
