import { db } from "@/server/api/tdb";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const uid = req.query.uid;

  if (!uid || typeof uid !== "string" || req.method !== "GET") {
    res.status(400).end();
    return;
  }

  const { data, status } = await db.findUnique("media", { uid: uid });

  if (!data) {
    res.status(404).end();
    return;
  }

  const asBytes = Buffer.from(data.data.split(",")[1] as string, "base64");
  const mime = extraMime(data.data);
  res.setHeader("Content-Type", mime);
  res.setHeader("Content-Length", asBytes.length);
  res.setHeader("Accept-Ranges", "bytes");
  res.status(status).send(asBytes);
  return;
}

function extraMime(dataUri: string) {
  const pre = dataUri.substring(5);
  let end = pre.indexOf(";");
  end = end === -1 ? pre.indexOf(",") : end;
  return pre.substring(0, end);
}
