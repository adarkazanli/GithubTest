/**
 * Task Data Fixtures
 *
 * Predefined task data for testing.
 */

export const sampleTasks = [
  {
    id: "task-001",
    orderId: "001",
    taskName: "Initialize Project",
    estimatedDuration: 30,
    startTime: "09:00",
    endTime: "09:30",
    notes: ""
  },
  {
    id: "task-002",
    orderId: "002",
    taskName: "Setup Environment",
    estimatedDuration: 45,
    startTime: "09:30",
    endTime: "10:15",
    notes: "Requires admin access"
  },
  {
    id: "task-003",
    orderId: "003",
    taskName: "Write Documentation",
    estimatedDuration: 60,
    startTime: "10:15",
    endTime: "11:15",
    notes: ""
  }
];

export const emptyTaskList = [];

export const singleTask = [sampleTasks[0]];

export const tasksWithoutTimes = sampleTasks.map(task => ({
  ...task,
  startTime: null,
  endTime: null
}));
