import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
const { imageHash } = require("image-hash");
const { createHash } = require("crypto");

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.post("/image-hash", (req: any, res: Response) => {
  const { cid } = req.body;

  let hash;
  imageHash(
    `https://ipfs.io/ipfs/${cid}`,
    16,
    true,
    (error: any, data: any) => {
      if (error) throw error;
      hash = data;

      res.send({ hash });
    }
  );
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
