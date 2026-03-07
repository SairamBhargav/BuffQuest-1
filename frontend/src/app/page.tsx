import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 font-sans text-center">
      <h1 className="text-4xl font-bold mb-6">Welcome to BuffQuest</h1>
      <p className="text-lg mb-8 max-w-lg">
        The AI-moderated campus quest platform.
      </p>
      <Link 
        href="/quests/new" 
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        Test Quest Moderation
      </Link>
    </main>
  );
}
