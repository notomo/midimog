# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
MIDI to motion graphics application built with React, Three.js WebGPU renderer, and Web MIDI API. The application captures MIDI input from connected devices and translates them into real-time 3D visualizations using hardware-accelerated graphics.

## Development Commands
- `npm start` - Start development server with auto-reload
- `npm run build` - Build for production (TypeScript compilation + Vite build)
- `npm run preview` - Preview production build
- `npm test` - Run test suite with Vitest
- `npm run typecheck` - Run TypeScript type checking without emission
- `npm run lint` - Check code with Biome linter
- `npm run lint:fix` - Auto-fix linting issues with Biome
- `npm run format` - Format code with Biome
- `npm run check:all` - Run both linting and type checking

## Architecture
The application follows a modular architecture with clear separation of concerns:

**Core Pipeline**: React App → MIDI Motion Graphics → Renderer + Visualizers + MIDI Input
- `src/main.tsx` - React application entry point
- `src/app.tsx` - Main React component that initializes the 3D canvas
- `src/feature/midi-motion-graphics.ts` - Central orchestrator that connects MIDI input to visualizers and renderer

**Rendering System**: Uses Three.js with WebGPU renderer for hardware acceleration
- `src/feature/renderer.ts` - WebGPU renderer setup with scene, camera, and lighting
- Scene includes ambient lighting and directional light with shadow support
- Automatic canvas resizing and pixel ratio handling

**MIDI Processing**: Web MIDI API integration for real-time input
- `src/lib/midi-input.ts` - MIDI message parsing and device management
- Supports note_on, note_off, and control_change messages
- Automatic connection to all available MIDI input devices

**Visualization Layer**: Pluggable visualizer system
- `src/feature/geometry-visualizer.ts` - Transforms MIDI messages into 3D geometry animations
- `src/feature/visualizer.ts` - Base visualizer interface
- Visualizers receive MIDI messages and update 3D objects accordingly

## Tools & Configuration
- **TypeScript**: Strict configuration with ES2023 target
- **Biome**: Code formatting and linting (replaces ESLint/Prettier)
- **Vite**: Build tool and development server with React plugin
- **Vitest**: Testing framework
- **Lefthook**: Git hooks for pre-commit formatting
- **TailwindCSS v4**: Utility-first styling
- **Three.js**: 3D graphics library with WebGPU support

## Key Dependencies
- React 19 with TypeScript
- Three.js with WebGPU renderer and TypeScript definitions
- Tailwind utilities: clsx and tailwind-merge

## Task Guidelines
- Always run `npm run check:all` at the end of tasks to verify code quality and type safety