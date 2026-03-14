export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white border-b">
        <nav className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-primary">EduHub</h1>
          <p className="text-gray-600 mt-1">Free educational content platform</p>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-8">Welcome to EduHub</h2>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-8">
            <h3 className="text-xl font-semibold text-blue-900 mb-4">
              🚀 Project Setup Complete!
            </h3>
            <p className="text-blue-800 mb-4">
              Your EduHub monorepo is now scaffolded and ready for development.
            </p>
            <div className="bg-white rounded p-4 mb-4">
              <pre className="text-sm overflow-auto">
{`Project Structure:
eduhub/
├── apps/
│   ├── api/        (Express backend)
│   └── web/        (Next.js frontend)
├── packages/
│   └── database/   (Prisma schema)
└── package.json    (Monorepo root)`}
              </pre>
            </div>
            <div className="space-y-2 text-sm">
              <p>✅ <strong>Next Steps:</strong></p>
              <ul className="list-disc list-inside space-y-1 text-blue-800">
                <li>Set up environment variables (.env files)</li>
                <li>Connect to Neon PostgreSQL database</li>
                <li>Run Prisma migrations</li>
                <li>Seed the database with admin user</li>
                <li>Start the dev server: <code className="bg-blue-100 px-2 py-1 rounded">npm run dev</code></li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-4">Setup Checklist</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
              <span>✅</span>
              <span>Monorepo scaffolding complete</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
              <span>⏳</span>
              <span>Environment variables setup</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
              <span>⏳</span>
              <span>Database connection</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
              <span>⏳</span>
              <span>Admin authentication</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
