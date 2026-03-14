import TopicForm from '@/components/admin/TopicForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NewTopicPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4 border-b pb-4">
        <Link href="/admin/topics" className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Create New Topic</h1>
          <p className="text-sm text-muted-foreground">Add a new root-level educational category.</p>
        </div>
      </div>

      <TopicForm />
    </div>
  );
}
