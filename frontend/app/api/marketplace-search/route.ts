import { NextRequest, NextResponse } from 'next/server'

// Функция для загрузки маркетплейсов
async function getMarketplaces() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/marketplaces`, {
      cache: 'no-store',
    })
    if (response.ok) {
      const data = await response.json()
      return data.marketplaces || []
    }
  } catch (error) {
    console.error('Error loading marketplaces:', error)
  }
  
  // Fallback к дефолтным маркетплейсам
  return [
    {
      id: 'lamoda',
      name: 'Lamoda',
      url: 'https://www.lamoda.ru',
      searchEndpoint: '/api/search',
      enabled: true,
    },
    {
      id: 'tsum',
      name: 'ЦУМ',
      url: 'https://www.tsum.ru',
      searchEndpoint: '/api/search',
      enabled: true,
    },
    {
      id: 'wildberries',
      name: 'Wildberries',
      url: 'https://www.wildberries.ru',
      searchEndpoint: '/api/search',
      enabled: true,
    },
    {
      id: 'ozon',
      name: 'Ozon',
      url: 'https://www.ozon.ru',
      searchEndpoint: '/api/search',
      enabled: true,
    },
  ]
}

interface MarketplaceProduct {
  id: string
  name: string
  price: number
  image: string
  images?: string[] // несколько фото товара
  url: string
  marketplace: string
  similarity?: number
  brand?: string
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const prompt = formData.get('prompt') as string
    const imageUrl = formData.get('imageUrl') as string | null
    const imageFile = formData.get('image') as File | null

    // Подготовка данных для поиска
    let searchImageUrl = imageUrl
    if (imageFile) {
      const arrayBuffer = await imageFile.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const base64Image = buffer.toString('base64')
      searchImageUrl = `data:${imageFile.type};base64,${base64Image}`
    }

    // Если нет изображения, используем промпт для текстового поиска
    if (!searchImageUrl && prompt) {
      const MARKETPLACES = await getMarketplaces()
      const products = await searchByText(prompt)
      return NextResponse.json({
        message: `Найдено ${products.length} товаров по запросу "${prompt}"`,
        products: products.slice(0, 6),
        marketplaces: MARKETPLACES.filter((m: any) => m.enabled),
      })
    }

    // Загружаем актуальный список маркетплейсов
    const MARKETPLACES = await getMarketplaces()
    
    // Поиск по изображению через API Gateway (если доступен)
    const enabledMarketplaces = MARKETPLACES.filter((m: any) => m.enabled)
    const allProducts: MarketplaceProduct[] = []

    // Параллельный поиск по всем маркетплейсам
    const searchPromises = enabledMarketplaces.map(async (marketplace) => {
      try {
        // Если backend доступен, используем его
        const apiGatewayUrl = process.env.API_GATEWAY_URL || 'http://localhost:8000'
        const response = await fetch(`${apiGatewayUrl}/api/v1/search`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageUrl: searchImageUrl,
            marketplace: marketplace.id,
            max_results: 10,
          }),
        })

        if (response.ok) {
          const data = await response.json()
          return (data.products || []).map((p: any) => ({
            ...p,
            marketplace: marketplace.name,
          }))
        }
      } catch (error) {
        console.error(`Error searching ${marketplace.name}:`, error)
        // Fallback: генерируем mock данные для демонстрации
        return generateMockProducts(marketplace, prompt || 'платье')
      }
      return []
    })

    const results = await Promise.all(searchPromises)
    results.forEach((products) => {
      allProducts.push(...products)
    })

    // Сортируем по релевантности
    allProducts.sort((a, b) => (b.similarity || 0) - (a.similarity || 0))

    return NextResponse.json({
      message: `Найдено ${allProducts.length} товаров на ${enabledMarketplaces.length} маркетплейсах`,
      products: allProducts.slice(0, 6), // Мало карточек, но крупные
      marketplaces: enabledMarketplaces,
    })
  } catch (error) {
    console.error('Marketplace search error:', error)
    
    // Fallback: возвращаем mock данные
    const MARKETPLACES = await getMarketplaces()
    const mockProducts = MARKETPLACES.filter((m: any) => m.enabled).flatMap((marketplace: any) =>
      generateMockProducts(marketplace, 'платье')
    )

    return NextResponse.json({
      message: 'Поиск выполнен (демо-режим)',
      products: mockProducts.slice(0, 6),
      marketplaces: MARKETPLACES.filter((m) => m.enabled),
      warning: 'Backend недоступен, показаны демо-данные',
    })
  }
}

// Текстовый поиск (заглушка)
async function searchByText(query: string): Promise<MarketplaceProduct[]> {
  const products: MarketplaceProduct[] = []
  const MARKETPLACES = await getMarketplaces()
  
  MARKETPLACES.filter((m: any) => m.enabled).forEach((marketplace: any) => {
    products.push(...generateMockProducts(marketplace, query))
  })

  return products
}

// Data URI — заглушка изображения (работает без внешних запросов)
const PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='400' viewBox='0 0 300 400'%3E%3Crect fill='%23f3f4f6' width='300' height='400'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-size='20' font-family='system-ui,sans-serif'%3EПлатье%3C/text%3E%3C/svg%3E"

// Несколько вариантов заглушек для «нескольких образов» у товара
const PLACEHOLDER_IMAGE_2 =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='400' viewBox='0 0 300 400'%3E%3Crect fill='%23e5e7eb' width='300' height='400'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-size='18' font-family='system-ui,sans-serif'%3EФото 2%3C/text%3E%3C/svg%3E"
const PLACEHOLDER_IMAGE_3 =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='400' viewBox='0 0 300 400'%3E%3Crect fill='%23d1d5db' width='300' height='400'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%236b7280' font-size='18' font-family='system-ui,sans-serif'%3EФото 3%3C/text%3E%3C/svg%3E"

// Генерация mock продуктов: мало карточек, у каждого несколько изображений
function generateMockProducts(marketplace: any, query: string): MarketplaceProduct[] {
  const mockProducts = [
    {
      id: `${marketplace.id}-1`,
      name: `Элегантное платье ${query}`,
      price: Math.floor(Math.random() * 50000) + 5000,
      image: PLACEHOLDER_IMAGE,
      images: [PLACEHOLDER_IMAGE, PLACEHOLDER_IMAGE_2, PLACEHOLDER_IMAGE_3],
      url: `${marketplace.url}/product/1`,
      marketplace: marketplace.name,
      similarity: 0.85 + Math.random() * 0.1,
      brand: 'Fashion Brand',
    },
    {
      id: `${marketplace.id}-2`,
      name: `Стильное платье ${query}`,
      price: Math.floor(Math.random() * 50000) + 5000,
      image: PLACEHOLDER_IMAGE,
      images: [PLACEHOLDER_IMAGE, PLACEHOLDER_IMAGE_2],
      url: `${marketplace.url}/product/2`,
      marketplace: marketplace.name,
      similarity: 0.75 + Math.random() * 0.1,
      brand: 'Style Brand',
    },
    {
      id: `${marketplace.id}-3`,
      name: `Классическое платье ${query}`,
      price: Math.floor(Math.random() * 50000) + 5000,
      image: PLACEHOLDER_IMAGE,
      images: [PLACEHOLDER_IMAGE, PLACEHOLDER_IMAGE_2, PLACEHOLDER_IMAGE_3],
      url: `${marketplace.url}/product/3`,
      marketplace: marketplace.name,
      similarity: 0.65 + Math.random() * 0.1,
    },
  ]

  return mockProducts
}

// GET endpoint для получения списка маркетплейсов
export async function GET() {
  const MARKETPLACES = await getMarketplaces()
  return NextResponse.json({
    marketplaces: MARKETPLACES.filter((m: any) => m.enabled),
  })
}
