export default function Loading() {
  return (
    <main className='relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0a0a0a] px-6 text-center'>
      <div
        className='absolute inset-0 z-0 opacity-40'
        style={{
          backgroundImage: "url('/assets/textura/background-textura.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />
      <div className='relative z-10 flex flex-col items-center gap-4'>
        <div className='h-12 w-12 animate-spin rounded-full border-2 border-white/20 border-t-red-600' />
        <p className='font-baby-doll text-lg text-white/80'>Cargando…</p>
      </div>
    </main>
  )
}
