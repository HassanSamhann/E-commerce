import "dotenv/config";
import app from "./app";

const PORT = process.env.PORT || 5000;

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`
    ╔═══════════════════════════════════════╗
    ║    🚀 SaaS E-Commerce API Running     ║
    ║    Port: ${PORT}                          ║
    ║    Env:  ${process.env.NODE_ENV}          ║
    ╚═══════════════════════════════════════╝
    `);
  });
}

export default app;
