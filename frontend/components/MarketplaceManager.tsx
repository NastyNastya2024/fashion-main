'use client'

import { useState, useEffect } from 'react'
import { Plus, X, Check, ExternalLink } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Marketplace {
  id: string
  name: string
  url: string
  enabled: boolean
}

export default function MarketplaceManager() {
  const [marketplaces, setMarketplaces] = useState<Marketplace[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [newMarketplace, setNewMarketplace] = useState({ name: '', url: '' })

  useEffect(() => {
    loadMarketplaces()
  }, [])

  const loadMarketplaces = async () => {
    try {
      const response = await fetch('/api/marketplace-search')
      const data = await response.json()
      setMarketplaces(data.marketplaces || [])
    } catch (error) {
      console.error('Error loading marketplaces:', error)
    }
  }

  const handleAddMarketplace = async () => {
    if (!newMarketplace.name.trim() || !newMarketplace.url.trim()) return

    try {
      const response = await fetch('/api/marketplaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMarketplace),
      })

      if (response.ok) {
        await loadMarketplaces()
        setNewMarketplace({ name: '', url: '' })
        setIsAdding(false)
      }
    } catch (error) {
      console.error('Error adding marketplace:', error)
      // Локальное добавление для демо
      const newMarketplaceData: Marketplace = {
        id: `custom-${Date.now()}`,
        name: newMarketplace.name,
        url: newMarketplace.url,
        enabled: true,
      }
      setMarketplaces([...marketplaces, newMarketplaceData])
      setNewMarketplace({ name: '', url: '' })
      setIsAdding(false)
    }
  }

  const toggleMarketplace = async (id: string) => {
    const updated = marketplaces.map((m) =>
      m.id === id ? { ...m, enabled: !m.enabled } : m
    )
    setMarketplaces(updated)

    try {
      await fetch('/api/marketplaces', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, enabled: !marketplaces.find((m) => m.id === id)?.enabled }),
      })
    } catch (error) {
      console.error('Error updating marketplace:', error)
    }
  }

  return (
    <div className="bg-white rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-charcoal">Маркетплейсы для поиска</h3>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Добавить
        </button>
      </div>

      <div className="space-y-2">
        {marketplaces.map((marketplace) => (
          <div
            key={marketplace.id}
            className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <button
                onClick={() => toggleMarketplace(marketplace.id)}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                  marketplace.enabled
                    ? 'bg-primary-600 border-primary-600'
                    : 'border-gray-300'
                }`}
              >
                {marketplace.enabled && <Check className="w-3 h-3 text-white" />}
              </button>
              <div>
                <p className="font-medium text-sm">{marketplace.name}</p>
                <a
                  href={marketplace.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-gray-500 hover:text-primary-600 flex items-center gap-1"
                >
                  {marketplace.url}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t pt-4 space-y-3"
          >
            <input
              type="text"
              placeholder="Название маркетплейса"
              value={newMarketplace.name}
              onChange={(e) => setNewMarketplace({ ...newMarketplace, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <input
              type="url"
              placeholder="URL (например, https://example.com)"
              value={newMarketplace.url}
              onChange={(e) => setNewMarketplace({ ...newMarketplace, url: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddMarketplace}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Добавить
              </button>
              <button
                onClick={() => {
                  setIsAdding(false)
                  setNewMarketplace({ name: '', url: '' })
                }}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                Отмена
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
