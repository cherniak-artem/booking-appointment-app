# SDR-0002: Client Storage Choice

## Status
Accepted

## Date
2026-05-18

## Context
The application needs to persist booking appointments so they are not lost on page reload. The app is intended to be a single-user demonstration hosted on GitHub Pages without a backend.

## Decision
We will use `localStorage` to persist the bookings.

## Options considered
- In-memory state only
- `sessionStorage`
- `localStorage`
- `IndexedDB`
- External backend

## Consequences
Data will persist across page reloads and browser sessions for the single user on that specific browser. It meets the non-functional requirement natively. However, it will not support true multi-user concurrency or synchronization across devices.

## Requirements touched
- NFR1: Data preservation (localStorage or local file)
- 5: Archiving (all records)

## Rejected options and rationale
- In-memory/sessionStorage: Fails NFR1 as data is lost after reload or tab closure.
- IndexedDB: The dataset (bookings) is small enough and the queries (search by date, name) are simple enough that `localStorage` is completely sufficient. IndexedDB adds unnecessary complexity.
- External backend: Pure GitHub Pages deployment constraints explicitly forbid trusted backends.
