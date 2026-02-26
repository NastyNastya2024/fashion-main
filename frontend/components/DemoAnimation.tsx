'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const PLACEHOLDER_IMG =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="400"%3E%3Crect fill="%23f3f4f6" width="300" height="400"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-size="16"%3EНет фото%3C/text%3E%3C/svg%3E'

const DRESS_IMAGES = [
  'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=533&fit=crop',
  'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=400&h=533&fit=crop',
  'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&h=533&fit=crop',
]

type DemoMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
  products?: { id: string; name: string; price: number; image: string; url: string; marketplace: string }[]
  quickReplies?: { label: string; action: string }[]
}

const DEMO_SEQUENCE: { delay: number; message: DemoMessage }[] = [
  { delay: 2200, message: { id: '1', role: 'user', content: 'Хочу вечернее платье' } },
  {
    delay: 800,
    message: {
      id: '2',
      role: 'assistant',
      content: 'Понял! Уточни ценовой сегмент:',
      quickReplies: [
        { label: 'До 10 000 ₽', action: 'budget' },
        { label: '10 000 – 30 000 ₽', action: 'mid' },
        { label: '30 000 – 50 000 ₽', action: 'premium_mid' },
        { label: 'Премиум 50 000+ ₽', action: 'premium' },
      ],
    },
  },
  { delay: 2800, message: { id: '3', role: 'user', content: '10 000 – 30 000 ₽' } },
  {
    delay: 800,
    message: {
      id: '4',
      role: 'assistant',
      content: 'Повод или тип образа?',
      quickReplies: [
        { label: 'Повседневная одежда', action: 'casual' },
        { label: 'Вечеринка / выход', action: 'party' },
        { label: 'Торжество / свадьба', action: 'formal' },
      ],
    },
  },
  { delay: 2600, message: { id: '5', role: 'user', content: 'Вечеринка / выход' } },
  {
    delay: 1400,
    message: {
      id: '6',
      role: 'assistant',
      content: 'Найдено 3 товара. Посмотри, есть ли то что искал.',
      products: [
        { id: 'p1', name: 'Элегантное вечернее платье', price: 18900, image: DRESS_IMAGES[0], url: '#', marketplace: 'Lamoda' },
        { id: 'p2', name: 'Стильное платье для вечера', price: 24500, image: DRESS_IMAGES[1], url: '#', marketplace: 'Lamoda' },
        { id: 'p3', name: 'Классическое платье', price: 15900, image: DRESS_IMAGES[2], url: '#', marketplace: 'Wildberries' },
      ],
    },
  },
  {
    delay: 600,
    message: {
      id: '7',
      role: 'assistant',
      content: 'Нашёл ли ты то, что хотел?',
      quickReplies: [
        { label: 'Да, нашёл', action: 'yes' },
        { label: 'Нет, не то', action: 'no' },
      ],
    },
  },
]

export default function DemoAnimation() {
  const [messages, setMessages] = useState<DemoMessage[]>([])
  const [showEmpty, setShowEmpty] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [replayKey, setReplayKey] = useState(0)
  const stepIndex = useRef(0)
  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([])

  const clearTimeouts = useCallback(() => {
    timeouts.current.forEach((t) => clearTimeout(t))
    timeouts.current = []
  }, [])

  const runSequence = useCallback(() => {
    clearTimeouts()
    setMessages([])
    setShowEmpty(true)
    setIsLoading(false)
    stepIndex.current = 0

    const schedule = (delay: number, fn: () => void) => {
      const t = setTimeout(fn, delay)
      timeouts.current.push(t)
    }

    schedule(2200, () => {
      setShowEmpty(false)
      setMessages((m) => [...m, DEMO_SEQUENCE[0].message])
    })

    let acc = 2200
    for (let i = 1; i < DEMO_SEQUENCE.length; i++) {
      acc += DEMO_SEQUENCE[i].delay
      const idx = i
      schedule(acc, () => {
        if (idx === 5) setIsLoading(true)
        if (idx === 6) setIsLoading(false)
        setMessages((m) => [...m, DEMO_SEQUENCE[idx].message])
      })
    }
  }, [clearTimeouts])

  useEffect(() => {
    runSequence()
    return () => clearTimeouts()
  }, [replayKey, runSequence, clearTimeouts])

  const handleReplay = () => {
    setReplayKey((k) => k + 1)
  }

  const basePath = (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_BASE_PATH) || ''
  const figurineLeft = `${basePath}/images/figurine-left.png`
  const figurineRight = `${basePath}/images/figurine-right.png`

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <header className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-gray-200/80">
        <h1 className="text-lg font-semibold text-gray-900">StyleGenie</h1>
        <nav className="flex items-center gap-4 text-sm text-gray-600">
          <a href="#" className="hover:text-gray-900">
            Маркетплейсы
          </a>
          <a href="#" className="hover:text-gray-900">
            Мои образы
          </a>
        </nav>
      </header>

      <div
        className={
          showEmpty && messages.length === 0
            ? 'flex-1 flex flex-col justify-center items-center px-4 py-8'
            : 'flex-1 flex flex-col min-h-0'
        }
      >
        <AnimatePresence mode="wait">
          {showEmpty && messages.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-3xl mx-auto text-center relative"
            >
              <div
                className="absolute left-[-6%] right-[-6%] top-1/2 -translate-y-1/2 flex justify-between items-end pointer-events-none z-0 opacity-100"
                aria-hidden
              >
                <motion.div
                  initial={{ opacity: 0, x: -80 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                  className="w-[273px] md:w-[364px] flex-shrink-0"
                >
                  <img src={figurineLeft} alt="" className="w-full h-auto block" />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: 80 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
                  className="w-[273px] md:w-[364px] flex-shrink-0"
                >
                  <img src={figurineRight} alt="" className="w-full h-auto block" />
                </motion.div>
              </div>
              <div className="relative z-10">
                <h2 className="text-2xl md:text-3xl font-medium text-gray-800 mb-8">
                  Опиши, какой образ ты хочешь найти
                </h2>
                <div className="w-full max-w-2xl mx-auto h-12 rounded-2xl border border-gray-200 bg-gray-50 flex items-center px-4 text-gray-400 text-[15px]">
                  Демо: сценарий запустится автоматически…
                </div>
              </div>
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
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-5 py-4 ${
                          message.role === 'user'
                            ? 'bg-gray-900 text-white'
                            : 'bg-gray-100 text-gray-900 border border-gray-200 shadow-sm'
                        }`}
                      >
                        <p className="text-[15px] font-medium leading-snug">{message.content}</p>
                        {message.products && message.products.length > 0 && (
                          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {message.products.map((product) => (
                              <div
                                key={product.id}
                                className="rounded-2xl overflow-hidden border border-gray-200 bg-white"
                              >
                                <div className="aspect-[3/4] w-full relative">
                                  <img
                                    src={product.image}
                                    alt=""
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.currentTarget.onerror = null
                                      e.currentTarget.src = PLACEHOLDER_IMG
                                    }}
                                  />
                                </div>
                                <div className="p-3 border-t border-gray-200">
                                  <h4 className="font-semibold text-gray-900 text-sm line-clamp-2">{product.name}</h4>
                                  <p className="text-base font-bold text-gray-900 mt-1">
                                    {product.price.toLocaleString('ru-RU')} ₽
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        {message.quickReplies && message.quickReplies.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {message.quickReplies.map((qr) => (
                              <span
                                key={qr.action}
                                className="px-3 py-2 rounded-xl bg-gray-900 text-white text-sm font-medium"
                              >
                                {qr.label}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="bg-gray-100 rounded-2xl px-4 py-3 border border-gray-200 shadow-sm">
                        <span className="inline-block w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                      </div>
                    </motion.div>
                  )}
                  <div id="messages-end" />
                </div>
              </div>

              <div className="flex-shrink-0 border-t border-gray-200/80 bg-white py-4 px-4 flex justify-center">
                <button
                  type="button"
                  onClick={handleReplay}
                  className="px-4 py-2 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                  Повторить демо
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <p className="flex-shrink-0 text-center text-xs text-gray-400 px-4 py-2">
        Демо-анимация. Полный поиск — в приложении с бэкендом.
      </p>
    </div>
  )
}
