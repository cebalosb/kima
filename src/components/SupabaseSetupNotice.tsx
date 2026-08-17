export function SupabaseSetupNotice() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="max-w-lg rounded-2xl border border-border bg-surface p-8 shadow-lg shadow-black/[0.08]">
        <h1 className="font-display text-2xl font-bold text-foreground">Connect Supabase to continue</h1>
        <p className="mt-3 text-sm leading-relaxed text-foreground-muted">
          This app needs your Supabase project's URL and public (anon) key before it can run.
        </p>
        <ol className="mt-4 flex flex-col gap-2 text-sm leading-relaxed text-foreground-muted">
          <li>
            1. In your Supabase project, go to <span className="font-medium text-foreground">Settings → API</span>.
          </li>
          <li>
            2. Copy the <span className="font-medium text-foreground">Project URL</span> and the{' '}
            <span className="font-medium text-foreground">anon public</span> key.
          </li>
          <li>
            3. Open the <code className="rounded bg-muted px-1.5 py-0.5 text-xs">.env.local</code> file in the
            project folder and paste them in:
          </li>
        </ol>
        <pre className="mt-3 overflow-x-auto rounded-xl bg-muted p-4 text-xs text-foreground">
          {`VITE_SUPABASE_URL=https://your-project-ref.supabase.co\nVITE_SUPABASE_ANON_KEY=your-anon-public-key`}
        </pre>
        <p className="mt-3 text-sm leading-relaxed text-foreground-muted">
          4. Save the file, then restart the dev server. This page will refresh automatically.
        </p>
      </div>
    </div>
  )
}
