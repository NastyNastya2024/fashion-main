'use client'

import { motion } from 'framer-motion'
import { ExternalLink, Star, ShoppingBag } from 'lucide-react'
import Image from 'next/image'

interface Product {
  id: string
  name: string
  price: number
  image: string
  url: string
  brand?: string
  rating?: number
  similarity?: number
}

interface ProductResultsProps {
  products: Product[]
}

export default function ProductResults({ products }: ProductResultsProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold font-serif">
        Похожие товары ({products.length})
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-2xl overflow-hidden editorial-shadow group"
          >
            <div className="aspect-square relative overflow-hidden">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              {product.similarity && (
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium">
                  {Math.round(product.similarity * 100)}% совпадение
                </div>
              )}
            </div>
            <div className="p-5 space-y-3">
              {product.brand && (
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  {product.brand}
                </div>
              )}
              <h4 className="font-semibold text-lg line-clamp-2">{product.name}</h4>
              {product.rating && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm text-gray-600">{product.rating.toFixed(1)}</span>
                </div>
              )}
              <div className="flex items-center justify-between pt-2">
                <div className="text-2xl font-bold text-charcoal">
                  {product.price.toLocaleString('ru-RU')} ₽
                </div>
                <a
                  href={product.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-primary-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-primary-700 transition-colors"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Купить
                </a>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
