// src/hooks/useSchedule.ts
import { useContext } from 'react';
import { ScheduleContext } from '../contexts/ScheduleProvider';

export function useSchedule() {
  const context = useContext(ScheduleContext) as any;
  return {
    ...context,

  };
}

