import type { Role } from '@/lib/types'
import Link from 'next/link'

interface ActionButtonsProps {
  isOwnProfile: boolean
  role: Role | null
  acceptProposals: boolean
}

export default function ActionButtons({ isOwnProfile, role, acceptProposals }: ActionButtonsProps) {
  // TODO: Add functionality later, not part of MVP.
  // if (isOwnProfile) {
  //   return (
  //     <div className='flex flex-wrap gap-3'>
  //       <Link
  //         href='/perfil/editar'
  //         className='font-pt-mono rounded-sm border-2 border-black bg-black px-6 py-2.5 text-xs font-bold tracking-wider text-white uppercase transition-colors hover:bg-black/80'
  //       >
  //         Editar perfil
  //       </Link>
  //     </div>
  //   )
  // }

  return (
    <div className='space-y-3'>
      {acceptProposals ? (
        <button className='font-pt-mono block w-full rounded-sm border-2 border-black bg-black px-6 py-2.5 text-center text-xs font-bold tracking-wider text-white uppercase transition-colors hover:bg-black/80'>
          Enviar propuesta
        </button>
      ) : (
        <button className='font-pt-mono block w-full rounded-sm border-2 border-black bg-black px-6 py-2.5 text-center text-xs font-bold tracking-wider text-white uppercase transition-colors hover:bg-black/80'>
          Conectar
        </button>
      )}

      {/* Banda-specific: "Proponer rola de esta banda" */}
      {role === 'banda' && (
        <Link
          href='/proponer-rola'
          className='font-pt-mono block rounded-sm bg-red-600 px-6 py-2.5 text-center text-xs font-bold tracking-wider text-white uppercase transition-colors hover:bg-red-700'
        >
          Proponer rola de esta banda
        </Link>
      )}
    </div>
  )
}
