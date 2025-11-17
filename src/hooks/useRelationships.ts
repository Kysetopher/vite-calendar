import { useContext } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { RelationshipContext } from '@/contexts/RelationshipProvider';
import { apiRequest } from '@/lib/queryClient';
import type { Child, Adult } from '@/utils/schema/relationship';

export function useRelationships() {

  const context = useContext(RelationshipContext);
  const queryClient = useQueryClient();

  const createChild = async (data: Partial<Child>) => {
    const newChild = await apiRequest<Child>('POST', '/api/children', data);
    queryClient.setQueryData<Child[]>(['/api/children'], (prev = []) => [
      ...prev,
      newChild,
    ]);
    return newChild;
  };

  const updateChild = async (id: number, data: Partial<Child>) => {
    await apiRequest('PUT', `/api/children/${id}`, data);
    queryClient.setQueryData<Child[]>(['/api/children'], (prev = []) =>
      prev.map((c) => (c.id === id ? ({ ...c, ...data } as Child) : c)),
    );
  };

  const deleteChild = async (id: number) => {
    await apiRequest('DELETE', `/api/children/${id}`);
    queryClient.setQueryData<Child[]>(['/api/children'], (prev = []) =>
      prev.filter((c) => c.id !== id),
    );
  };

  const createAdult = async (data: Partial<Adult>) => {
    const newAdult = await apiRequest<Adult>('POST', '/api/adults', data);
    queryClient.setQueryData<Adult[]>(['/api/adults'], (prev = []) => [
      ...prev,
      newAdult,
    ]);
    return newAdult;
  };

  const updateAdult = async (id: number, data: Partial<Adult>) => {
    await apiRequest('PUT', `/api/adults/${id}`, data);
    queryClient.setQueryData<Adult[]>(['/api/adults'], (prev = []) =>
      prev.map((a) => (a.id === id ? ({ ...a, ...data } as Adult) : a)),
    );
  };

  const deleteAdult = async (id: number) => {
    await apiRequest('DELETE', `/api/adults/${id}`);
    queryClient.setQueryData<Adult[]>(['/api/adults'], (prev = []) =>
      prev.filter((a) => a.id !== id),
    );
  };

  return {
    ...context,
    createChild,
    updateChild,
    deleteChild,
    createAdult,
    updateAdult,
    deleteAdult,
  };
}

