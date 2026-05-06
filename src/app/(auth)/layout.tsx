import Image from 'next/image'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden bg-[#041437]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,197,24,0.18),transparent_22%),radial-gradient(circle_at_bottom_right,rgba(191,10,48,0.18),transparent_28%),linear-gradient(180deg,#041437_0%,#06235b_58%,#0b3d88_100%)]" />
      <div className="absolute left-[-8rem] top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute bottom-[-8rem] right-[-6rem] h-72 w-72 rounded-full bg-[#f5c518]/20 blur-3xl" />
      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="relative overflow-hidden rounded-[2rem] border border-white/12 bg-white/[0.08] p-8 text-white shadow-[0_30px_80px_rgba(0,0,0,0.28)] backdrop-blur-sm sm:p-10">
            <div className="absolute right-[-4rem] top-[-4rem] h-48 w-48 rounded-full border border-white/12" />
            <div className="absolute bottom-[-5rem] left-[-3rem] h-44 w-44 rounded-full border border-[#f5c518]/18" />
            <div className="relative">
              <div className="mb-8 flex items-center gap-4">
                <div className="rounded-[1.5rem] border border-white/12 bg-white/10 p-3 shadow-[0_16px_40px_rgba(0,0,0,0.2)]">
                  <Image
                    src="/brand/world-cup-2026-emblem.svg"
                    alt="Emblema da Copa do Mundo FIFA 2026"
                    width={80}
                    height={80}
                    unoptimized
                    className="h-20 w-20 object-contain"
                  />
                </div>
                <div>
                  <p className="text-[0.72rem] uppercase tracking-[0.34em] text-white/60">
                    FIFA World Cup 26
                  </p>
                  <h1 className="text-3xl font-semibold tracking-[0.18em] text-white sm:text-4xl">
                    Figurinhas da Copa
                  </h1>
                </div>
              </div>

              <h2 className="max-w-lg text-4xl font-semibold leading-tight text-white sm:text-5xl">
                Um álbum digital com alma de sede mundial.
              </h2>
              <p className="mt-4 max-w-xl text-base leading-7 text-white/[0.72]">
                Organize a coleção, acompanhe as repetidas e encontre parceiros de troca com uma
                interface inspirada no universo visual da Copa de 2026.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                {['Canadá', 'México', 'Estados Unidos'].map((host) => (
                  <span
                    key={host}
                    className="rounded-full border border-white/12 bg-white/10 px-4 py-2 text-sm font-medium text-white/[0.88]"
                  >
                    {host}
                  </span>
                ))}
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-4">
                  <p className="text-xs uppercase tracking-[0.26em] text-white/[0.52]">Formato</p>
                  <p className="mt-2 text-2xl font-semibold text-white">48 seleções</p>
                </div>
                <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-4">
                  <p className="text-xs uppercase tracking-[0.26em] text-white/[0.52]">Clima</p>
                  <p className="mt-2 text-2xl font-semibold text-white">Álbum Panini</p>
                </div>
                <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-4">
                  <p className="text-xs uppercase tracking-[0.26em] text-white/[0.52]">Objetivo</p>
                  <p className="mt-2 text-2xl font-semibold text-white">Trocas rápidas</p>
                </div>
              </div>
            </div>
          </section>

          <div className="rounded-[2rem] border border-white/50 bg-white/94 p-8 shadow-[0_28px_72px_rgba(4,20,55,0.28)] backdrop-blur sm:p-10">
            <div className="mb-8">
              <p className="text-sm font-medium uppercase tracking-[0.28em] text-[#bf0a30]">
                Sua conta
              </p>
              <h3 className="mt-2 text-3xl font-semibold text-[#06235b]">Entre no jogo</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Acesse sua coleção e acompanhe as trocas em uma experiência inspirada na identidade
                da Copa.
              </p>
            </div>

            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
