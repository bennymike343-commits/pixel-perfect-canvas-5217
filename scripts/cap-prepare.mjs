// Copies the Nitro client build (dist/client) into the Capacitor webDir
// (.output/public) so `cap sync android` packages a fully local app shell.
import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";

const src = join(process.cwd(), "dist", "client");
const dest = join(process.cwd(), ".output", "public");

if (!existsSync(src)) {
  console.error("[cap-prepare] dist/client not found — run `bun run build` first.");
  process.exit(1);
}

rmSync(dest, { recursive: true, force: true });
mkdirSync(dest, { recursive: true });
cpSync(src, dest, { recursive: true });

if (!existsSync(join(dest, "index.html"))) {
  console.error("[cap-prepare] WARNING: .output/public/index.html is missing.");
  process.exit(1);
}

console.log("[cap-prepare] .output/public is ready (index.html present).");
