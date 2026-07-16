const fs = require("fs");
const path = require("path");

const outPath = path.join(__dirname, "..", "win-ca-bundle.pem");

if (process.platform !== "win32") {
  console.log("Not on Windows, skipping CA bundle generation.");
  process.exit(0);
}

const ca = require("win-ca/api");
const certs = [];

ca({
  format: ca.der2.pem,
  ondata: (crt) => certs.push(crt),
});

fs.writeFileSync(outPath, certs.join("\n"));
console.log(`Wrote ${certs.length} certificates to ${outPath}`);
