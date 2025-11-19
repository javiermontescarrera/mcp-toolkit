# MCP Manager Desktop App

Desktop application for managing Model Context Protocol (MCP) servers across projects.

## Features

- Project management
- Global MCP catalog
- Per-project MCP configuration
- Secret management
- MCP Router server
- Support for Docker, Binary, and HTTP MCPs

## Development

```bash
pnpm install
pnpm tauri dev
```

## Build

```bash
pnpm tauri build
```

## Architecture

- **Backend**: Tauri (Rust)
- **Frontend**: React + TypeScript
- **Storage**: SQLite
- **Router**: Axum HTTP server on port 9876

## Persistence

SQLite database stores:
- Projects
- MCPs
- Bindings
- Secrets (encrypted with AES-256-GCM)
- Router logs
