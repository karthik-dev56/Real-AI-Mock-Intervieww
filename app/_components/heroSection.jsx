"use client"
import React from 'react'
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
function HeroSection() {
  return (
    <div className="relative mx-auto my-6 flex min-h-[85vh] max-w-7xl flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-y-0 left-0 h-full w-px bg-gradient-to-b from-transparent via-neutral-300 to-transparent dark:via-neutral-700">
        <div className="absolute top-0 h-40 w-px bg-gradient-to-b from-transparent via-blue-500 to-transparent animate-pulse" />
      </div>
      <div className="absolute inset-y-0 right-0 h-full w-px bg-gradient-to-b from-transparent via-neutral-300 to-transparent dark:via-neutral-700">
        <div className="absolute h-40 w-px bg-gradient-to-b from-transparent via-blue-500 to-transparent animate-pulse" />
      </div>
      <div className="absolute inset-x-0 bottom-0 h-px w-full bg-gradient-to-r from-transparent via-neutral-300 to-transparent dark:via-neutral-700">
        <div className="absolute mx-auto h-px w-40 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-pulse" />
      </div>
      <div className="px-4 py-6 md:py-8">
        <h1 className="relative z-10 mx-auto max-w-4xl text-center text-3xl font-extrabold tracking-tight text-gray-900 md:text-5xl lg:text-7xl dark:text-white">
          {"Ace Your Next Interview with AI"
            .split(" ")
            .map((word, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, filter: "blur(4px)", y: 10 }}
                animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.1,
                  ease: "easeInOut",
                }}
                className="mr-2 inline-block hover:scale-105 transition-transform duration-200"
              >
                {word}
              </motion.span>
            ))}
        </h1>
        <motion.p
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            duration: 0.3,
            delay: 0.8,
          }}
          className="relative z-10 mx-auto max-w-2xl py-4 text-center text-base font-medium leading-relaxed text-neutral-700 md:text-lg dark:text-neutral-300"
        >
          Practice with <span className="font-bold text-blue-700 underline decoration-blue-500/40 decoration-2 underline-offset-2 dark:text-blue-400">AI-powered mock interviews</span> tailored to your dream job. Get <span className="font-bold text-purple-700 underline decoration-purple-500/40 decoration-2 underline-offset-2 dark:text-purple-400">real-time feedback</span>, 
          improve your responses, and build confidence to <span className="font-bold text-green-700 underline decoration-green-500/40 decoration-2 underline-offset-2 dark:text-green-400">crack any interview</span> with our cutting-edge platform.
        </motion.p>
        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            duration: 0.3,
            delay: 1,
          }}
          className="relative z-10 mt-8 flex flex-wrap items-center justify-center gap-4"
        >
            <Link href="/sign-in">
          <Button size={'lg'} className="group relative w-60 overflow-hidden rounded-xl bg-gradient-to-r from-black via-gray-900 to-black px-8 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl  dark:to-white dark:text-black">
            <span className="relative z-10">Explore Now</span>
            <div className="absolute inset-0 -z-10" />
          </Button>
          </Link>
          <Link href="https://www.linkedin.com/in/karthik-kumar-16ba78339/" target='_blank'>
          <Button className="w-60 transform rounded-xl border-2 border-gray-300 bg-white px-8 py-3 font-semibold text-black shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-gray-400 hover:bg-gray-50 hover:shadow-xl dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:hover:border-gray-500 dark:hover:bg-gray-800">
            Contact Support
          </Button>
          </Link>
        </motion.div>
        <motion.div
          initial={{
            opacity: 0,
            y: 10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.3,
            delay: 1.2,
          }}
          className="group relative z-10 mt-10 rounded-2xl border border-neutral-300/50 bg-gradient-to-br from-white via-neutral-50 to-neutral-100 p-4 shadow-2xl transition-all duration-500 hover:shadow-3xl hover:shadow-blue-500/10 dark:border-neutral-700/50 dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-950"
        >
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-20" />
          <div className="relative w-full overflow-hidden rounded-xl border-2 border-neutral-400/60 shadow-xl transition-all duration-300 group-hover:border-neutral-500/80 dark:border-neutral-600/60 dark:group-hover:border-neutral-500/80 bg-gradient-to-br from-gray-900 to-black">
            <img
              src="/genert-ai.png"
              alt="AI Mock Interview - Professional interview preparation with artificial intelligence"
              className="aspect-video h-auto w-full object-cover object-center opacity-95 transition-all duration-500 group-hover:scale-[1.02] group-hover:opacity-100"
              loading="lazy"
              height={600}
              width={1200}
            />
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default HeroSection;