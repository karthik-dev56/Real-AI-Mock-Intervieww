import React from 'react'
import { PricingTable } from '@clerk/nextjs'
function UpgradePage() {
  return (
       <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1rem' }} className='flex flex-col items-center justify-center '>
        <h2 className='font-bold text-3xl mt-20 mb-10'>Upgrade to pro plan</h2>
      <PricingTable  />
    </div>
  )
}

export default UpgradePage