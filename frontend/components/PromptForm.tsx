'use client'

import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Sparkles, Loader2, X, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'

const promptSchema = z.object({
  prompt: z.string().optional(),
  image: z.instanceof(File).optional(),
}).refine(
  (data) => (data.prompt && data.prompt.trim().length > 0) || data.image,
  {
    message: 'Опишите образ или прикрепите картинку',
    path: ['prompt'],
  }
)

type PromptFormData = z.infer<typeof promptSchema>

interface PromptFormProps {
  onSubmit: (data: PromptFormData) => void
  isLoading: boolean
}

export default function PromptForm({ onSubmit, isLoading }: PromptFormProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<PromptFormData>({
    resolver: zodResolver(promptSchema),
  })

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setValue('image', file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setPreviewImage(null)
    setValue('image', undefined)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const onFormSubmit = (data: PromptFormData) => {
    // Если есть изображение, но нет текста, можно добавить дефолтный промпт
    if (data.image && !data.prompt.trim()) {
      data.prompt = 'Найти похожий образ'
    }
    onSubmit(data)
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      onSubmit={handleSubmit(onFormSubmit)}
      className="max-w-2xl mx-auto"
    >
      <div className="bg-white rounded-2xl editorial-shadow p-6 md:p-8 space-y-6">
        {/* Prompt Input with Image Upload Icon */}
        <div>
          <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
            Опишите образ, который хотите найти или прикрепите картинку
          </label>
          <div className="relative">
            <textarea
              id="prompt"
              {...register('prompt')}
              rows={4}
              placeholder="Например: Элегантное вечернее платье в стиле 50-х, приталенное, с пышной юбкой, из атласной ткани цвета бордо..."
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />
            <div className="absolute right-3 top-3 flex items-center gap-2">
              {previewImage && (
                <div className="relative w-8 h-8 rounded overflow-hidden border-2 border-primary-500">
                  <Image
                    src={previewImage}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              )}
              <label
                htmlFor="image-upload"
                className="cursor-pointer p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Прикрепить картинку"
              >
                <ImageIcon className="w-5 h-5 text-gray-400 hover:text-primary-600 transition-colors" />
              </label>
              <input
                id="image-upload"
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
          </div>
          {errors.prompt && (
            <p className="mt-1 text-sm text-red-600">{errors.prompt.message}</p>
          )}
          
          {/* Full Preview Below Input */}
          {previewImage && (
            <div className="mt-4 relative">
              <div className="relative w-full h-48 rounded-xl overflow-hidden border-2 border-primary-500">
                <Image
                  src={previewImage}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
              </div>
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={isLoading || (!watch('prompt')?.trim() && !previewImage)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-4 px-6 bg-primary-600 text-white rounded-xl font-semibold text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed fashion-gradient"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Ищем образы...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Найти образы
            </>
          )}
        </motion.button>
      </div>
    </motion.form>
  )
}
