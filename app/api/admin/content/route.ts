import { NextResponse } from "next/server";
import { assertAdminAccess, getPublishMode, readCatalogContent, writeCatalogContent } from "@/lib/content-admin";

export async function GET(request: Request) {
  try {
    assertAdminAccess(request);
    return NextResponse.json({
      content: await readCatalogContent(),
      publishMode: getPublishMode()
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Failed to read content."
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    assertAdminAccess(request);
    const content = await request.json();
    await writeCatalogContent(content);
    return NextResponse.json({ ok: true, publishMode: getPublishMode() });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Failed to save content."
      },
      { status: 400 }
    );
  }
}
