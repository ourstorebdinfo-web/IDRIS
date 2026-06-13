import { getToken } from 'next-auth/jwt'

export async function POST(req) {
  try {
    // Only admins may upload files
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token || token.role !== 'ADMIN') {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { image } = body
    if (!image) {
      return Response.json({ error: 'No image provided' }, { status: 400 })
    }

    // If it's already a URL (not a data URL), return as-is
    if (!image.startsWith('data:')) {
      return Response.json({ url: image })
    }

    // Extract pure base64 from data URL
    const base64Data = image.replace(/^data:.+;base64,/, '')

    const apiKey = process.env.IMGBB_API_KEY
    if (!apiKey) {
      console.error('[upload] IMGBB_API_KEY is not set')
      return Response.json({ error: 'Image hosting not configured' }, { status: 500 })
    }

    // Upload to ImgBB
    const formData = new URLSearchParams()
    formData.append('key', apiKey)
    formData.append('image', base64Data)

    const imgbbRes = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: formData,
    })

    const imgbbJson = await imgbbRes.json()

    if (!imgbbJson.success) {
      console.error('[upload] ImgBB error:', imgbbJson)
      return Response.json({ error: 'Upload failed: ' + (imgbbJson?.error?.message || 'ImgBB rejected the image') }, { status: 500 })
    }

    const url = imgbbJson.data.display_url
    return Response.json({ url })
  } catch (err) {
    console.error('[upload] Error:', err)
    return Response.json({ error: 'Upload failed', details: String(err) }, { status: 500 })
  }
}

