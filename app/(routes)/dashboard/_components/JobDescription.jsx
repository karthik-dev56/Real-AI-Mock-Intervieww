import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import React from 'react'

function JobDescription({onHandleInputChange}) {
  return (
    <div className='border rounded-2xl p-10'>
      <div>
        <label className='text-black font-medium'>Job Title</label>
        <Input placeholder='Ex: Reactjs Developer' className='text-black' onChange={(e)=>onHandleInputChange('jobTitle',e.target.value)} />
      </div>
       <div className='mt-6'>
        <label className='text-black font-medium'>Job Description</label>
        <Textarea placeholder='Ex: Enter Job Description' className='h-[200px] text-black' onChange={(e)=>onHandleInputChange('jobDescription',e.target.value)} />
      </div>
      
    </div>
  )
}

export default JobDescription