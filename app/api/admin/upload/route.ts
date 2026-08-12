import path from "node:path";
import { NextResponse } from "next/server";
import { assertAdminAccess, getAdminRuntimeStatus, getPublishMode, saveUploadedImage, slugify } from "@/lib/content-admin";

const maxUploadBytes = 25 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    assertAdminAccess(request);
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ ok: false, error: "没有收到图片文件。", runtime: getAdminRuntimeStatus() }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ ok: false, error: "只能上传图片文件。", runtime: getAdminRuntimeStatus() }, { status: 400 });
    }

    if (file.size > maxUploadBytes) {
      return NextResponse.json({ ok: false, error: "图片不能超过 25 MB。", runtime: getAdminRuntimeStatus() }, { status: 400 });
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
      publishMode: getPublishMode(),
      runtime: getAdminRuntimeStatus()
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "上传失败。",
        runtime: getAdminRuntimeStatus()
      },
      { status: 400 }
    );
  }
}
