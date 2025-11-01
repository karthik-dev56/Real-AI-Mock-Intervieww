import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { UserButton } from '@clerk/nextjs'
import { li } from 'framer-motion/client'
function Appheader() {

    const MenuOption=[
        {
            name:'Dashboard',
            path:'/dashboard'
        },
        {
            name:'Upgrade',
            path:'/dashboard/upgrade'
        },
        {
            name:'How-it-works',
            path:'/how-it-works'
        },
    ]


  return (
    <nav className="flex w-full items-center border-t border-b border-neutral-200 px-4 py-4 dark:border-neutral-800">
            <div className="flex items-center gap-3 flex-1">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="40" height="40" rx="10" fill="black"/>
                    <path d="M20 8L12 14V20C12 25 16 28.8 20 30C24 28.8 28 25 28 20V14L20 8Z" stroke="white" strokeWidth="2" fill="none"/>
                    <circle cx="17" cy="19" r="1.5" fill="white"/>
                    <circle cx="23" cy="19" r="1.5" fill="white"/>
                    <path d="M17 23.5C17 23.5 18.5 25 20 25C21.5 25 23 23.5 23 23.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M14 16L11 13M26 16L29 13" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                    <rect x="1" y="1" width="38" height="38" rx="9" stroke="url(#borderGradient)" strokeWidth="2"/>
                    <defs>
                        <linearGradient id="borderGradient" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#3B82F6"/>
                            <stop offset="1" stopColor="#8B5CF6"/>
                        </linearGradient>
                    </defs>
                </svg>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    AI <span className="text-blue-600">Mock</span>Interview
                </h2>
            </div>
            <div className="flex-1 flex justify-center">
                <ul className='flex items-center gap-5'>{MenuOption.map((option,index)=>(
                    <Link key={index} href={option.path}>
                        <li className='text-lg hover:scale-105 transition-all cursor-pointer'>{option.name}</li>
                    </Link>
                ))}
                </ul>
            </div>
            <div className="flex-1 flex justify-end">
                <UserButton/>
            </div>
        </nav>
  )
}

export default Appheader