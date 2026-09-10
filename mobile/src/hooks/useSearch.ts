import { useQuery } from '@tanstack/react-query';
import { search } from '@/services/search';
import type { SearchEntity } from '@/services/search';

export function useSearch(query: string, entity: SearchEntity) {
  const trimmed = query.trim();
  return useQuery({
    queryKey: ['search', trimmed, entity],
    queryFn: () => search(trimmed, entity),
    enabled: trimmed.length > 0,
  });
}
