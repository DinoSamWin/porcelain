import path from "node:path";
import { NextResponse } from "next/server";
import { assertAdminAccess, getPublishMode, saveUploadedImage, slugify } from "@/lib/content-admin";

const maxUploadBytes = 25 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    assertAdminAccess(request);
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ ok: false, error: "No file received." }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ ok: false, error: "Only image uploads are supported." }, { status: 400 });
    }

    if (file.size > maxUploadBytes) {
      return NextResponse.json({ ok: false, error: "Image is larger than 25 MB." }, { status: 400 });
    }

    const extension = path.extname(file.name).toLowerCase() || ".jpg";
    const baseName = slugify(path.basename(file.name, extension)) || "product-image";
    const fileName = `${Date.now()}-${baseName}${extension}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const src = await saveUploadedImage({ fileName, buffer });

    return NextResponse.json({
      ok: true,
      src,
      alt: path.basename(file.name, extension).replace(/[-_]+/g, " "),
      publishMode: getPublishMode()
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Upload failed."
      },
      { status: 400 }
    );
  }
}
