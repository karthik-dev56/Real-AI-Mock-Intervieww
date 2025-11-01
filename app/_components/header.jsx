import React from 'react'
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
function Header() {
  return (
     <nav className="flex w-full items-center justify-between border-t border-b border-neutral-200 px-4 py-4 dark:border-neutral-800">
      <div className="flex items-center gap-3">
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
      <div className="flex items-center gap-5">
        <Link href="/sign-in">
          <Button className="w-24 transform rounded-lg bg-black px-6 py-2 font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-gray-800 md:w-32 dark:bg-white dark:text-black dark:hover:bg-gray-200">
            Login
          </Button>
        </Link>
        <Link href="/sign-up">
          <Button className="w-24 transform rounded-lg bg-black px-6 py-2 font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-gray-800 md:w-32 dark:bg-white dark:text-black dark:hover:bg-gray-200">
            Sign Up
          </Button>
        </Link>
      </div>
    </nav>
  )
}

export default Header