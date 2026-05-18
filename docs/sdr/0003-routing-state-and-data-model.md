# SDR-0003: Routing, State, and Data Model

## Status
Accepted

## Date
2026-05-18

## Context
The app needs to manage appointments with a specific date, start time, duration, client name, and comment. It also needs to show available vs occupied slots for a given date.

## Decision
- **Routing**: Single Page Application (SPA) with no client-side router. Everything is rendered on a single view.
- **State**: The main state consists of a selected date, a search query, and an array of `Booking` objects.
- **Data Model**:
  ```typescript
  type Booking = {
    id: string; // unique identifier
    date: string; // YYYY-MM-DD
    startTime: string; // HH:MM
    duration: number; // 30, 60, 90, 120
    clientName: string;
    comment: string;
    status: 'active' | 'cancelled';
  }
  ```

## Options considered
- SPA vs Multi-page
- State held in DOM vs memory array

## Consequences
A single view simplifies interactions. State will be managed via a central array in JS that syncs with `localStorage` on every change. The UI will re-render based on this array.

## Requirements touched
- 1: Date selection
- 2: Time slot display
- 3: Booking creation
- 4: Cancellation
- 5: Archiving (cancelled items kept in array with 'cancelled' status)

## Rejected options and rationale
Multi-page routing was rejected as the app only requires a simple side-by-side or stacked view of the form and list. Storing state directly in the DOM was rejected as it makes `localStorage` syncing error-prone.
