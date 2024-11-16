// This is an example of how to access a session from an API route
import { getServerSession } from "next-auth";

import type { NextApiRequest, NextApiResponse } from "next";

export async function GET(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req);

  const token = req.cookies.get("next-auth.session-token").value;
  console.log("cookie", req.cookies);

  const userinfo = await fetch("https://id.worldcoin.org/userinfo", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  console.log("userinfo", userinfo);

  return Response.json({ session });
}
