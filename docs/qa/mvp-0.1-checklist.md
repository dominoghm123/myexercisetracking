# MVP 0.1 QA checklist

Use this checklist for the review build. MVP 0.1 is a local, fixture-only preview; completing this checklist does not authorize real-data import or SQLite, notes, cache, or external service writes.

## Automated gates

- [ ] Run `node scripts/validate-boundaries.mjs`; it exits `0` and reports that all five protected directories contain only empty `.gitkeep` placeholders.
- [ ] Start the app using the documented local command and confirm the local URL responds successfully.
- [ ] Confirm the browser console contains **0 errors and 0 warnings** after a clean reload.
- [ ] Confirm no request is made to an external host; browser network activity is local-only and no API key is needed.
- [ ] Confirm the session creates no SQLite/database file and does not write to `data/database/`, `data/images/`, `data/imports/`, `cache/`, or `notes/`.

## Fixture and content gates

- [ ] The Today Record page visibly and unambiguously says that its displayed data is a **synthetic fixture**.
- [ ] All displayed records come from local fixtures; no fixture is presented as a real user record.
- [ ] The fixture model supports and the UI shows the three expandable categories: `cardio`, `strength`, and `stretching/mobility`.
- [ ] Any incomplete or uncertain fixture item is explicitly marked `needs_review`; the UI does not silently convert uncertainty into a confirmed fact.
- [ ] Reloading the page does not turn fixture content into persisted business data.

## Desktop visual review (1440 × 1000)

- [ ] Capture a screenshot at exactly **1440 × 1000** and record its path in the handoff.
- [ ] Sidebar and Today Record content are both visible and usable.
- [ ] Warm-white/light-gray surfaces, sage-green emphasis, and the system sans-serif font are consistent with the approved shell.
- [ ] No content is clipped, overlapped, or pushed outside the viewport; there is no horizontal overflow.
- [ ] Focus indicators, text contrast, headings, labels, and control states remain legible.

## Narrow visual review (390 × 844)

- [ ] Capture a screenshot at exactly **390 × 844** and record its path in the handoff.
- [ ] Sidebar/navigation adapts without blocking the Today Record content.
- [ ] Cards, labels, and controls remain readable and tappable without horizontal scrolling.
- [ ] No content is clipped or overlapped; `document.documentElement.scrollWidth <= document.documentElement.clientWidth`.
- [ ] Focus indicators and all meaningful content remain available at the narrow viewport.

## Keyboard and accessibility basics

- [ ] Use only the keyboard to traverse every interactive element in a logical order.
- [ ] Every interactive element has a visible focus state and an accessible name.
- [ ] The current navigation item is exposed programmatically (for example, `aria-current="page"`).
- [ ] Heading levels describe the page structure in order, and fixture status is conveyed in text rather than color alone.
- [ ] Decorative icons are hidden from assistive technology; meaningful icons have an accessible label.
- [ ] Browser zoom at 200% does not hide required content or create two-dimensional scrolling.

## Review evidence and release boundary

- [ ] Handoff includes the modified-file list, startup command, both screenshot paths, validation results, requested user data, and any API key/model/runtime blocker.
- [ ] The user reviews MVP 0.1 before any broader page set, real-data ingestion, or final product assembly begins.
- [ ] User-provided spoken training or diet information remains input awaiting confirmation; it is not written into the protected source-of-truth boundaries during this fixture-only milestone.
