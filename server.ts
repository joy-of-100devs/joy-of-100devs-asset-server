import express from 'express';
import * as path from "path";
import * as fs from "fs";
import sharp from 'sharp';
import cors from 'cors';
import morgan from 'morgan';

const STATIC_ROOT = "./static";
const app = express();
app.use(express.json());
app.use(morgan("dev"));
app.use("/static", express.static(STATIC_ROOT));
app.use(cors())
app.get("/api/*", async (req: express.Request<{ 0: string }>, res) => {
    const slug = req.params[0];
    const filePath = path.join(STATIC_ROOT, slug);
    let data: Buffer;
    try {
        data = await fs.promises.readFile(filePath);
    } catch (e) {
        return res.status(404).json({
            success: false,
            error: "Asset not found.",
        });
    }
    const image = await sharp(data);
    const meta = await image.metadata();
    const fileURL = path.join(`${req.protocol}://${req.get("host")}`, STATIC_ROOT, slug).replaceAll("\\", "/");
    res.json({
        success: true,
        data: {
            width: meta.width,
            height: meta.height,
            url: fileURL.toString(),
        }
    });
});

app.listen(process.env.PORT || 8000);
