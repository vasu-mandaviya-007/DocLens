import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    createNotebook,
    deleteNotebook,
    getNotebooks,
    pinnNotebook,
    renameNotebook,
} from "../apis/notebookApi.js";

export const notebooksQueryKey = ["notebooks"];

// List
export function useNotebooksQuery() {
    return useQuery({
        queryKey: notebooksQueryKey,
        queryFn: async () => {
            const res = await getNotebooks();
            return res.data.data;
        },
        staleTime: 30_000,
    });
}

// Create
export function useCreateNotebook() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => createNotebook(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: notebooksQueryKey });
        },
    });
}

// Rename (optimistic)
export function useRenameNotebook() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, title }) => renameNotebook(id, title),
        onMutate: async ({ id, title }) => {
            await queryClient.cancelQueries({ queryKey: notebooksQueryKey });
            const previous = queryClient.getQueryData(notebooksQueryKey);
            queryClient.setQueryData(notebooksQueryKey, (old) =>
                (old ?? []).map((n) =>
                    n.notebook_id === id ? { ...n, title } : n
                )
            );
            return { previous };
        },
        onError: (_err, _vars, context) => {
            if (context?.previous) {
                queryClient.setQueryData(notebooksQueryKey, context.previous);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: notebooksQueryKey });
        },
    });
}

// Pin / unpin (optimistic)
export function usePinNotebook() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => pinnNotebook(id),
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: notebooksQueryKey });
            const previous = queryClient.getQueryData(notebooksQueryKey);
            queryClient.setQueryData(notebooksQueryKey, (old) =>
                (old ?? []).map((n) =>
                    n.notebook_id === id ? { ...n, pinned: !n.pinned } : n
                )
            );
            return { previous };
        },
        onError: (_err, _id, context) => {
            if (context?.previous) {
                queryClient.setQueryData(notebooksQueryKey, context.previous);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: notebooksQueryKey });
        },
    });
}

// Delete (optimistic)
export function useDeleteNotebook() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => deleteNotebook(id),
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: notebooksQueryKey });
            const previous = queryClient.getQueryData(notebooksQueryKey);
            queryClient.setQueryData(notebooksQueryKey, (old) =>
                (old ?? []).filter((n) => n.notebook_id !== id)
            );
            return { previous };
        },
        onError: (_err, _id, context) => {
            if (context?.previous) {
                queryClient.setQueryData(notebooksQueryKey, context.previous);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: notebooksQueryKey });
        },
    });
}