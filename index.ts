import express, { Request, Response } from "express";
import { v4 as uuid } from "uuid";
import { Task } from "./tasks";

const app = express();
app.use(express.json());


let tasks: Task[] = [];

app.post("/tasks", (req: Request, res: Response) => {
  const { title } = req.body;

  if (!title) {
    return res.status(400).json({ error: "Title is required" });
  }

  const newTask: Task = {
    id: uuid(),
    title,
    completed: false,
    createdAt: new Date().toISOString(),
  };

  tasks.push(newTask);
  res.status(201).json(newTask);
});

app.get("/tasks", (_req: Request, res: Response) => {
  res.status(200).json(tasks);
});

app.get("/tasks/:id", (req: Request, res: Response) => {
  const task = tasks.find(t => t.id === req.params.id);
  if (!task) return res.status(404).json({ error: "Task not found" });
  res.status(200).json(task);
});

app.patch("/tasks/:id", (req: Request, res: Response) => {
  const { title, completed } = req.body;
  const taskIndex = tasks.findIndex(t => t.id === req.params.id);

  if (taskIndex === -1) return res.status(404).json({ error: "Task not found" });

  if (title !== undefined) tasks[taskIndex].title = title;
  if (completed !== undefined) tasks[taskIndex].completed = completed;

  res.status(200).json(tasks[taskIndex]);
});

app.delete("/tasks/:id", (req: Request, res: Response) => {
  const taskIndex = tasks.findIndex(t => t.id === req.params.id);

  if (taskIndex === -1) return res.status(404).json({ error: "Task not found" });

  tasks.splice(taskIndex, 1);
  res.status(204).send();
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
