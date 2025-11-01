"use client"
import React,{useState} from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send } from 'lucide-react'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'  
import { Loader2Icon } from 'lucide-react'
import { useParams } from 'next/navigation'  
import axios from 'axios'
import { toast } from 'sonner'
function StartInterview() {
    const {interviewId} = useParams();
    const [loading,Setloading] = useState(false)
    const [lloading,Setlloading] = useState(false)
    const[email,Setemail] = useState('')

    const Sendmail = async() => {
        Setlloading(true)
        try {
            const res = await axios.post("/api/generate-ai-questions/sendmail", {
            email: email,
            interviewLink: window.location.origin+'/interview/'+interviewId+'/start'
        })
        if(res.status === 200){
            Setlloading(false)
            toast.success("Mail Sent Successfully")
            Setemail('')
        }
    }
        catch (error) {
            console.error("Error sending mail:", error);
            Setlloading(false)
            toast.error("Error sending mail")
        }
    }

    
    return (
        <div className='flex flex-col items-center mt-2 border-dashed rounded-2xl bg-gray-10'>
            <div>
            <Image src={'/ai6.png'} alt="AI 6" width={400} height={400}  />
            </div>
            <div className='mt-2'>
                <h2 className='text-3xl font-bold'>Ready For Interview</h2>
            </div>
            <div className='mt-2'>
                 <p className='text-gray-500 font-medium'>Ready to start your interview? Click the button below to begin.</p>
            </div>
            <Link href={'/interview/'+interviewId+'/start'}>
            <Button className='mt-4 rounded-lg' onClick={() => Setloading(true)}>Start Interview<ArrowRight />
            {loading && <Loader2Icon className='animate-spin' />}
               </Button>
            </Link>
            <div>
                <h2 className='text-2xl font-bold mt-6'>Want to Send Interview Link SomeOne?</h2>
            </div>
            <div className='flex gap-5 mt-6 w-full max-w-xl'>
                <Input placeholder='Enter mail to send someone' className='w-full' value={email} onChange={(e) => Setemail(e.target.value)}/>
                <Button onClick={Sendmail}>{lloading && <Loader2Icon className='animate-spin' />} <Send /></Button>
            </div>
        </div>
         
    )
}

export default StartInterview