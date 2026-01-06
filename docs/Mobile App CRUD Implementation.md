# Mobile App CRUD Implementation

This document describes the complete CRUD (Create, Read, Update, Delete) implementation for the TaskManager mobile app.

## Overview

The mobile app has been enhanced with:
- **Tab-based navigation** with Tasks and Profile screens
- **Task detail screen** with view and edit modes
- **Full CRUD operations** for tasks
- **User profile screen** with statistics and logout
- **Pull-to-refresh** functionality
- **Optimistic updates** for better UX

## File Structure

```
apps/mobile/
├── app/
│   ├── (app)/
│   │   ├── _layout.tsx      # Tab navigation layout
│   │   ├── index.tsx        # Tasks list screen
│   │   ├── profile.tsx      # User profile screen
│   │   └── task/
│   │       └── [id].tsx     # Task detail/edit screen
│   ├── auth/
│   │   └── login.tsx        # Login screen
│   ├── _layout.tsx          # Root layout
│   └── index.tsx            # Entry redirect
├── hooks/
│   └── use-tasks.ts         # Tasks hook with CRUD operations
└── lib/
    ├── api.ts               # API client
    └── auth-client.ts       # Auth client
```

## New/Updated Files

### 1. `app/(app)/_layout.tsx` - Tab Navigation

Replaced the simple `Slot` layout with a proper `Tabs` navigation:

- **Tasks Tab**: Main task list with checkbox icon
- **Profile Tab**: User profile with account icon
- **Hidden Route**: Task detail screen (not shown in tab bar)

### 2. `app/(app)/index.tsx` - Tasks List Screen

Enhanced task list with:

- **Pull-to-refresh**: Swipe down to refresh tasks
- **Task sections**: Pending tasks shown first, then completed
- **Context menu**: Three-dot menu on each task with Edit/Delete options
- **Overdue indicators**: Red highlighting for overdue tasks
- **FAB with label**: "New Task" floating action button
- **Create task dialog**: Modal for creating new tasks

### 3. `app/(app)/task/[id].tsx` - Task Detail Screen

New screen with two modes:

**View Mode:**
- Task title with completion status chip
- Description section
- Due date with overdue indicator
- Action buttons: Mark Complete, Edit, Delete

**Edit Mode:**
- Editable title and description fields
- Date picker for due date
- Completion toggle switch
- Save/Cancel buttons

### 4. `app/(app)/profile.tsx` - Profile Screen

New profile screen with:

- **User card**: Avatar, name, and email
- **Statistics card**: Total, completed, pending tasks and completion rate
- **Settings section**: Notifications, Theme, About (placeholders)
- **Sign out button**: With confirmation dialog

### 5. `hooks/use-tasks.ts` - Enhanced Tasks Hook

Added new mutations:

```typescript
// Update a task
updateTask: (params: { id: string; data: UpdateTaskRequest }) => Promise<Task>

// Delete a task
deleteTask: (taskId: string) => Promise<void>

// Additional utilities
refetch: () => void           // Manual refresh
isRefetching: boolean         // Refresh state
getTaskById: (id: string) => Task | undefined
```

All mutations include:
- **Optimistic updates**: UI updates immediately
- **Rollback on error**: Reverts if API call fails
- **Cache invalidation**: Refreshes data after success

## API Endpoints Used

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/v1/tasks` | List all tasks |
| GET | `/v1/tasks/:id` | Get single task |
| POST | `/v1/tasks` | Create task |
| PATCH | `/v1/tasks/:id` | Update task |
| PATCH | `/v1/tasks/:id/toggle` | Toggle completion |
| DELETE | `/v1/tasks/:id` | Delete task |

## Navigation Flow

```
Login Screen
    │
    ▼
Tab Navigator
    ├── Tasks Tab (index)
    │       │
    │       ├── [Tap task] → Task Detail Screen
    │       │                    ├── View Mode
    │       │                    └── Edit Mode
    │       │
    │       └── [FAB] → Create Task Dialog
    │
    └── Profile Tab
            │
            └── [Sign Out] → Login Screen
```

## Installation

After pulling these changes, run:

```bash
cd apps/mobile
pnpm install
npx expo start --clear
```

## Dependencies Added

- `@expo/vector-icons`: For tab bar icons (MaterialCommunityIcons)

## Notes

1. The task detail screen uses dynamic routing with `[id].tsx`
2. All delete operations show confirmation dialogs
3. Overdue tasks are highlighted in red
4. The profile screen calculates statistics from the tasks cache
5. Settings items are placeholders for future implementation
