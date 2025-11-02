"use client"
import React,{useState,useEffect} from 'react'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button';
import Emptystate from './Emptystate';
import CreateInterviewDialog from './_components/CreateInterviewDialog';
import { useConvex } from 'convex/react';
import { useParams } from 'next/navigation';
import { api } from '@/convex/_generated/api';
import { Loader2Icon } from 'lucide-react';
function Dashboard() {
    const { user } = useUser();
    const convex = useConvex()
    const {interviewId} = useParams()
    const [data, setData] = useState<dataset[]>([])
    const[loading,setLoading]=useState(false)


    type dataset = {
        _id: string;
        finalScore?: number;
        weakness?: string | any;
        strengths?: string | any;
        conclusion?: string | any;
    }

    useEffect(() => {
        GetResults();

    },[interviewId, user])


    const GetResults = async() => {
        setLoading(true);
        if (!user?.primaryEmailAddress?.emailAddress) return;
        
        const res = await convex.query(api.Result.GetResultsByUserEmail, {
            email: user.primaryEmailAddress.emailAddress
        })
        console.log("Interview Results:", res)
        setData(res)
        setLoading(false);
    }

    return (
        <div className='py-20 px-10 md:px-28 lg:px-44 xl:px-56'>
            <div className='flex justify-between items-center'>

                <div>
                    <h2 className='text-lg text-gray-500'>My dashboard</h2>
                    <h2 className='text-3xl font-bold'>Welcome, {user?.fullName}</h2>
                </div>
                <CreateInterviewDialog />
            </div>
            {loading && (
                <div className='flex justify-center items-center mt-20'>
                    <Loader2Icon className='animate-spin h-12 w-12' />
                </div>
            )}
            {!loading && data.length===0 && 
            <Emptystate/>
            }
            {!loading && data.length>0 &&
            <div className='mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {data.map((item,index)=> (
                    <div 
                        key={index} 
                        className='group relative border border-gray-700 rounded-xl p-6 hover:shadow-2xl hover:border-gray-500 transition-all duration-300 cursor-pointer bg-gradient-to-br from-gray-900 to-gray-800 overflow-hidden'
                        onClick={()=> window.location.href=`/interview/${item._id}/result`}
                    >
                       
                        <div className='absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gray-700/20 to-gray-600/20 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500'></div>
                        
                     
                        <div className='relative flex justify-between items-start mb-4'>
                            <div>
                                <h3 className='text-sm text-gray-300 font-medium'>Final Score</h3>
                                <p className='text-3xl font-bold text-white mt-1'>{item.finalScore ?? 0}<span className='text-lg text-gray-400'>/20</span></p>
                            </div>
                            <div className='bg-gray-700/50 text-gray-200 px-3 py-1 rounded-full text-xs font-semibold'>
                                #{index + 1}
                            </div>
                        </div>

                     
                        <div className='relative mb-4'>
                            <h3 className='text-xl font-bold text-white mb-1 group-hover:text-gray-200 transition-colors'>
                                Interview Result
                            </h3>
                            <div className='h-1 w-16 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full'></div>
                        </div>

                       
                        <div className='relative space-y-3'>
                           
                            <div className='flex gap-3'>
                                <div className='flex-shrink-0 w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center'>
                                    <svg className='w-5 h-5 text-green-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
                                    </svg>
                                </div>
                                <div className='flex-1'>
                                    <p className='text-xs text-gray-300 font-medium mb-1'>Strengths</p>
                                    <p className='text-sm text-gray-200 line-clamp-2'>
                                        {typeof item.strengths === 'string' ? item.strengths : 'Not evaluated yet'}
                                    </p>
                                </div>
                            </div>

                        
                            <div className='flex gap-3'>
                                <div className='flex-shrink-0 w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center'>
                                    <svg className='w-5 h-5 text-orange-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' />
                                    </svg>
                                </div>
                                <div className='flex-1'>
                                    <p className='text-xs text-gray-300 font-medium mb-1'>Areas to Improve</p>
                                    <p className='text-sm text-gray-200 line-clamp-2'>
                                        {typeof item.weakness === 'string' ? item.weakness : 'Not evaluated yet'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        
                        <div className='relative mt-6 pt-4 border-t border-gray-700'>
                            <div className='flex items-center justify-between text-gray-300 group-hover:text-gray-200'>
                                <span className='text-sm font-semibold'>View Full Report</span>
                                <svg className='w-5 h-5 transform group-hover:translate-x-1 transition-transform' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 7l5 5m0 0l-5 5m5-5H6' />
                                </svg>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            }   
        </div>



    )
}

export default Dashboard