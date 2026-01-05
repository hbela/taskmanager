import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Task } from "@taskmanager/shared"; 
import { apiFetch } from "../lib/api";

export const useTasks = () => {
  const queryClient = useQueryClient();

  const tasksQuery = useQuery<Task[]>({
    queryKey: ["tasks"],
    queryFn: () => apiFetch("/v1/tasks"),
  });

  const createTaskMutation = useMutation({
    mutationFn: (newTitle: string) => 
      apiFetch("/v1/tasks", {
        method: "POST",
        body: JSON.stringify({ title: newTitle }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const toggleTaskMutation = useMutation({
    mutationFn: (taskId: string) => 
      apiFetch(`/v1/tasks/${taskId}/toggle`, { method: "PATCH" }),
    onMutate: async (taskId) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      const previousTasks = queryClient.getQueryData<Task[]>(["tasks"]);

      queryClient.setQueryData<Task[]>(["tasks"], (old) =>
        old?.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
      );

      return { previousTasks };
    },
    onError: (_err, _taskId, context) => {
      queryClient.setQueryData(["tasks"], context?.previousTasks);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  return {
    tasks: tasksQuery.data ?? [],
    isLoading: tasksQuery.isLoading,
    error: tasksQuery.error,
    createTask: createTaskMutation.mutate,
    toggleTask: toggleTaskMutation.mutate,
  };
};
