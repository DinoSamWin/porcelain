import { NextResponse } from "next/server";
import {
  assertAdminAccess,
  getAdminRuntimeStatus,
  getPublishMode,
  readCatalogContent,
  triggerVercelDeployHook,
  writeCatalogContent
} from "@/lib/content-admin";

export async function GET(request: Request) {
  try {
    assertAdminAccess(request);
    return NextResponse.json({
      content: await readCatalogContent(),
      publishMode: getPublishMode(),
      runtime: getAdminRuntimeStatus()
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "读取后台内容失败。",
        runtime: getAdminRuntimeStatus()
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
    const deployHook = await triggerVercelDeployHook();
    return NextResponse.json({ ok: true, publishMode: getPublishMode(), runtime: getAdminRuntimeStatus(), deployHook });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "保存失败。",
        runtime: getAdminRuntimeStatus()
      },
      { status: 400 }
    );
  }
}
