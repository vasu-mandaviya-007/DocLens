import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getUsage, updateProfile } from "../apis/authApi.js";

export const usageQueryKey = ["usage"];

export function useUsageQuery() {
    return useQuery({
        queryKey: usageQueryKey,
        queryFn: async () => {
            const res = await getUsage(); 
            return res.data;
        },
        staleTime: 30_000,
    });
}

export function useUpdateProfile() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload) => updateProfile(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: usageQueryKey });
        },
    });
}