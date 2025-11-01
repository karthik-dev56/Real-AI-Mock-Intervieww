import React from 'react'
import Appheader from '@/app/(routes)/dashboard/_components/Appheader'

function InterviewLayout({ children }: any) {
    return (
        <div>
            <Appheader />
            {children}
        </div>
    )
}

export default InterviewLayout