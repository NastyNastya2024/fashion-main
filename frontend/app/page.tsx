'use client'

import { useState } from 'react'
import ChatView from '@/components/ChatView'

export default function Home() {
  const [searchKey, setSearchKey] = useState(0)
  const [initialPrompt, setInitialPrompt] = useState<string | undefined>()
  const [initialImage, setInitialImage] = useState<string | undefined>()

  return (
    <ChatView
      key={searchKey}
      initialPrompt={initialPrompt}
      initialImage={initialImage}
      onSearch={() => {}}
    />
  )
}
