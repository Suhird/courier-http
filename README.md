# CourierHTTP

<p align="center">
  <img src="https://img.shields.io/badge/Tauri-24C8DB?style=for-the-badge&logo=tauri&logoColor=FFFFFF" alt="Tauri" />
  <img src="https://img.shields.io/badge/Rust-000000?style=for-the-badge&logo=rust&logoColor=white" alt="Rust" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Zustand-764ABC?style=for-the-badge&logo=react&logoColor=white" alt="Zustand" />
  <img src="https://img.shields.io/badge/License-GPLv3-blue.svg?style=for-the-badge" alt="License: GPL v3" />
</p>


### Screenshots

|Response Viewer |
|-----------------|
|![Response UI](screenshots/screenshot1.png) |

A local, offline-first desktop HTTP client — a Postman alternative that runs entirely on your machine with no accounts, no cloud sync, and no telemetry.

Built with Tauri v2, React 18, TypeScript, and Rust.

---

## Features

- **Send HTTP requests** — GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS
- **Request configuration** — query params, headers, auth, body (JSON, plain text, XML, HTML, form-urlencoded, multipart form-data)
- **Authentication** — Bearer token, Basic auth, API key (header or query), OAuth2
- **Environment variables** — define variable sets, switch between them, interpolate `{{variables}}` in URLs and values
- **Collections** — save and organise requests, drag-and-drop reorder, export to JSON
- **History** — automatic request history (last 200 entries)
- **Response viewer** — status, duration, size, syntax-highlighted body (JSON, HTML, XML), headers table
- **Multi-tab** — multiple open requests with independent state
- **Right-click disabled** — no browser DevTools exposed to end users

---

## Tech Stack

| | |
|---|---|
| Desktop shell | Tauri v2 |
| Frontend | React 18 + TypeScript |
| Build tool | Vite |
| Styling | Tailwind CSS v3 |
| State | Zustand v5 |
| Code editor | Monaco Editor |
| HTTP engine | Rust + reqwest |

---

## Prerequisites

- **Node.js** 18+
- **Rust** (stable) — install via [rustup.rs](https://rustup.rs)
- **Tauri CLI prerequisites** — see [Tauri v2 prerequisites](https://v2.tauri.app/start/prerequisites/) for your OS

### macOS

```bash
xcode-select --install
```

### Linux

```bash
sudo apt install libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf
```

---

## Setup

```bash
# Clone the repo
git clone <repo-url>
cd courier-http

# Install frontend dependencies
npm install
```

---

## Development

```bash
npm run tauri dev
```

This starts Vite for the frontend and compiles the Rust backend, then opens the app window. Hot-reload is active for the frontend; Rust changes require a full recompile.

---

## Build (production)

```bash
npm run tauri build
```

Output is in `src-tauri/target/release/bundle/`.

---

## Tests

### Frontend (Vitest)

```bash
npm test
```

172 tests covering utility functions, Zustand stores, and React components.

### Rust backend (Cargo)

```bash
cd src-tauri
cargo test
```

57 tests covering model serialization, storage layer, command logic, and HTTP execution (uses `wiremock` for mock HTTP server tests).

---

## Project Structure

```
courier-http/
├── index.html              # app entry point
├── src/
│   ├── types/index.ts      # shared TypeScript types
│   ├── lib/                # interpolate, tauri wrappers, utils
│   ├── store/              # Zustand stores (requests, collections, environments, history)
│   ├── components/
│   │   ├── shared/         # Badge, KeyValueTable, MonacoEditor
│   │   ├── layout/         # TabBar, StatusBar
│   │   ├── request/        # RequestBuilder and all request tabs
│   │   ├── response/       # ResponseViewer and sub-components
│   │   └── sidebar/        # Collections, History, Environments, SaveRequestModal
│   └── App.tsx
├── src-tauri/
│   ├── src/
│   │   ├── models/         # Rust data models (serde)
│   │   ├── storage/        # filesystem read/write (atomic)
│   │   ├── commands/       # Tauri command handlers
│   │   └── lib.rs          # app entry, command registration
│   └── Cargo.toml
└── src/__tests__/          # frontend test suite
```

---

## Data storage

All data is stored locally on disk:

| Data | Location (macOS) |
|---|---|
| Collections | `~/Library/Application Support/courier-http/collections/` |
| Environments | `~/Library/Application Support/courier-http/environments/` |
| History | `~/Library/Application Support/courier-http/history.json` |
