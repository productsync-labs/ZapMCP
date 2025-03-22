# ZapMCP

ZapMCP is a framework that wraps around MCP servers, providing a streamlined development experience similar to Gatsby. It offers a simple CLI for creating, building, and working with MCP server-based projects.

## Features

- Simple project creation with `npx zapmcp new`
- Build optimization with `npx zapmcp build`
- Integrated documentation with `npx zapmcp docs`
- TypeScript support out of the box

## Getting Started

To create a new ZapMCP project:

```bash
npx zapmcp new my-mcp-project
cd my-mcp-project
npm install
npm run dev
```

## Project Structure

This project is a monorepo built with Turborepo, containing the following packages:

- `packages/zapmcp`: The core framework that provides the MCP server wrapper
- `packages/zapmcp-cli`: The command-line interface for interacting with ZapMCP projects

## Development

### Prerequisites

- Node.js (v16 or later)
- npm or pnpm

### Setup

1. Clone this repository
2. Install dependencies:

```bash
npm install
# or
pnpm install
```

3. Build all packages:

```bash
npm run build
# or
pnpm build
```

## Commands

### ZapMCP CLI

- `zapmcp new <project-name>`: Create a new ZapMCP project
- `zapmcp build`: Build your project for production
- `zapmcp docs`: Open the ZapMCP documentation

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
