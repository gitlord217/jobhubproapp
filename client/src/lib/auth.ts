import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "./queryClient";
import type { User, InsertUser } from "@shared/schema";

export function useAuth() {
  return useQuery<User | null>({
    queryKey: ['/api/auth/me'],
    retry: false,
    staleTime: 0, // Always refetch to ensure fresh data
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const response = await apiRequest('POST', '/api/auth/login', credentials);
      return response.json();
    },
    onSuccess: (user) => {
      // Set the user data immediately and invalidate to refetch
      queryClient.setQueryData(['/api/auth/me'], user);
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userData: InsertUser) => {
      const response = await apiRequest('POST', '/api/auth/register', userData);
      return response.json();
    },
    onSuccess: (user) => {
      // Set the user data immediately and invalidate to refetch
      queryClient.setQueryData(['/api/auth/me'], user);
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/auth/logout');
    },
    onSuccess: () => {
      queryClient.setQueryData(['/api/auth/me'], null);
      queryClient.clear();
    },
  });
}
