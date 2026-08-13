"use client"

import dynamic from 'next/dynamic'
import React from 'react'

const Iridescence = dynamic(() => import('./Iridescence'), { ssr: false })

export default function IridescenceClient(props: any) {
  return <Iridescence {...props} />
}
