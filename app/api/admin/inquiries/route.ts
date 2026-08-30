import { NextResponse } from "next/server";
import { assertAdminAccess, getAdminRuntimeStatus, getPublishMode, readInquiryRecords } from "@/lib/content-admin";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    assertAdminAccess(request);
    return NextResponse.json({
      ok: true,
      inquiries: await readInquiryRecords(),
      publishMode: getPublishMode(),
      runtime: getAdminRuntimeStatus()
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "读取意向单失败。",
        runtime: getAdminRuntimeStatus()
      },
      { status: 500 }
    );
  }
}
