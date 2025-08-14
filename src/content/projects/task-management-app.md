---
title: "Task Management App"
description: "A collaborative task management application built with Next.js, TypeScript, and Prisma. Features real-time updates, team collaboration, and project management tools."
publishDate: 2024-10-10
tech: ["Next.js", "TypeScript", "Prisma", "Real-time", "Collaboration"]
github: "https://github.com/johndoe/task-management-app"
demo: "https://taskflow-app.vercel.app"
image: "/images/projects/task-management.jpg"
featured: false
status: "completed"
---

# Task Management App

A modern, collaborative task management application designed for teams and individuals. Built with Next.js 14, TypeScript, and Prisma, featuring real-time collaboration, project management, and productivity tracking tools.

## ✨ Key Features

### Task Management
- **Create, edit, and organize tasks** with rich descriptions
- **Due dates and priorities** with visual indicators
- **Task dependencies** and subtask relationships
- **Custom labels and categories** for organization
- **File attachments** and comments on tasks
- **Time tracking** with automatic and manual logging

### Team Collaboration
- **Real-time updates** using WebSockets
- **Team workspaces** with role-based permissions
- **Task assignments** and responsibility tracking
- **Activity feeds** showing team progress
- **@mentions** and notifications system
- **Collaborative commenting** on tasks and projects

### Project Management
- **Project boards** with Kanban-style layouts
- **Sprint planning** and agile methodology support
- **Gantt charts** for timeline visualization
- **Progress tracking** with completion metrics
- **Milestone management** and deadline tracking
- **Resource allocation** and workload balancing

### Productivity Features
- **Time tracking** with detailed reporting
- **Productivity analytics** and insights
- **Custom workflows** and automation rules
- **Calendar integration** with Google Calendar
- **Search and filtering** across all content
- **Export capabilities** for reports and data

## 🏗️ Technical Architecture

### Frontend Stack
- **Next.js 14** with App Router and Server Components
- **TypeScript** for type safety and better developer experience
- **Tailwind CSS** for utility-first styling
- **Framer Motion** for smooth animations
- **React Hook Form** with Zod validation
- **Tanstack Query** for server state management

### Backend & Database
- **Next.js API Routes** with middleware
- **Prisma ORM** with PostgreSQL database
- **NextAuth.js** for authentication
- **Pusher** for real-time features
- **Uploadthing** for file uploads
- **Resend** for email notifications

### Infrastructure
- **Vercel** for hosting and deployment
- **Neon** for managed PostgreSQL
- **Cloudinary** for image optimization
- **GitHub Actions** for CI/CD

## 🔧 Core Implementation

### Database Schema
```prisma
// prisma/schema.prisma
model User {
  id              String   @id @default(cuid())
  email           String   @unique
  name            String?
  image           String?
  role            Role     @default(USER)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  // Relationships
  workspaces      WorkspaceMember[]
  tasks           Task[]
  comments        Comment[]
  timeEntries     TimeEntry[]
  
  @@map("users")
}

model Workspace {
  id          String   @id @default(cuid())
  name        String
  description String?
  slug        String   @unique
  image       String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relationships
  members     WorkspaceMember[]
  projects    Project[]
  
  @@map("workspaces")
}

model Project {
  id          String        @id @default(cuid())
  name        String
  description String?
  status      ProjectStatus @default(ACTIVE)
  startDate   DateTime?
  endDate     DateTime?
  color       String        @default("#3B82F6")
  workspaceId String
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  
  // Relationships
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  tasks       Task[]
  boards      Board[]
  
  @@map("projects")
}

model Task {
  id          String     @id @default(cuid())
  title       String
  description String?
  status      TaskStatus @default(TODO)
  priority    Priority   @default(MEDIUM)
  dueDate     DateTime?
  assigneeId  String?
  projectId   String
  parentId    String?
  position    Float      @default(0)
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  
  // Relationships
  project     Project     @relation(fields: [projectId], references: [id], onDelete: Cascade)
  assignee    User?       @relation(fields: [assigneeId], references: [id])
  parent      Task?       @relation("TaskDependency", fields: [parentId], references: [id])
  subtasks    Task[]      @relation("TaskDependency")
  comments    Comment[]
  timeEntries TimeEntry[]
  labels      TaskLabel[]
  
  @@map("tasks")
}

model Comment {
  id        String   @id @default(cuid())
  content   String
  taskId    String
  authorId  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relationships
  task      Task @relation(fields: [taskId], references: [id], onDelete: Cascade)
  author    User @relation(fields: [authorId], references: [id], onDelete: Cascade)
  
  @@map("comments")
}

enum Role {
  USER
  ADMIN
}

enum WorkspaceRole {
  MEMBER
  ADMIN
  OWNER
}

enum ProjectStatus {
  ACTIVE
  COMPLETED
  ARCHIVED
}

enum TaskStatus {
  TODO
  IN_PROGRESS
  IN_REVIEW
  DONE
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  URGENT
}
```

### API Routes with Type Safety
```typescript
// app/api/tasks/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

const createTaskSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  projectId: z.string().cuid(),
  assigneeId: z.string().cuid().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  dueDate: z.string().datetime().optional(),
  parentId: z.string().cuid().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = createTaskSchema.parse(body);

    // Check project access
    const project = await prisma.project.findFirst({
      where: {
        id: validatedData.projectId,
        workspace: {
          members: {
            some: {
              userId: session.user.id,
            },
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found or access denied' },
        { status: 404 }
      );
    }

    // Get next position for task ordering
    const lastTask = await prisma.task.findFirst({
      where: { projectId: validatedData.projectId },
      orderBy: { position: 'desc' },
    });

    const task = await prisma.task.create({
      data: {
        ...validatedData,
        position: (lastTask?.position || 0) + 1,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            comments: true,
            subtasks: true,
          },
        },
      },
    });

    // Trigger real-time update
    await fetch(`${process.env.PUSHER_APP_URL}/api/pusher/trigger`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        channel: `project-${validatedData.projectId}`,
        event: 'task-created',
        data: task,
      }),
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const status = searchParams.get('status');
    const assigneeId = searchParams.get('assigneeId');

    const tasks = await prisma.task.findMany({
      where: {
        AND: [
          projectId ? { projectId } : {},
          status ? { status: status as TaskStatus } : {},
          assigneeId ? { assigneeId } : {},
          {
            project: {
              workspace: {
                members: {
                  some: {
                    userId: session.user.id,
                  },
                },
              },
            },
          },
        ],
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        _count: {
          select: {
            comments: true,
            subtasks: true,
          },
        },
      },
      orderBy: [
        { position: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Real-time Updates with Pusher
```typescript
// lib/pusher.ts
import Pusher from 'pusher';
import PusherJS from 'pusher-js';

// Server-side Pusher instance
export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

// Client-side Pusher instance
export const pusherClient = new PusherJS(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
});

// React hook for real-time updates
import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export function useRealTimeUpdates(projectId: string) {
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const channel = pusherClient.subscribe(`project-${projectId}`);

    channel.bind('pusher:subscription_succeeded', () => {
      setIsConnected(true);
    });

    channel.bind('task-created', (data: any) => {
      queryClient.setQueryData(['tasks', projectId], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          tasks: [...oldData.tasks, data],
        };
      });
    });

    channel.bind('task-updated', (data: any) => {
      queryClient.setQueryData(['tasks', projectId], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          tasks: oldData.tasks.map((task: any) =>
            task.id === data.id ? { ...task, ...data } : task
          ),
        };
      });
    });

    channel.bind('task-deleted', (data: any) => {
      queryClient.setQueryData(['tasks', projectId], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          tasks: oldData.tasks.filter((task: any) => task.id !== data.id),
        };
      });
    });

    return () => {
      channel.unbind_all();
      pusherClient.unsubscribe(`project-${projectId}`);
      setIsConnected(false);
    };
  }, [projectId, queryClient]);

  return { isConnected };
}
```

### Drag and Drop Task Management
```typescript
// components/KanbanBoard.tsx
import React from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { TaskColumn } from './TaskColumn';
import { TaskCard } from './TaskCard';
import { useUpdateTaskMutation } from '@/hooks/useTasks';

interface KanbanBoardProps {
  tasks: Task[];
  projectId: string;
}

const COLUMNS = [
  { id: 'TODO', title: 'To Do', color: 'bg-gray-100' },
  { id: 'IN_PROGRESS', title: 'In Progress', color: 'bg-blue-100' },
  { id: 'IN_REVIEW', title: 'In Review', color: 'bg-yellow-100' },
  { id: 'DONE', title: 'Done', color: 'bg-green-100' },
];

export function KanbanBoard({ tasks, projectId }: KanbanBoardProps) {
  const updateTaskMutation = useUpdateTaskMutation();
  const sensors = useSensors(useSensor(PointerSensor));

  const tasksByStatus = React.useMemo(() => {
    return COLUMNS.reduce((acc, column) => {
      acc[column.id] = tasks
        .filter((task) => task.status === column.id)
        .sort((a, b) => a.position - b.position);
      return acc;
    }, {} as Record<string, Task[]>);
  }, [tasks]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeTask = tasks.find((task) => task.id === active.id);
    if (!activeTask) return;

    const overColumn = over.data.current?.type === 'column' 
      ? over.id as string 
      : tasks.find((task) => task.id === over.id)?.status;

    if (!overColumn) return;

    // Update task status and position
    const newStatus = overColumn as TaskStatus;
    const tasksInColumn = tasksByStatus[newStatus] || [];
    
    let newPosition: number;
    if (over.data.current?.type === 'column') {
      // Dropped on empty column
      newPosition = tasksInColumn.length > 0 
        ? tasksInColumn[tasksInColumn.length - 1].position + 1 
        : 1;
    } else {
      // Dropped on another task
      const overTask = tasks.find((task) => task.id === over.id);
      if (overTask) {
        const overIndex = tasksInColumn.findIndex((task) => task.id === overTask.id);
        newPosition = overIndex > 0 
          ? (tasksInColumn[overIndex - 1].position + overTask.position) / 2
          : overTask.position / 2;
      } else {
        newPosition = tasksInColumn.length + 1;
      }
    }

    // Optimistic update
    updateTaskMutation.mutate({
      id: activeTask.id,
      data: {
        status: newStatus,
        position: newPosition,
      },
    });
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 h-full">
        {COLUMNS.map((column) => (
          <TaskColumn
            key={column.id}
            id={column.id}
            title={column.title}
            color={column.color}
            tasks={tasksByStatus[column.id] || []}
          />
        ))}
      </div>
    </DndContext>
  );
}
```

### Advanced Search and Filtering
```typescript
// hooks/useTaskSearch.ts
import { useState, useMemo } from 'react';
import { Task } from '@/types';

interface SearchFilters {
  query: string;
  status: TaskStatus[];
  priority: Priority[];
  assigneeIds: string[];
  projectIds: string[];
  dueDateRange: {
    start?: Date;
    end?: Date;
  };
  hasComments: boolean;
  isOverdue: boolean;
}

export function useTaskSearch(tasks: Task[]) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    status: [],
    priority: [],
    assigneeIds: [],
    projectIds: [],
    dueDateRange: {},
    hasComments: false,
    isOverdue: false,
  });

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Text search
      if (filters.query) {
        const query = filters.query.toLowerCase();
        const searchableText = [
          task.title,
          task.description,
          task.assignee?.name,
          task.project.name,
        ].join(' ').toLowerCase();
        
        if (!searchableText.includes(query)) {
          return false;
        }
      }

      // Status filter
      if (filters.status.length > 0 && !filters.status.includes(task.status)) {
        return false;
      }

      // Priority filter
      if (filters.priority.length > 0 && !filters.priority.includes(task.priority)) {
        return false;
      }

      // Assignee filter
      if (filters.assigneeIds.length > 0) {
        if (!task.assigneeId || !filters.assigneeIds.includes(task.assigneeId)) {
          return false;
        }
      }

      // Project filter
      if (filters.projectIds.length > 0 && !filters.projectIds.includes(task.projectId)) {
        return false;
      }

      // Due date range
      if (filters.dueDateRange.start || filters.dueDateRange.end) {
        if (!task.dueDate) return false;
        
        const dueDate = new Date(task.dueDate);
        if (filters.dueDateRange.start && dueDate < filters.dueDateRange.start) {
          return false;
        }
        if (filters.dueDateRange.end && dueDate > filters.dueDateRange.end) {
          return false;
        }
      }

      // Has comments filter
      if (filters.hasComments && task._count.comments === 0) {
        return false;
      }

      // Overdue filter
      if (filters.isOverdue) {
        if (!task.dueDate || new Date(task.dueDate) >= new Date()) {
          return false;
        }
      }

      return true;
    });
  }, [tasks, filters]);

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      status: [],
      priority: [],
      assigneeIds: [],
      projectIds: [],
      dueDateRange: {},
      hasComments: false,
      isOverdue: false,
    });
  };

  return {
    filters,
    filteredTasks,
    updateFilter,
    clearFilters,
    totalTasks: tasks.length,
    filteredCount: filteredTasks.length,
  };
}
```

## 📊 Analytics and Reporting

### Productivity Dashboard
```typescript
// components/AnalyticsDashboard.tsx
import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { useAnalytics } from '@/hooks/useAnalytics';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export function AnalyticsDashboard({ projectId }: { projectId: string }) {
  const { data: analytics, isLoading } = useAnalytics(projectId);

  if (isLoading) {
    return <div>Loading analytics...</div>;
  }

  const taskCompletionData = {
    labels: analytics.taskCompletion.map((item: any) => item.date),
    datasets: [
      {
        label: 'Tasks Completed',
        data: analytics.taskCompletion.map((item: any) => item.completed),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Tasks Created',
        data: analytics.taskCompletion.map((item: any) => item.created),
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const priorityDistribution = {
    labels: ['Low', 'Medium', 'High', 'Urgent'],
    datasets: [
      {
        data: analytics.priorityDistribution,
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Tasks"
          value={analytics.totalTasks}
          change={analytics.tasksChange}
          icon="📋"
        />
        <StatCard
          title="Completed"
          value={analytics.completedTasks}
          change={analytics.completionChange}
          icon="✅"
        />
        <StatCard
          title="In Progress"
          value={analytics.inProgressTasks}
          change={analytics.progressChange}
          icon="🔄"
        />
        <StatCard
          title="Overdue"
          value={analytics.overdueTasks}
          change={analytics.overdueChange}
          icon="⏰"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Task Completion Trend</h3>
          <Line data={taskCompletionData} options={{ responsive: true }} />
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Priority Distribution</h3>
          <Doughnut data={priorityDistribution} options={{ responsive: true }} />
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Team Performance</h3>
        <Bar
          data={{
            labels: analytics.teamPerformance.map((item: any) => item.name),
            datasets: [
              {
                label: 'Tasks Completed',
                data: analytics.teamPerformance.map((item: any) => item.completed),
                backgroundColor: 'rgba(59, 130, 246, 0.8)',
              },
            ],
          }}
          options={{ responsive: true }}
        />
      </div>
    </div>
  );
}
```

## 🔔 Notification System

### Email Notifications
```typescript
// lib/notifications.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendTaskAssignmentNotification(
  task: Task,
  assignee: User,
  assigner: User
) {
  try {
    await resend.emails.send({
      from: 'TaskFlow <notifications@taskflow.app>',
      to: assignee.email,
      subject: `New task assigned: ${task.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>You've been assigned a new task</h2>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; color: #1f2937;">${task.title}</h3>
            ${task.description ? `<p style="color: #6b7280; margin: 0;">${task.description}</p>` : ''}
            
            <div style="margin-top: 15px;">
              <span style="background: ${getPriorityColor(task.priority)}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
                ${task.priority}
              </span>
              ${task.dueDate ? `<span style="margin-left: 10px; color: #6b7280;">Due: ${new Date(task.dueDate).toLocaleDateString()}</span>` : ''}
            </div>
          </div>
          
          <p>Assigned by: <strong>${assigner.name}</strong></p>
          
          <a href="${process.env.NEXTAUTH_URL}/projects/${task.projectId}/tasks/${task.id}" 
             style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 20px;">
            View Task
          </a>
        </div>
      `,
    });
  } catch (error) {
    console.error('Error sending email notification:', error);
  }
}

function getPriorityColor(priority: Priority): string {
  const colors = {
    LOW: '#10b981',
    MEDIUM: '#3b82f6',
    HIGH: '#f59e0b',
    URGENT: '#ef4444',
  };
  return colors[priority];
}
```

### In-App Notifications
```typescript
// components/NotificationCenter.tsx
import React from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { Bell, X, Check, Eye } from 'lucide-react';

export function NotificationCenter() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No notifications
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {formatDistanceToNow(new Date(notification.createdAt))} ago
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-1 ml-2">
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="p-1 text-blue-600 hover:text-blue-700"
                          title="Mark as read"
                        >
                          <Eye size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                        title="Delete"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
```

## 🧪 Testing Strategy

### Unit Testing with Jest
```typescript
// __tests__/lib/task-utils.test.ts
import { calculateTaskProgress, isTaskOverdue, getTaskPriority } from '@/lib/task-utils';

describe('Task Utils', () => {
  describe('calculateTaskProgress', () => {
    test('calculates progress correctly for tasks with subtasks', () => {
      const task = {
        id: '1',
        status: 'IN_PROGRESS',
        subtasks: [
          { id: '2', status: 'DONE' },
          { id: '3', status: 'DONE' },
          { id: '4', status: 'TODO' },
          { id: '5', status: 'IN_PROGRESS' },
        ],
      };

      const progress = calculateTaskProgress(task);
      expect(progress).toBe(50); // 2 out of 4 subtasks completed
    });

    test('returns 100 for completed tasks without subtasks', () => {
      const task = {
        id: '1',
        status: 'DONE',
        subtasks: [],
      };

      const progress = calculateTaskProgress(task);
      expect(progress).toBe(100);
    });
  });

  describe('isTaskOverdue', () => {
    test('returns true for tasks past due date', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const task = {
        id: '1',
        dueDate: yesterday,
        status: 'TODO',
      };

      expect(isTaskOverdue(task)).toBe(true);
    });

    test('returns false for completed tasks even if past due', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const task = {
        id: '1',
        dueDate: yesterday,
        status: 'DONE',
      };

      expect(isTaskOverdue(task)).toBe(false);
    });
  });
});
```

### Integration Testing with Playwright
```typescript
// e2e/task-management.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Task Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login and navigate to project
    await page.goto('/login');
    await page.fill('[data-testid=email]', 'test@example.com');
    await page.fill('[data-testid=password]', 'password');
    await page.click('[data-testid=login-button]');
    await page.waitForURL('/dashboard');
    await page.click('[data-testid=project-1]');
  });

  test('creates a new task', async ({ page }) => {
    await page.click('[data-testid=create-task-button]');
    await page.fill('[data-testid=task-title]', 'New Test Task');
    await page.fill('[data-testid=task-description]', 'Task description');
    await page.selectOption('[data-testid=task-priority]', 'HIGH');
    await page.click('[data-testid=save-task-button]');

    await expect(page.locator('[data-testid=task-item]')).toContainText('New Test Task');
  });

  test('updates task status via drag and drop', async ({ page }) => {
    const task = page.locator('[data-testid=task-1]');
    const todoColumn = page.locator('[data-testid=column-TODO]');
    const inProgressColumn = page.locator('[data-testid=column-IN_PROGRESS]');

    // Verify task is initially in TODO column
    await expect(todoColumn.locator('[data-testid=task-1]')).toBeVisible();

    // Drag task to IN_PROGRESS column
    await task.dragTo(inProgressColumn);

    // Verify task moved to IN_PROGRESS column
    await expect(inProgressColumn.locator('[data-testid=task-1]')).toBeVisible();
    await expect(todoColumn.locator('[data-testid=task-1]')).not.toBeVisible();
  });

  test('real-time updates work correctly', async ({ page, context }) => {
    // Open second tab to simulate another user
    const secondPage = await context.newPage();
    await secondPage.goto('/projects/1');

    // Create task in first tab
    await page.click('[data-testid=create-task-button]');
    await page.fill('[data-testid=task-title]', 'Real-time Test Task');
    await page.click('[data-testid=save-task-button]');

    // Verify task appears in second tab via real-time update
    await expect(secondPage.locator('[data-testid=task-item]')).toContainText('Real-time Test Task');
  });
});
```

## 🚀 Performance Optimizations

### Database Optimization
```sql
-- Indexes for common queries
CREATE INDEX CONCURRENTLY idx_tasks_project_status ON tasks(project_id, status);
CREATE INDEX CONCURRENTLY idx_tasks_assignee_status ON tasks(assignee_id, status) WHERE assignee_id IS NOT NULL;
CREATE INDEX CONCURRENTLY idx_tasks_due_date ON tasks(due_date) WHERE due_date IS NOT NULL;
CREATE INDEX CONCURRENTLY idx_tasks_position ON tasks(project_id, position);

-- Composite index for dashboard queries
CREATE INDEX CONCURRENTLY idx_tasks_dashboard ON tasks(project_id, status, priority, due_date);

-- Index for full-text search
CREATE INDEX CONCURRENTLY idx_tasks_search ON tasks USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')));
```

### Client-Side Optimizations
```typescript
// Optimized task list with virtualization
import { FixedSizeList as List } from 'react-window';

const TaskList = React.memo(({ tasks }: { tasks: Task[] }) => {
  const TaskItem = React.memo(({ index, style }: { index: number; style: any }) => {
    const task = tasks[index];
    return (
      <div style={style}>
        <TaskCard task={task} />
      </div>
    );
  });

  return (
    <List
      height={600}
      itemCount={tasks.length}
      itemSize={120}
      overscanCount={5}
    >
      {TaskItem}
    </List>
  );
});
```

## 📱 Mobile Experience

### Progressive Web App Features
```json
// public/manifest.json
{
  "name": "TaskFlow - Task Management",
  "short_name": "TaskFlow",
  "description": "Collaborative task management application",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3b82f6",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ]
}
```

## 🔮 Future Enhancements

### Planned Features
- **AI-powered task recommendations** and smart scheduling
- **Advanced reporting** with custom dashboard widgets
- **Integration APIs** for third-party tools (Slack, GitHub, etc.)
- **Mobile native apps** for iOS and Android
- **Workflow automation** with custom triggers and actions

### Technical Roadmap
- **Microservices architecture** for better scalability
- **Event sourcing** for complete audit trails
- **Advanced caching** with Redis for improved performance
- **Machine learning** for productivity insights
- **Voice commands** and natural language processing

This task management application demonstrates modern full-stack development practices while solving real productivity challenges. The combination of type-safe development, real-time features, and thoughtful UX creates a powerful tool for team collaboration and personal productivity.