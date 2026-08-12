import fs from "fs";
import path from "path";

const nodesDir = path.resolve("nodes");
const indexPath = path.join(nodesDir, "index.json");

const entries = [];

const folders = fs
    .readdirSync(nodesDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory());

for (const folder of folders) {

    const nodeDir = path.join(nodesDir, folder.name);
    const manifestPath = path.join(nodeDir, "manifest.json");

    if (!fs.existsSync(manifestPath)) {
        continue;
    }

    const manifest = JSON.parse(
        fs.readFileSync(manifestPath, "utf8")
    );

    entries.push({
        id: manifest.id,
        entry: `nodes/${folder.name}/${manifest.entry}`
    });
}

const index = {
    nodes: entries
};

fs.writeFileSync(
    indexPath,
    JSON.stringify(index, null, 4) + "\n"
);

console.log("Zero Infinit — índex de nodes actualitzat.");
console.log(`${entries.length} node(s) trobats.`);