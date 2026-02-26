import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const response = await fetch(`${process.env.API_GATEWAY_URL || 'http://localhost:8000'}/api/v1/ateliers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      throw new Error('Atelier search failed')
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Atelier search error:', error)
    return NextResponse.json(
      { error: 'Failed to search ateliers' },
      { status: 500 }
    )
  }
}
