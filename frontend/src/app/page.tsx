'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Home() {
  return (
    <main className="w-full h-[100vh] bg-black">
      <MapMockup />
    </main>
  );
}
