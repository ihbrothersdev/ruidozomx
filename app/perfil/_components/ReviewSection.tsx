interface ReviewSectionProps {
  review: string | null
  description: string | null
}

export default function ReviewSection({ review, description }: ReviewSectionProps) {
  const text = review || description

  return (
    <div>
      <h2 className='font-baby-doll text-lg tracking-wider text-black uppercase'>
        Reseña del proyecto
      </h2>
      <div className='mt-2 border border-red-500 h-60 p-4'>
        {text ? <p className='font-pt-mono text-sm leading-relaxed text-black/80'>{text}</p> :
        <p className='font-pt-mono mt-2 text-[10px] tracking-wider text-black/30 uppercase'>
          600 caractéres máximo
        </p>}
      </div>
    </div>
  )
}
