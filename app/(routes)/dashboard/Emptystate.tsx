import React from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import CreateInterviewDialog from './_components/CreateInterviewDialog'

function Emptystate() {
  return (
    <div className='mt-14 flex flex-col items-center gap-5 border-dashed p-10 border-4 rounded-2xl bg-gray-10'>
        <Image src={'/ai4.png'} alt='ai-mock' width={160} height={160}/>
        <h2 className='text-lg text-gray-500'>No interviews scheduled</h2>
        <CreateInterviewDialog />
    </div>
    
  )
}

export default Emptystate