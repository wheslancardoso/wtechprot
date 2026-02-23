import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const url = searchParams.get('url')

    if (!url) {
        return new NextResponse('Missing url parameter', { status: 400 })
    }

    try {
        const response = await fetch(url)
        if (!response.ok) {
            console.error(`Error fetching proxy image from ${url}: ${response.status} ${response.statusText}`)
            return new NextResponse('Failed to fetch image', { status: response.status })
        }

        const arrayBuffer = await response.arrayBuffer()

        return new NextResponse(arrayBuffer, {
            headers: {
                'Content-Type': response.headers.get('Content-Type') || 'image/jpeg',
                'Cache-Control': 'public, max-age=31536000, immutable',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
            }
        })
    } catch (error) {
        console.error('Error proxying image:', error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}
