import React from 'react'
import Appheader from './_components/Appheader'

function DashboardLayout({children}:any) {
  return (
    <div>
        <Appheader />
      {children}
    </div>
  )
}

export default DashboardLayout