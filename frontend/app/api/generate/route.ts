import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const prompt = formData.get('prompt') as string
    const imageFile = formData.get('image') as File | null

    // Prepare request body
    const body: any = {
      prompt: prompt || '',
    }

    // If image is provided, convert to base64 or send as multipart
    if (imageFile) {
      const arrayBuffer = await imageFile.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const base64Image = buffer.toString('base64')
      body.image = `data:${imageFile.type};base64,${base64Image}`
    }
    
    // Forward to API Gateway
    const response = await fetch(`${process.env.API_GATEWAY_URL || 'http://localhost:8000'}/api/v1/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      throw new Error('Generation failed')
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate images' },
      { status: 500 }
    )
  }
}
