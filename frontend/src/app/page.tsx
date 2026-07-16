import { TaskDashboard } from '@/components/tasks/TaskDashboard';

export default function Home() {
  return (
    <main className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto">
      <TaskDashboard />
    </main>
  );
}