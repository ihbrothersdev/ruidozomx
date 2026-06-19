interface MientrasSuenaProps {
  /** All-time distinct people who have started a session. */
  totalListeners: number
}

export function MientrasSuena({ totalListeners }: MientrasSuenaProps) {
  if (totalListeners <= 0) return null

  const noun = totalListeners === 1 ? 'persona ya escucho' : 'personas ya escucharon'

  return (
    <div className='mx-auto mt-5 flex max-w-[793px] justify-center px-4'>
      <p className='font-impact-label text-center text-[25px] text-green-300 uppercase md:text-left'>
        {`${totalListeners} ${noun} el mixtape`}
      </p>
    </div>
  )
}
