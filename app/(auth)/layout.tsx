export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#002868] px-4 py-12">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <h1
            className="text-5xl tracking-wider text-[#002868]"
            style={{ fontFamily: 'var(--font-bebas, sans-serif)' }}
          >
            FIGURINHAS<br />DA COPA
          </h1>
          <p className="mt-1 text-sm text-slate-500">Copa do Mundo 2026</p>
        </div>
        {children}
      </div>
    </div>
  )
}
