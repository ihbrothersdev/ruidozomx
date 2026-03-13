'use client'


interface ProponRolaModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProponRolaModal({ open, onOpenChange }: ProponRolaModalProps) {
  return (<></>
    // <Dialog
    //   open={open}
    //   onOpenChange={onOpenChange}
    // >
    //   <DialogContent
    //     className='overflow-hidden border-2 border-white/20 bg-black p-0 shadow-2xl sm:max-w-sm'
    //     showCloseButton={false}
    //   >
    //     <DialogTitle className='sr-only'>Para proponer una rola tienes que ser parte de Ruidozo</DialogTitle>

    //     <div className='flex flex-col items-center px-6 pt-6 pb-8'>
    //       {/* Top text */}
    //       <h2 className='font-baby-doll mb-4 text-center text-2xl leading-tight tracking-wide text-white sm:text-3xl'>
    //         PARA PROPONER
    //         <br />
    //         UNA ROLA
    //       </h2>

    //       {/* Lightning bolt image */}
    //       <div className='mb-4 w-48 sm:w-56'>
    //         <Image
    //           src='/assets/registro/modal/modal-propon-tu-rola.png'
    //           alt=''
    //           width={300}
    //           height={400}
    //           className='w-full'
    //           style={{ height: 'auto' }}
    //           unoptimized
    //         />
    //       </div>

    //       {/* Bottom text */}
    //       <p className='font-baby-doll mb-5 text-center text-xl leading-tight tracking-wide text-white sm:text-2xl'>
    //         TIENES QUE SER
    //         <br />
    //         PARTE DE RU!DOZO
    //       </p>

    //       {/* CTA */}
    //       <Link
    //         href='/registro/elige-rol'
    //         onClick={() => onOpenChange(false)}
    //         className='font-baby-doll text-2xl tracking-wider text-red-600 transition-colors hover:text-red-400 sm:text-3xl'
    //       >
    //         REGÍSTRATE
    //       </Link>
    //     </div>
    //   </DialogContent>
    // </Dialog>
  )
}