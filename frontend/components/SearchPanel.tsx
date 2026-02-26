'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Loader2, Image as ImageIcon, ExternalLink } from 'lucide-react'
import Image from 'next/image'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  imageUrl?: string
  products?: Product[]
  timestamp: Date
}

interface Product {
  id: string
  name: string
  price: number
  image: string
  url: string
  marketplace: string
  similarity?: number
  brand?: string
}

interface SearchPanelProps {
  initialPrompt?: string
  initialImage?: string
  onInitialSearch?: () => void
}

export default function SearchPanel({
  initialPrompt,
  initialImage,
  onInitialSearch,
}: SearchPanelProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const initialSearchDone = useRef(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSearch = async (prompt: string, imageUrl?: string) => {
    if (!prompt.trim() && !imageUrl && !selectedImage) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: prompt || 'Найти похожие товары',
      imageUrl: imageUrl || selectedImage || undefined,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setSelectedImage(null)
    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append('prompt', prompt || '')
      if (imageUrl) {
        formData.append('imageUrl', imageUrl)
      } else if (selectedImage && selectedImage.startsWith('data:')) {
        const response = await fetch(selectedImage)
        const blob = await response.blob()
        formData.append('image', blob)
      }

      const searchResponse = await fetch('/api/marketplace-search', {
        method: 'POST',
        body: formData,
      })

      const data = await searchResponse.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message || `Найдено ${data.products?.length || 0} товаров на маркетплейсах`,
        products: data.products || [],
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
      onInitialSearch?.()
    } catch (error) {
      console.error('Search error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Произошла ошибка при поиске. Попробуйте еще раз.',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if ((initialPrompt || initialImage) && !initialSearchDone.current) {
      initialSearchDone.current = true
      const prompt = initialPrompt || 'Найти похожие товары'
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: prompt,
        imageUrl: initialImage,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, userMessage])
      setInput('')
      setIsLoading(true)

      const formData = new FormData()
      formData.append('prompt', prompt)
      if (initialImage) formData.append('imageUrl', initialImage)

      fetch('/api/marketplace-search', { method: 'POST', body: formData })
        .then((res) => res.json())
        .then((data) => {
          setMessages((prev) => [
            ...prev,
            {
              id: (Date.now() + 1).toString(),
              role: 'assistant',
              content: data.message || `Найдено ${data.products?.length || 0} товаров`,
              products: data.products || [],
              timestamp: new Date(),
            },
          ])
          onInitialSearch?.()
        })
        .catch(() => {
          setMessages((prev) => [
            ...prev,
            {
              id: (Date.now() + 1).toString(),
              role: 'assistant',
              content: 'Ошибка поиска. Попробуйте еще раз.',
              timestamp: new Date(),
            },
          ])
        })
        .finally(() => setIsLoading(false))
    }
  }, [initialPrompt, initialImage])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setSelectedImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() || selectedImage) {
      handleSearch(input, selectedImage || undefined)
    }
  }

  return (
    <section className="max-w-4xl mx-auto">
      <h2 className="text-xl font-bold text-charcoal mb-4">Поиск по маркетплейсам</h2>

      {/* Сообщения и результаты */}
      <div className="bg-white rounded-2xl editorial-shadow overflow-hidden flex flex-col min-h-[400px] max-h-[60vh]">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && !isLoading && (
            <p className="text-gray-500 text-center py-8">
              Введите запрос выше или прикрепите картинку — результаты появятся здесь.
            </p>
          )}

          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-4 ${
                    message.role === 'user'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-charcoal'
                  }`}
                >
                  {message.imageUrl && (
                    <div className="relative w-32 h-32 rounded-lg overflow-hidden mb-2">
                      <Image
                        src={message.imageUrl}
                        alt="User image"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <p className="text-sm">{message.content}</p>

                  {message.products && message.products.length > 0 && (
                    <div className="mt-4 space-y-3">
                      {message.products.map((product) => (
                        <div
                          key={product.id}
                          className="bg-white rounded-lg p-3 flex gap-3 text-charcoal"
                        >
                          <div className="relative w-20 h-20 rounded overflow-hidden flex-shrink-0">
                            <Image
                              src={product.image}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">{product.name}</h4>
                            {product.brand && (
                              <p className="text-xs text-gray-500">{product.brand}</p>
                            )}
                            <p className="text-lg font-bold text-primary-600 mt-1">
                              {product.price.toLocaleString('ru-RU')} ₽
                            </p>
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              <span className="text-xs px-2 py-1 bg-gray-200 rounded">
                                {product.marketplace}
                              </span>
                              {product.similarity != null && (
                                <span className="text-xs text-gray-500">
                                  {Math.round(product.similarity * 100)}% совпадение
                                </span>
                              )}
                            </div>
                          </div>
                          <a
                            href={product.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-shrink-0 p-2 hover:bg-gray-100 rounded transition-colors"
                          >
                            <ExternalLink className="w-5 h-5" />
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-2xl p-4">
                <Loader2 className="w-5 h-5 animate-spin text-primary-600" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Поле ввода — на том же экране */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
          {selectedImage && (
            <div className="relative w-20 h-20 rounded-lg overflow-hidden mb-2 inline-block">
              <Image
                src={selectedImage}
                alt="Selected"
                width={80}
                height={80}
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => setSelectedImage(null)}
                className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white"
              >
                ×
              </button>
            </div>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Опишите образ или прикрепите картинку..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <label className="cursor-pointer p-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-gray-400" />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
            <button
              type="submit"
              disabled={isLoading || (!input.trim() && !selectedImage)}
              className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}
