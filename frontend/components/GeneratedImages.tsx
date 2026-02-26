'use client'

import { motion } from 'framer-motion'
import { ZoomIn, Download, RefreshCw } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'

interface GeneratedImagesProps {
  images: string[]
  onImageSelect: (imageUrl: string) => void
}

export default function GeneratedImages({ images, onImageSelect }: GeneratedImagesProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold font-serif text-center">Сгенерированные образы</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {images.map((imageUrl, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="group relative bg-white rounded-2xl overflow-hidden editorial-shadow cursor-pointer"
            onClick={() => {
              setSelectedImage(imageUrl)
              onImageSelect(imageUrl)
            }}
          >
            <div className="aspect-square relative overflow-hidden">
              <Image
                src={imageUrl}
                alt={`Generated design ${index + 1}`}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex gap-2">
                  <button className="flex-1 bg-white/90 backdrop-blur-sm text-gray-900 px-4 py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-2">
                    <ZoomIn className="w-4 h-4" />
                    Найти похожие
                  </button>
                  <button className="bg-white/90 backdrop-blur-sm text-gray-900 px-4 py-2 rounded-lg">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            <div className="p-4">
              <div className="text-sm text-gray-500">Вариант {index + 1}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="relative max-w-4xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={selectedImage}
              alt="Selected design"
              width={1200}
              height={1200}
              className="rounded-2xl"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full"
            >
              ✕
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
