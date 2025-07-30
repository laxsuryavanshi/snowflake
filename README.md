# ❄️ snowflake

Welcome to Snowflake monorepo! This repository houses a collection of my personal projects, experiments, and tools.

## 📦 Packages

Reusable libraries and utilities:

### [@turtleby/graceful-shutdown](./packages/graceful-shutdown)

A robust utility for graceful shutdown of Node.js HTTP servers. Handles termination signals, idle timeouts, and systemd socket activation.

### [jss-storage](./packages/jss-storage)

JavaScript secure storage utility with AES-256 encryption for browsers. Supports localStorage, sessionStorage, or custom storage backends.

### [@turtleby/workerhive](./packages/workerhive)

A powerful, type-safe Web Worker pool manager for efficient parallel task execution in browsers.

### [@turtleby/eslint-config](./packages/eslint-config)

Shared ESLint configuration for consistent code style across projects.

### [@turtleby/typescript-config](./packages/typescript-config)

Base TypeScript configuration for all projects in the monorepo.

### [@turtleby/watchtower](./packages/ngxentinel/packages/watchtower)

Angular user activity monitoring library with configurable timeout detection and DOM event tracking using RxJS observables.

## 🚀 Projects

Web applications and demonstrations:

### [Bitvolt](./projects/bitvolt)

Next.js application with AWS S3 integration and Material-UI components for cloud storage management.

### [Boids Simulation](./projects/boids)

Real-time flocking simulation implemented in vanilla JavaScript. Demonstrates emergent behavior of collective organisms using HTML5 Canvas.

### [IDMS](./projects/idms)

Identity Management System built with SvelteKit and Spring Boot. Full-stack application with Java backend and modern frontend.

### [Trackr](./projects/trackr)

Angular application with Material Design components for expense tracking and personal finance management.

### [Skylr](./projects/skylr)

Video chat application built with SvelteKit using WebRTC protocol for real-time peer-to-peer communication.

### [GitHub.io](./projects/github.io)

Personal website and portfolio built with SvelteKit.

## 🛠️ Development

This monorepo uses Yarn workspaces for package management and includes:

- **Turbo** for build orchestration
- **ESLint & Prettier** for code quality
- **Commitlint** for conventional commits
- **Husky** for git hooks
- **Docker Compose** for development services

## 📄 License

This project is unlicensed and for personal use.
