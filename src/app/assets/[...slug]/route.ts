import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import mime from 'mime';

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string[] } }
) {
  const slug = params.slug.join('/');
  const filePath = path.join(process.cwd(), 'public', 'assets', slug);

  try {
    const stat = await fs.stat(filePath);
    const data = await fs.readFile(filePath);
    const contentType = mime.getType(filePath) || 'application/octet-stream';

    return new NextResponse(data, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': stat.size.toString(),
      },
    });
  } catch (error) {
    // Check if the error is a file not found error
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT') {
       return new NextResponse('Asset not found', { status: 404 });
    }
    // For other errors, return a generic 500
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
