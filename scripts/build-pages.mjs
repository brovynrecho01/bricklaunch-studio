import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const root = process.cwd();
const apiDir = path.join(root, "src", "app", "api");
const stashDir = path.join(root, ".api_stash_for_static_export");

function moveDirSafe(from, to) {
  try {
    fs.renameSync(from, to);
  } catch {
    fs.cpSync(from, to, { recursive: true, force: true });
    fs.rmSync(from, { recursive: true, force: true });
  }
}

function restoreApiDir() {
  if (fs.existsSync(stashDir) && !fs.existsSync(apiDir)) {
    moveDirSafe(stashDir, apiDir);
  }
}

try {
  // Next.js static export (`output: 'export'`) cannot compile force-dynamic API route handlers.
  // Stash src/app/api cleanly during static GitHub Pages build, then always restore it.
  if (fs.existsSync(apiDir)) {
    moveDirSafe(apiDir, stashDir);
  }

  execSync("npx next build", {
    stdio: "inherit",
    env: {
      ...process.env,
      GITHUB_PAGES: "true",
      NEXT_PUBLIC_STATIC_DEMO: "true",
    },
  });

  // Add .nojekyll so GitHub Pages serves _next/ static assets without Jekyll filtering
  const outDir = path.join(root, "out");
  if (fs.existsSync(outDir)) {
    fs.writeFileSync(path.join(outDir, ".nojekyll"), "");
  }
} finally {
  restoreApiDir();
}
