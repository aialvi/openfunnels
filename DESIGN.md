# OpenFunnels Design Guide

This document captures product and interface guidance for OpenFunnels. Agents should read it before changing visible UI, editor interactions, page layouts, or styling conventions.

## Product Feel

OpenFunnels is a work-focused SaaS tool for building and managing funnels. The interface should feel fast, clear, and operational rather than decorative or marketing-heavy.

- Prioritize dense but readable workflows for repeated use.
- Keep navigation predictable and controls close to the content they affect.
- Make editor actions obvious through familiar icons, labels, hover states, and selection states.
- Avoid oversized hero sections inside the authenticated app.
- Preserve the current black/orange visual direction unless the task explicitly changes branding.

## Visual System

- Styling is Tailwind-first with global tokens in `resources/css/app.css`.
- UI components should reuse existing primitives in `resources/js/components/ui`.
- Cards are appropriate for repeated entities, modal surfaces, and bounded tools. Avoid nesting cards inside cards.
- Use lucide-react icons for buttons and tool controls when available.
- Keep controls stable in size so hover states, dynamic labels, and active selections do not shift layouts.
- Text must fit within buttons, panels, and cards across mobile and desktop.

## Editor UX

The funnel editor is the primary product surface. Treat it as a professional creation tool.

- Preserve the hierarchy of funnel -> sections -> columns -> blocks.
- Make selected section, column, and block states visually distinct.
- Keep properties panels focused on the current selection.
- Use drag-and-drop affordances that make valid drop targets clear.
- Keep undo/redo behavior in sync with state changes that alter funnel content.
- Avoid destructive actions without clear user intent.

## Responsive Behavior

- Funnels and app workflows must work across desktop, tablet, and mobile.
- The editor may be desktop-optimized, but preview/device controls should reflect the selected device accurately.
- Avoid layouts that rely on viewport-width font scaling.
- Use stable constraints such as `minmax`, fixed toolbar heights, aspect ratios, and overflow handling for complex work surfaces.

## Copy Guidelines

- Use concise action-oriented labels.
- Avoid visible instructional paragraphs in the app when a control, tooltip, placeholder, or empty state can communicate the same thing.
- Error messages should explain what failed and how to recover.
- For technical setup flows like custom domains, use concrete record names and values with copy controls.

