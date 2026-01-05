import { useTasks } from "../hooks/use-tasks";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

export default function WebDashboard() {
  const { tasks, isLoading, createTask, toggleTask } = useTasks();
  const [newTitle, setNewTitle] = useState("");

  const handleAdd = () => {
    if (!newTitle) return;
    createTask(newTitle);
    setNewTitle("");
  };

  return (
    <div className="container max-w-2xl py-10">
      <Card>
        <CardHeader>
          <CardTitle>Task Manager</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-6">
            <Input 
              placeholder="What needs to be done?" 
              value={newTitle} 
              onChange={(e) => setNewTitle(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
            <Button onClick={handleAdd}>Add</Button>
          </div>

          {isLoading ? <p>Loading...</p> : (
            <div className="space-y-4">
              {tasks?.map((task) => (
                <div key={task.id} className="flex items-center space-x-3 p-2 border-b">
                  <Checkbox 
                    checked={task.completed} 
                    onCheckedChange={() => toggleTask(task.id!)} 
                  />
                  <span className={task.completed ? "line-through text-muted-foreground" : ""}>
                    {task.title}
                  </span>
                </div>
              ))}
              {tasks?.length === 0 && (
                <p className="text-center text-muted-foreground">No tasks yet. Add one!</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
