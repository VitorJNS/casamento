import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
process.chdir(root);
const fixture = path.join(root, 'app', 'supplier-test-preview', 'page.tsx');
if (fs.existsSync(fixture))
    throw new Error('Temporary test route already exists; refusing to overwrite it.');
fs.mkdirSync(path.dirname(fixture), { recursive: true });
fs.mkdirSync(path.join(root, 'design/fornecedor-mobile/validacao'), { recursive: true });
try {
    fs.writeFileSync(fixture, `
import { AdminSuppliersManager } from '@/component/AdminSuppliersManager';
import { CerimonialSuppliersManager } from '@/component/CerimonialSuppliersManager';
export default async function Preview({searchParams}: {searchParams: Promise<{mode?: string}>}) {
 const {mode} = await searchParams;
 return mode === 'cerimonial' ? <CerimonialSuppliersManager initialSuppliers={[]} /> : <AdminSuppliersManager initialSuppliers={[]} />;
}`);
    for (const test of ['functional', 'visual']) {
        const result = spawnSync(process.execPath, [`tests/supplier-form/${test}.mjs`], { stdio: 'inherit' });
        if (result.status !== 0) {
            process.exitCode = result.status || 1;
            break;
        }
    }
}
finally {
    fs.unlinkSync(fixture);
}
