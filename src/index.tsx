import { serve } from "bun";
import sharp from "sharp";
import index from "./index.html";

const server = serve({
  routes: {
    // Serve index.html for all unmatched routes.
    "/*": index,

    // Serve slides from the /slides directory.
    "/slides/:path": async (req) => {
      const { path } = req.params;
      const file = Bun.file(`./slides/${path}`);
      if (!file.exists()) {
        return new Response("Not found", { status: 404 });
      }

      // If the request is for an image, convert it to WebP format using sharp.
      if (/\.(png|jpe?g|gif)$/i.test(path)) {
        const imageBuffer = await file.arrayBuffer();
        const webpBuffer = await sharp(Buffer.from(imageBuffer))
          .webp({ quality: 80 })
          .toBuffer();
        return new Response(new Uint8Array(webpBuffer), {
          headers: { "Content-Type": "image/webp" },
        });
      }

      // For other file types, serve them as-is.
      return new Response(file.stream(), {
        headers: { "Content-Type": "application/octet-stream" },
      });
    },

    // make the build date when the server was started. at build time, it will
    // be replaced with the actual build date.
    "/build-date": new Response(new Date().getTime().toString(36), {
      headers: { "Content-Type": "text/plain" },
    }),
  },

  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
