import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-neutral-200">
        <div className="mx-auto flex h-16 max-w-6xl items-center px-4">
          <Link href="/" className="text-lg font-bold tracking-tight">
            Mini Mall
          </Link>
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        {children}
      </main>
    </div>
  );
}
