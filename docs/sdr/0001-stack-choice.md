# SDR-0001: Stack Choice

## Status
Accepted

## Date
2026-05-18

## Context
The application requires a simple booking interface for an auto service station. It has a single main view with a booking form and a list of appointments. The repository is intended to be a simple GitHub Pages static app.

## Decision
We will use Vanilla HTML, CSS, and JavaScript. No framework or build step is necessary.

## Options considered
- Plain HTML, CSS, JavaScript
- Vite with vanilla JavaScript
- Vite with React

## Consequences
The implementation remains extremely simple, requires zero build steps, and perfectly aligns with pure static hosting constraints of GitHub Pages. The UI state management will have to be handled manually in JavaScript.

## Requirements touched
- NFR2: Adaptivity
- NFR3: Quick response speed

## Rejected options and rationale
Vite with Vanilla JS or React were rejected because the app does not have sufficient component complexity, repeated UI composition, or nested UI state to justify the overhead of a build step or a heavy frontend framework.
