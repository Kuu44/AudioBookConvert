# Milestone: AudioBookConvert v2 UI Overhaul & UX Finalization

**Generated:** 2026-04-01
**Purpose:** Team onboarding and project review

---

## 1. Project Overview

AudioBookConvert has been completely revamped from a raw scripting utility into a fluid, animated, beautifully styled single-page application. Version 2 enables users to select files, configure Edge TTS settings, and convert massive documents into natural audio seamlessly. 

The core value proposition delivered during this milestone is a strict **"No-Scroll, Dashboard-focused"** workflow. Instead of long pages, all the complex configuration sections gracefully fade into a unified loading dashboard when processing starts, concluding with a cinematic success page that highlights generated output audio formats.

## 2. Architecture & Technical Decisions

- **Decision:** Consolidate UI State into a global Custom Hook (`useWorkflowState.ts`)
  - **Why:** The text input, configuration settings, and chunk processing loops were causing prop-drilling and losing state during React component unmounts. Moving this logic to a centralized state allows features like "Live Preview" to work elegantly while preserving unsaved text.
  - **Phase:** State Preparation Phase

- **Decision:** Edge TTS Pre-Initialization Fix (`convertToAudio.ts`)
  - **Why:** Small chunks (under 1000 characters) were freezing during WebSocket pre-auth limits, keeping `total chunks 0` frozen on screen for 20 seconds. Handled by explicitly firing `onProgress(0, total)` right after array splitting finishes.
  - **Phase:** Conversion Hardening Phase

## 3. Phases Delivered

| Phase | Name | Status | One-Liner |
|-------|------|--------|-----------|
| 1 | UI / CSS Glassmorphism | ✅ Complete | Migrated flat colors to CSS variables, adding floating blobs and glass shadows |
| 2 | Component Breakdown | ✅ Complete | Split monolithic `App.tsx` into modular sections (Header, UploadZone, Settings, Output) |
| 3 | State Preservation | ✅ Complete | Handed off text boxes and file upload refs to `useWorkflowState.ts`. Enabled test previews on the fly. |
| 4 | Adaptive Dashboards | ✅ Complete | Dynamic conditional rendering built to swap inputs with a processing screen containing snarky progress checks |
| 5 | GitHub Actions | ✅ Complete | Integrated Vite with GitHub pages into `.github/workflows/deploy.yml` |

## 4. Requirements Coverage

- ✅ Dark mode UI theme overlay with deep shadows and reactive animations
- ✅ Text Box entry and file selection mode parity
- ✅ Progress bar correctly captures true load percentage without freezing 
- ✅ Success-only screen showcasing full final audiobook stats (Size, chunks generated, time, speed, voice profile)
- ✅ "Finish & Convert Another" instant restart trigger
- ✅ `.gitignore` sweep completed — filtered out local `.wav`, edge `.log`, `.mcp` files, and the local CLI build paths.

## 5. Tech Debt & Deferred Items

- **Web Audio Chain toggles**: The "De-Ess", "Normalize", and "Remove Silence" toggles in the processing list are purely visual mockups for now. These will need to be hooked up into the `lamejs` encoding pipeline recursively.
- **Stream-to-Disk API**: To handle enormous 1GB+ files without memory leaks, the file-system access API has not yet been plugged into the main run loop.

## 6. Getting Started

- **Run the project**: `npm run dev`
- **Key directories**:
  - `src/components/*` — The UI layer pieces swapped out dynamically by App
  - `src/workflow/*` — `useWorkflowState.ts` holds React state; `convertToAudio.ts` holds the Edge TTS engine loop logic.
- **Deploying**: A `.github/workflows/deploy.yml` Action has been loaded into standard operation, meaning running commits on `main` / `master` branch will instantly publish to GitHub Pages.

---

## Stats
- **Commits:** Complete squash commit mapped to `feat/v2-ui-overhaul`
- **Files mapped in refactor:** 32 files (5119 lines added / 630 deleted) 
- **Deploy Target:** Configured properly for absolute Pathing (`base: './'`) in Vite for effortless deployment mechanics.
