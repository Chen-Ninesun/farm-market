import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { NextRequest } from 'next/server'
import { fail, ok } from '@/app/lib/response'

// 允许的图片类型
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

/**
 * POST /api/upload
 * 接收图片（multipart/form-data，字段名 file），保存到 public/uploads 并返回 URL
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file')

    if (!file || typeof file === 'string') {
      return fail('未找到上传文件（字段名应为 file）')
    }

    const imgFile = file as File
    if (!ALLOWED_TYPES.includes(imgFile.type)) {
      return fail('仅支持 jpg/png/webp/gif 图片')
    }

    const bytes = Buffer.from(await imgFile.arrayBuffer())
    const ext = path.extname(imgFile.name).toLowerCase() || '.jpg'
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`
    const dir = path.join(process.cwd(), 'public', 'uploads')
    await mkdir(dir, { recursive: true })
    await writeFile(path.join(dir, filename), bytes)

    return ok({
      url: `/uploads/${filename}`,
      filename,
      size: imgFile.size,
    }, '上传成功')
  }
  catch (error) {
    console.error('[upload] error:', error)
    return fail('上传失败，请稍后重试', 500, 500)
  }
}
