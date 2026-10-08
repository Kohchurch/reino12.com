import { timingSafeEqual } from "node:crypto";
import { revalidatePath, revalidateTag } from "next/cache";
function authorized(request) {
  const supplied =
    request.headers.get("authorization")?.replace(/^Bearer /i, "") ||
    request.headers.get("x-revalidate-secret") ||
    new URL(request.url).searchParams.get("secret") ||
    "";
  const expected = process.env.REVALIDATE_SECRET || "";
  return (
    expected.length > 0 &&
    Buffer.byteLength(expected) === Buffer.byteLength(supplied) &&
    timingSafeEqual(Buffer.from(expected), Buffer.from(supplied))
  );
}
async function handler(request) {
  if (!authorized(request))
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  revalidateTag("strapi", { expire: 0 });
  revalidatePath("/", "layout");
  return Response.json({ revalidated: true });
}
export const POST = handler;
export const GET = handler;
