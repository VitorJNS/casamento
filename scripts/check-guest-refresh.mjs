import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
process.chdir(root);

const fixture = path.join(root, "app", "guest-refresh-test", "page.tsx");

if (fs.existsSync(fixture)) {
  throw new Error("Temporary guest refresh test route already exists; refusing to overwrite it.");
}

fs.mkdirSync(path.dirname(fixture), { recursive: true });

try {
  fs.writeFileSync(
    fixture,
    `
import { GuestListManager } from "@/component/GuestListManager";

export default function GuestRefreshTestPage() {
  return <GuestListManager initialGuests={[]} />;
}
`,
  );

  const result = spawnSync(process.execPath, ["tests/guest-list/functional.mjs"], {
    stdio: "inherit",
  });

  if (result.status !== 0) {
    process.exitCode = result.status || 1;
  }
} finally {
  fs.unlinkSync(fixture);
}
