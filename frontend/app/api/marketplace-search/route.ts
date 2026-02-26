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

interface Marketplace {
  id: string
  name: string
  url: string
  searchEndpoint?: string
  enabled?: boolean
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
    const enabledMarketplaces = MARKETPLACES.filter((m: Marketplace) => m.enabled)
    const allProducts: MarketplaceProduct[] = []

    // Параллельный поиск по всем маркетплейсам
    const searchPromises = enabledMarketplaces.map(async (marketplace: Marketplace) => {
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

// Фото платьев в том же стиле, что и у карточек ателье (Unsplash, aspect 3/4)
const DRESS_IMAGES = [
  'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=533&fit=crop', // платье на модели
  'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=400&h=533&fit=crop', // вечернее платье
  'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&h=533&fit=crop', // элегантное платье
  'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=533&fit=crop', // платье в интерьере
  'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&h=533&fit=crop', // стильное платье
  'https://images.unsplash.com/photo-1585487000143-668a2d34c32f?w=400&h=533&fit=crop', // платье крупный план
]
// Генерация mock продуктов: картинки платьев как у ателье — постановочные фото
function generateMockProducts(marketplace: any, query: string): MarketplaceProduct[] {
  const [img1, img2, img3] = DRESS_IMAGES
  const mockProducts = [
    {
      id: `${marketplace.id}-1`,
      name: `Элегантное платье ${query}`,
      price: Math.floor(Math.random() * 50000) + 5000,
      image: img1,
      images: [img1, DRESS_IMAGES[3], DRESS_IMAGES[4]],
      url: `${marketplace.url}/product/1`,
      marketplace: marketplace.name,
      similarity: 0.85 + Math.random() * 0.1,
      brand: 'Fashion Brand',
    },
    {
      id: `${marketplace.id}-2`,
      name: `Стильное платье ${query}`,
      price: Math.floor(Math.random() * 50000) + 5000,
      image: img2,
      images: [img2, DRESS_IMAGES[4]],
      url: `${marketplace.url}/product/2`,
      marketplace: marketplace.name,
      similarity: 0.75 + Math.random() * 0.1,
      brand: 'Style Brand',
    },
    {
      id: `${marketplace.id}-3`,
      name: `Классическое платье ${query}`,
      price: Math.floor(Math.random() * 50000) + 5000,
      image: img3,
      images: [img3, DRESS_IMAGES[5], DRESS_IMAGES[0]],
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
