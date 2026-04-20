const REPO_NAME = 'week06_agile_team_health_check';
const GITHUB_URL = `https://github.com/hayimpapa/${REPO_NAME}`;
// PROMPTS.txt not present in this repo, so the "The Prompt" card is omitted.

export default function AboutThisBuild() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 sm:py-14 space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">About This Build</h2>
        <p className="text-gray-500">
          Week 6 of{' '}
          <strong className="text-gray-700">
            52 Apps in 52 Weeks Before I Turn 52
          </strong>{' '}
          by Hey I&apos;m Papa
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <section className="bg-white border border-gray-200 rounded-xl p-5 space-y-2 shadow-sm">
          <h3 className="text-xs font-semibold tracking-wider text-indigo-600 uppercase">
            The Problem
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            Agile teams need a lightweight, anonymous way to check how they&apos;re
            really doing across multiple dimensions &mdash; delivering value, fun,
            mission, health of codebase, and more. Traditional retros can be heavy
            or skipped altogether, and without regular pulse checks the small issues
            linger unnoticed until they grow into big ones.
          </p>
        </section>

        <section className="bg-white border border-gray-200 rounded-xl p-5 space-y-2 shadow-sm">
          <h3 className="text-xs font-semibold tracking-wider text-indigo-600 uppercase">
            The App
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            Squad Health Check is a Spotify-style team health check, built for speed
            and zero friction. Team members vote anonymously on a shared link
            (Awesome / OK / Struggling) and the session creator views an aggregated
            RAG breakdown, heatmap, trend arrows, and comments behind a 4-digit PIN
            &mdash; with results updating live as votes come in. Built with React 19,
            Vite, Tailwind CSS v4, and Supabase (Postgres + Row Level Security +
            Realtime).
          </p>
        </section>

        <section className="bg-white border border-gray-200 rounded-xl p-5 space-y-3 shadow-sm sm:col-span-2">
          <h3 className="text-xs font-semibold tracking-wider text-indigo-600 uppercase">
            GitHub Repo
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            All the source code, schema, and setup instructions live on GitHub.
          </p>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-5 rounded-lg transition-colors"
          >
            View on GitHub
          </a>
        </section>
      </div>
    </div>
  );
}
