# Mohammad's Academic Portfolio & Asset Proxy

A highly optimized, lightweight personal portfolio and academic asset management system designed to run on edge computing infrastructure. Originally built for Netlify, this project has been fully migrated and optimized for **Wasmer Edge** utilizing the WinterCG-compliant **WinterJS** runtime.

## 🚀 Features
- **High-Performance Static Serving:** Serves decoupled HTML/CSS front-end structures with minimal overhead.
- **Edge Proxy Capabilities:** Integrates an advanced inbound header stripping mechanism and dynamic upstream client IP forwarding (`X-Forwarded-For` / `CF-Connecting-IP`).
- **Resilient Fallbacks:** Active local resolution catch blocks ensuring continuous application uptime.

## 📂 Repository Structure

The repository maintains a clean separation between source code and compiled assets:

```text
├── .gitignore          # Prevents build and environment files from tracking
├── index.html          # Core front-end template (Source)
├── asset-loader.js     # Edge routing and reverse-proxy logic (Source)
├── package.json        # Project metadata and automation scripts
└── wasmer.toml         # Main deployment configuration for Wasmer Edge
