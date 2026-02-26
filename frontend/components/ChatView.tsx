'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Loader2, Image as ImageIcon, ExternalLink } from 'lucide-react'
import Image from 'next/image'

type Step =
  | 'welcome'           // Опиши образ
  | 'clarify_price'     // Ценовой сегмент
  | 'clarify_occasion'  // Повод
  | 'searching'         // Ищем
  | 'results'           // Показали результаты
  | 'follow_up'         // Нашел?
  | 'not_found'         // Предложение: мастер / генерация

interface Product {
  id: string
  name: string
  price: number
  image: string
  images?: string[]
  url: string
  marketplace: string
  similarity?: number
  brand?: string
}

interface Master {
  id: string
  name: string
  image: string
  priceFrom: number
  priceTo?: number
  url?: string
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  imageUrl?: string
  products?: Product[]
  masters?: Master[]
  quickReplies?: { label: string; action: string }[]
  timestamp: Date
}

const MOCK_MASTERS: Master[] = [
  {
    id: 'm1',
    name: 'Ателье «Подиум»',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=533&fit=crop',
    priceFrom: 15000,
    priceTo: 45000,
  },
  {
    id: 'm2',
    name: 'Мастерская Ольги К.',
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=533&fit=crop',
    priceFrom: 8000,
    priceTo: 25000,
  },
  {
    id: 'm3',
    name: 'Ателье «Ткани и форма»',
    image: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400&h=533&fit=crop',
    priceFrom: 25000,
    priceTo: 80000,
  },
]

interface ChatViewProps {
  initialPrompt?: string
  initialImage?: string
  onSearch?: () => void
}

const PRICE_OPTIONS = [
  { value: 'budget', label: 'До 10 000 ₽' },
  { value: 'mid', label: '10 000 – 30 000 ₽' },
  { value: 'premium_mid', label: '30 000 – 50 000 ₽' },
  { value: 'premium', label: 'Премиум 50 000+ ₽' },
  { value: 'discounts', label: 'Искать скидки' },
]

const OCCASION_OPTIONS = [
  { value: 'casual', label: 'Повседневная одежда' },
  { value: 'office', label: 'Офис / деловой стиль' },
  { value: 'party', label: 'Вечеринка / выход' },
  { value: 'formal', label: 'Торжество / свадьба' },
  { value: 'any', label: 'Не важно' },
]

export default function ChatView({
  initialPrompt,
  initialImage,
  onSearch,
}: ChatViewProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [step, setStep] = useState<Step>('welcome')
  const [userDescription, setUserDescription] = useState('')
  const [userImageUrl, setUserImageUrl] = useState<string | undefined>()
  const [userFilters, setUserFilters] = useState<{ priceSegment?: string; occasion?: string }>({})
  const initialSearchDone = useRef(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const hasContent = messages.length > 0 || isLoading

  const addAssistantMessage = (content: string, opts?: { products?: Product[]; masters?: Master[]; quickReplies?: { label: string; action: string }[] }) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        role: 'assistant',
        content,
        products: opts?.products,
        masters: opts?.masters,
        quickReplies: opts?.quickReplies,
        timestamp: new Date(),
      },
    ])
  }

  const runSearch = async (prompt: string, imageUrl?: string) => {
    setInput('')
    setSelectedImage(null)
    setIsLoading(true)
    setStep('searching')

    try {
      const formData = new FormData()
      formData.append('prompt', prompt)
      if (imageUrl) formData.append('imageUrl', imageUrl)
      else if (selectedImage && selectedImage.startsWith('data:')) {
        const response = await fetch(selectedImage)
        const blob = await response.blob()
        formData.append('image', blob)
      }
      if (userFilters.priceSegment) formData.append('priceSegment', userFilters.priceSegment)
      if (userFilters.occasion) formData.append('occasion', userFilters.occasion)

      const searchResponse = await fetch('/api/marketplace-search', { method: 'POST', body: formData })
      const data = await searchResponse.json()
      const products = data.products || []

      addAssistantMessage(
        data.message || `Найдено ${products.length} товаров. Посмотри, есть ли то что искал.`,
        { products }
      )
      setStep('results')
      addAssistantMessage('Нашёл ли ты то, что хотел?', {
        quickReplies: [
          { label: 'Да, нашёл', action: 'yes' },
          { label: 'Нет, не то', action: 'no' },
        ],
      })
      setStep('follow_up')
      onSearch?.()
    } catch (error) {
      console.error('Search error:', error)
      addAssistantMessage('Ошибка поиска. Попробуй ещё раз описать образ.')
      setStep('clarify_occasion')
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickReply = (action: string) => {
    if (action === 'yes') {
      addAssistantMessage('Отлично! Если захочешь подобрать ещё образ — просто опиши, что ищешь.', {
        quickReplies: [{ label: 'Новый поиск', action: 'new_search' }],
      })
      setStep('welcome')
      setUserDescription('')
      setUserFilters({})
      return
    }
    if (action === 'new_search') {
      addAssistantMessage('Опиши, какой образ хочешь найти — начнём заново.')
      setStep('welcome')
      setUserDescription('')
      setUserImageUrl(undefined)
      setUserFilters({})
      return
    }
    if (action === 'no') {
      setStep('not_found')
      addAssistantMessage('Тогда можем помочь так:', {
        quickReplies: [
          { label: 'Найти мастера по пошиву', action: 'find_master' },
          { label: 'Сгенерировать картинку образа', action: 'generate_image' },
          { label: 'Новый поиск', action: 'new_search' },
        ],
      })
      return
    }
    if (action === 'find_master') {
      addAssistantMessage('Подбор ателье под твой образ и бюджет. Примерная цена изделия:', { masters: MOCK_MASTERS })
      setStep('welcome')
      setUserDescription('')
      setUserImageUrl(undefined)
      setUserFilters({})
      return
    }
    if (action === 'generate_image') {
      addAssistantMessage('Генерация образа по описанию в разработке. Скоро можно будет получить картинку платья или образа по твоим пожеланиям.')
      setStep('welcome')
      setUserDescription('')
      setUserImageUrl(undefined)
      setUserFilters({})
      return
    }

    // Уточнение: ценовой сегмент
    if (PRICE_OPTIONS.some((o) => o.value === action)) {
      setUserFilters((f) => ({ ...f, priceSegment: action }))
      setStep('clarify_occasion')
      addAssistantMessage('Повод или тип образа?', {
        quickReplies: OCCASION_OPTIONS.map((o) => ({ label: o.label, action: o.value })),
      })
      return
    }

    // Уточнение: повод
    if (OCCASION_OPTIONS.some((o) => o.value === action)) {
      setUserFilters((f) => ({ ...f, occasion: action }))
      runSearch(userDescription, userImageUrl)
      return
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const text = input.trim()
    if (!text && !selectedImage) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text || 'Вот картинка',
      imageUrl: selectedImage || undefined,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])

    if (step === 'welcome') {
      setUserDescription(text || 'по картинке')
      if (selectedImage) setUserImageUrl(selectedImage)
      setInput('')
      setSelectedImage(null)
      setStep('clarify_price')
      addAssistantMessage('Понял! Уточни ценовой сегмент:', {
        quickReplies: PRICE_OPTIONS.map((o) => ({ label: o.label, action: o.value })),
      })
      return
    }

    if (step === 'clarify_price') {
      const priceOption = PRICE_OPTIONS.find((o) => o.label === text || o.value === text)
      if (priceOption) {
        setUserFilters((f) => ({ ...f, priceSegment: priceOption.value }))
        setStep('clarify_occasion')
        addAssistantMessage('Повод или тип образа?', {
          quickReplies: OCCASION_OPTIONS.map((o) => ({ label: o.label, action: o.value })),
        })
      } else {
        setUserFilters((f) => ({ ...f, priceSegment: 'mid' }))
        setStep('clarify_occasion')
        addAssistantMessage('Повод или тип образа?', {
          quickReplies: OCCASION_OPTIONS.map((o) => ({ label: o.label, action: o.value })),
        })
      }
      setInput('')
      return
    }

    if (step === 'clarify_occasion') {
      const occasionOption = OCCASION_OPTIONS.find((o) => o.label === text || o.value === text)
      if (occasionOption) setUserFilters((f) => ({ ...f, occasion: occasionOption.value }))
      runSearch(userDescription, userImageUrl || selectedImage || undefined)
      return
    }

    setInput('')
    setSelectedImage(null)
    runSearch(text, selectedImage || undefined)
  }

  useEffect(() => {
    if ((initialPrompt || initialImage) && !initialSearchDone.current) {
      initialSearchDone.current = true
      setUserDescription(initialPrompt || 'по картинке')
      setStep('clarify_price')
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'user',
          content: initialPrompt || 'Найти по картинке',
          imageUrl: initialImage,
          timestamp: new Date(),
        },
      ])
      addAssistantMessage('Уточни ценовой сегмент:', {
        quickReplies: PRICE_OPTIONS.map((o) => ({ label: o.label, action: o.value })),
      })
    }
  }, [initialPrompt, initialImage])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setSelectedImage(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const inputBar = (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto flex flex-col items-center">
      {selectedImage && (
        <div className="relative w-16 h-16 rounded-lg overflow-hidden mb-2 inline-block">
          <Image src={selectedImage} alt="" width={64} height={64} className="object-cover" />
          <button
            type="button"
            onClick={() => setSelectedImage(null)}
            className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-gray-700 rounded-full flex items-center justify-center text-white text-xs"
          >
            ×
          </button>
        </div>
      )}
      <div className="w-full flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-[0_0_0_1px_rgba(0,0,0,0.05)] hover:border-gray-300 transition-colors">
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            step === 'welcome'
              ? 'Опиши образ или прикрепи картинку...'
              : step === 'clarify_price'
                ? 'Выбери цену выше или напиши свой вариант'
                : step === 'clarify_occasion'
                  ? 'Выбери повод выше или напиши'
                  : 'Напиши сообщение...'
          }
          className="flex-1 min-w-0 bg-transparent text-gray-900 placeholder:text-gray-400 text-[15px] outline-none"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex-shrink-0 p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ImageIcon className="w-5 h-5" />
        </button>
        <button
          type="submit"
          disabled={isLoading || (!input.trim() && !selectedImage)}
          className="flex-shrink-0 w-9 h-9 rounded-full disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-opacity hover:opacity-90 border-0"
          style={{ backgroundColor: '#000000' }}
        >
          <Send className="w-4 h-4 shrink-0" stroke="#ffffff" strokeWidth={2} />
        </button>
      </div>
    </form>
  )

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <header className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-gray-200/80">
        <h1 className="text-lg font-semibold text-gray-900">StyleGenie</h1>
        <nav className="flex items-center gap-4 text-sm text-gray-600">
          <a href="#" className="hover:text-gray-900">Маркетплейсы</a>
          <a href="#" className="hover:text-gray-900">Мои образы</a>
        </nav>
      </header>

      <div
        className={
          hasContent
            ? 'flex-1 flex flex-col min-h-0'
            : 'flex-1 flex flex-col justify-center items-center px-4 py-8'
        }
      >
        <AnimatePresence mode="wait">
          {!hasContent ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-3xl mx-auto text-center"
            >
              <h2 className="text-2xl md:text-3xl font-medium text-gray-800 mb-8">
                Опиши, какой образ ты хочешь найти
              </h2>
              {inputBar}
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col min-h-0"
            >
              <div className="flex-1 overflow-y-auto">
                <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-5 py-4 ${
                          message.role === 'user'
                            ? 'bg-gray-900 text-white'
                            : 'bg-gray-100 text-gray-900 border border-gray-200 shadow-sm'
                        }`}
                      >
                        {message.imageUrl && (
                          <div className="relative w-28 h-28 rounded-lg overflow-hidden mb-2">
                            <Image src={message.imageUrl} alt="" fill className="object-cover" />
                          </div>
                        )}
                        <p className="text-[15px] font-medium leading-snug text-gray-900">{message.content}</p>

                        {message.products && message.products.length > 0 && (() => {
                          const byMarketplace = message.products.reduce<Record<string, typeof message.products>>((acc, p) => {
                            const name = p.marketplace || 'Другие'
                            if (!acc[name]) acc[name] = []
                            acc[name].push(p)
                            return acc
                          }, {})
                          return (
                            <div className="mt-4 space-y-6">
                              {Object.entries(byMarketplace).map(([marketplaceName, products], groupIndex) => (
                                <div key={marketplaceName}>
                                  {groupIndex > 0 && (
                                    <div className="border-t border-gray-300 my-6" />
                                  )}
                                  <h4 className="text-sm font-semibold text-gray-800 mb-3">{marketplaceName}</h4>
                                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {products.map((product) => {
                                      const imgs = product.images && product.images.length > 0 ? product.images : [product.image]
                                      return (
                                        <div
                                          key={product.id}
                                          className="rounded-2xl overflow-hidden border border-gray-200"
                                        >
                                          <div className="relative w-full aspect-[3/4]">
                                    <img
                                      src={imgs[0]}
                                      alt=""
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        const t = e.currentTarget
                                        t.onerror = null
                                        t.src =
                                          'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="400"%3E%3Crect fill="%23f3f4f6" width="300" height="400"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-size="16"%3EНет фото%3C/text%3E%3C/svg%3E'
                                      }}
                                    />
                                    {product.similarity != null && (
                                      <span className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-black/60 text-white text-xs">
                                        {Math.round(product.similarity * 100)}%
                                      </span>
                                    )}
                                    <a
                                      href={product.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="absolute bottom-2 right-2 w-9 h-9 rounded-full bg-white/90 shadow flex items-center justify-center hover:bg-white transition-colors"
                                    >
                                      <ExternalLink className="w-4 h-4 text-gray-700" />
                                    </a>
                                  </div>
                                  {/* Миниатюры без серого фона */}
                                  {imgs.length > 1 && (
                                    <div className="flex gap-1.5 p-1.5 border-t border-gray-200 overflow-x-auto">
                                      {imgs.slice(0, 5).map((src, i) => (
                                        <div
                                          key={i}
                                          className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border border-gray-200"
                                        >
                                          <img
                                            src={src}
                                            alt=""
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                              e.currentTarget.onerror = null
                                              e.currentTarget.src =
                                                'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="48" height="48"%3E%3Crect fill="%23f3f4f6" width="48" height="48"/%3E%3C/svg%3E'
                                            }}
                                          />
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                  <div className="p-3 border-t border-gray-200 bg-white">
                                    <h4 className="font-semibold text-gray-900 text-sm line-clamp-2">{product.name}</h4>
                                    {product.brand && (
                                      <p className="text-xs text-gray-500 mt-0.5">{product.brand}</p>
                                    )}
                                    <p className="text-base font-bold text-gray-900 mt-1">
                                      {product.price.toLocaleString('ru-RU')} ₽
                                    </p>
                                  </div>
                                        </div>
                                      )
                                    })}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )
                        })()}

                        {message.masters && message.masters.length > 0 && (
                          <div className="mt-4 space-y-4">
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                              {message.masters.map((master) => (
                                <div
                                  key={master.id}
                                  className="rounded-2xl overflow-hidden border border-gray-200"
                                >
                                  <div className="relative w-full aspect-[3/4]">
                                    <img
                                      src={master.image}
                                      alt=""
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        const t = e.currentTarget
                                        t.onerror = null
                                        t.src =
                                          'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="400"%3E%3Crect fill="%23f3f4f6" width="300" height="400"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-size="16"%3EНет фото%3C/text%3E%3C/svg%3E'
                                      }}
                                    />
                                  </div>
                                  <div className="p-3 border-t border-gray-200 bg-white">
                                    <h4 className="font-semibold text-gray-900 text-sm line-clamp-2">{master.name}</h4>
                                    <p className="text-sm text-gray-600 mt-1">
                                      {master.priceTo
                                        ? `от ${master.priceFrom.toLocaleString('ru-RU')} – ${master.priceTo.toLocaleString('ru-RU')} ₽`
                                        : `от ${master.priceFrom.toLocaleString('ru-RU')} ₽`}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {message.quickReplies && message.quickReplies.length > 0 && (() => {
                          const discountOption = message.quickReplies.find((qr) => qr.action === 'discounts')
                          const restOptions = message.quickReplies.filter((qr) => qr.action !== 'discounts')
                          return (
                            <div className="mt-3 space-y-3">
                              <div className="flex flex-wrap gap-2">
                                {restOptions.map((qr) => (
                                  <button
                                    key={qr.action}
                                    type="button"
                                    onClick={() => handleQuickReply(qr.action)}
                                    className="px-3 py-2 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors"
                                  >
                                    {qr.label}
                                  </button>
                                ))}
                              </div>
                              {discountOption && (
                                <div className="pt-2 border-t border-gray-300">
                                  <button
                                    type="button"
                                    onClick={() => handleQuickReply(discountOption.action)}
                                    className="px-4 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors w-full sm:w-auto"
                                  >
                                    {discountOption.label}
                                  </button>
                                </div>
                              )}
                            </div>
                          )
                        })()}
                      </div>
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 rounded-2xl px-4 py-3 border border-gray-200 shadow-sm">
                        <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              <div className="flex-shrink-0 border-t border-gray-200/80 bg-white py-4 px-4">
                {inputBar}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <p className="flex-shrink-0 text-center text-xs text-gray-400 px-4 py-2">
        StyleGenie может показывать товары с маркетплейсов. Проверяйте актуальность на сайтах продавцов.
      </p>
    </div>
  )
}
