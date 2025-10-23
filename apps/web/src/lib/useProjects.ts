import { useQuery } from '@tanstack/react-query';
import type { Project } from './types';

export function useProjects() {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL!;
  
  return useQuery({
    queryKey: ['projects'],
    queryFn: async (): Promise<Project[]> => {
      const r = await fetch(`${base}/projects`, { cache: 'no-store' });
      if (!r.ok) throw new Error('Failed to fetch projects');
      return r.json();
    }
  });
}