import TagForm from '@/components/admin/TagForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NewTagPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4 border-b pb-4">
        <Link href="/admin/tags" className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Create New Tag</h1>
          <p className="text-sm text-muted-foreground">Add a new tag to classify your content.</p>
        </div>
      </div>

      <TagForm />
    </div>
  );
}
