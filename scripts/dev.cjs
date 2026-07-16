const { spawn } = require("child_process");
const { existsSync } = require("fs");
const path = require("path");

const bundlePath = path.join(__dirname, "..", "win-ca-bundle.pem");
const env = { ...process.env };

if (process.platform === "win32" && existsSync(bundlePath)) {
  env.NODE_EXTRA_CA_CERTS = bundlePath;
}

const nextBin = require.resolve("next/dist/bin/next");
const child = spawn(process.execPath, [nextBin, "dev"], {
  stdio: "inherit",
  env,
});

child.on("exit", (code) => process.exit(code ?? 0));
