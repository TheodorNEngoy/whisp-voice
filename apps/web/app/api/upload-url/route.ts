import { NextRequest, NextResponse } from "next/server";
import { uploadRequestSchema } from "@whisp/types";
import { createPresignedUrl } from "@/lib/storage";

export async function POST(request: NextRequest) {
  const json = await request.json();
  const body = uploadRequestSchema.parse(json);
  const presigned = await createPresignedUrl({
    contentType: body.contentType,
    ext: body.ext,
  });
  return NextResponse.json(presigned);
}
