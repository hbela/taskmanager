import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Task, UpdateTaskRequest } from "@taskmanager/shared"; 
import { apiFetch } from "../lib/api";

interface UpdateTaskParams {
  id: string;
  data: UpdateTaskRequest;
}

export const useTasks = () => {
  const queryClient = useQueryClient();

  // Fetch all tasks
  const tasksQuery = useQuery<Task[]>({
    queryKey: ["tasks"],
    queryFn: () => apiFetch("/v1/tasks"),
  });

  // Create a new task
  const createTaskMutation = useMutation({
    mutationFn: (newTask: { title: string; description?: string; dueDate?: string }) => 
      apiFetch("/v1/tasks", {
        method: "POST",
        body: JSON.stringify(newTask),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  // Toggle task completion status
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

  // Update a task
  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }: UpdateTaskParams) => 
      apiFetch(`/v1/tasks/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      const previousTasks = queryClient.getQueryData<Task[]>(["tasks"]);

      queryClient.setQueryData<Task[]>(["tasks"], (old) =>
        old?.map((t) => (t.id === id ? { ...t, ...data } : t))
      );

      return { previousTasks };
    },
    onError: (_err, _variables, context) => {
      queryClient.setQueryData(["tasks"], context?.previousTasks);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  // Delete a task
  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: string) => 
      apiFetch(`/v1/tasks/${taskId}`, { method: "DELETE" }),
    onMutate: async (taskId) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      const previousTasks = queryClient.getQueryData<Task[]>(["tasks"]);

      queryClient.setQueryData<Task[]>(["tasks"], (old) =>
        old?.filter((t) => t.id !== taskId)
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

  // Get a single task by ID
  const getTaskById = (id: string): Task | undefined => {
    return tasksQuery.data?.find(t => t.id === id);
  };

  return {
    tasks: tasksQuery.data ?? [],
    isLoading: tasksQuery.isLoading,
    isRefetching: tasksQuery.isRefetching,
    error: tasksQuery.error,
    refetch: tasksQuery.refetch,
    getTaskById,
    createTask: createTaskMutation.mutate,
    toggleTask: toggleTaskMutation.mutate,
    updateTask: updateTaskMutation.mutateAsync,
    deleteTask: deleteTaskMutation.mutateAsync,
    isCreating: createTaskMutation.isPending,
    isUpdating: updateTaskMutation.isPending,
    isDeleting: deleteTaskMutation.isPending,
  };
};
