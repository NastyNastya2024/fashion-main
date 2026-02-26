import { NextRequest, NextResponse } from 'next/server'

// In-memory storage (в production используйте БД)
let marketplacesStore: any[] = [
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

// Инициализация маркетплейсов
function getMarketplaces() {
  return marketplacesStore
}

function saveMarketplaces(marketplaces: any[]) {
  marketplacesStore = marketplaces
}

// GET - получить все маркетплейсы
export async function GET() {
  const marketplaces = getMarketplaces()
  return NextResponse.json({ marketplaces })
}

// POST - добавить новый маркетплейс
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, url } = body

    if (!name || !url) {
      return NextResponse.json(
        { error: 'Name and URL are required' },
        { status: 400 }
      )
    }

    const marketplaces = getMarketplaces()
    const newMarketplace = {
      id: `custom-${Date.now()}`,
      name,
      url,
      searchEndpoint: '/api/search',
      enabled: true,
    }

    marketplaces.push(newMarketplace)
    saveMarketplaces(marketplaces)

    return NextResponse.json({ marketplace: newMarketplace })
  } catch (error) {
    console.error('Error adding marketplace:', error)
    return NextResponse.json(
      { error: 'Failed to add marketplace' },
      { status: 500 }
    )
  }
}

// PATCH - обновить маркетплейс (включить/выключить)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, enabled } = body

    if (id === undefined || enabled === undefined) {
      return NextResponse.json(
        { error: 'ID and enabled status are required' },
        { status: 400 }
      )
    }

    const marketplaces = getMarketplaces()
    const updated = marketplaces.map((m: any) =>
      m.id === id ? { ...m, enabled } : m
    )

    saveMarketplaces(updated)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating marketplace:', error)
    return NextResponse.json(
      { error: 'Failed to update marketplace' },
      { status: 500 }
    )
  }
}

// DELETE - удалить маркетплейс
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      )
    }

    const marketplaces = getMarketplaces()
    const filtered = marketplaces.filter((m: any) => m.id !== id)
    saveMarketplaces(filtered)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting marketplace:', error)
    return NextResponse.json(
      { error: 'Failed to delete marketplace' },
      { status: 500 }
    )
  }
}
