'use client'

import { motion } from 'framer-motion'
import { Star, MapPin, Phone, Mail, Scissors } from 'lucide-react'
import Image from 'next/image'

interface Atelier {
  id: string
  name: string
  location: string
  specialization: string[]
  priceRange: string
  rating: number
  portfolioImages: string[]
  contact?: {
    phone?: string
    email?: string
  }
}

interface AtelierResultsProps {
  ateliers: Atelier[]
}

export default function AtelierResults({ ateliers }: AtelierResultsProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold font-serif">
        Мастера и ателье ({ateliers.length})
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {ateliers.map((atelier, index) => (
          <motion.div
            key={atelier.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-2xl overflow-hidden editorial-shadow"
          >
            {/* Portfolio Images */}
            <div className="grid grid-cols-3 gap-2 p-2">
              {atelier.portfolioImages.slice(0, 3).map((img, imgIndex) => (
                <div key={imgIndex} className="aspect-square relative overflow-hidden rounded-lg">
                  <Image
                    src={img}
                    alt={`${atelier.name} portfolio ${imgIndex + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 33vw, 20vw"
                  />
                </div>
              ))}
            </div>

            <div className="p-6 space-y-4">
              <div>
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-xl font-bold">{atelier.name}</h4>
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{atelier.rating.toFixed(1)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  {atelier.location}
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">Специализация:</div>
                <div className="flex flex-wrap gap-2">
                  {atelier.specialization.map((spec) => (
                    <span
                      key={spec}
                      className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-medium"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t premium-border">
                <div>
                  <div className="text-sm text-gray-600">Стоимость:</div>
                  <div className="font-semibold">{atelier.priceRange}</div>
                </div>
                <button className="flex items-center gap-2 bg-primary-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-primary-700 transition-colors">
                  <Scissors className="w-4 h-4" />
                  Связаться
                </button>
              </div>

              {atelier.contact && (
                <div className="flex gap-4 text-sm text-gray-600 pt-2">
                  {atelier.contact.phone && (
                    <a href={`tel:${atelier.contact.phone}`} className="flex items-center gap-1 hover:text-primary-600">
                      <Phone className="w-4 h-4" />
                      {atelier.contact.phone}
                    </a>
                  )}
                  {atelier.contact.email && (
                    <a href={`mailto:${atelier.contact.email}`} className="flex items-center gap-1 hover:text-primary-600">
                      <Mail className="w-4 h-4" />
                      Email
                    </a>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
