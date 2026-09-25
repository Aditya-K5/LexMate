# LexMate - UI/UX Direction

## 1. Design Principles

LexMate should feel like a premium professional productivity tool for lawyers.

Principles:
- Clean
- Calm
- Trustworthy
- Fast
- Information-dense without feeling crowded
- Mobile-first
- Accessible
- Consistent

The UI should prioritize the lawyer's next action and important deadlines.

## 2. Product Visual Direction

The current direction is:
- iOS-style mobile UI
- Light/clean surfaces
- Deep navy/blue primary accents
- Rounded cards
- Subtle shadows
- Strong typography hierarchy
- Simple professional iconography
- Generous spacing
- Clear status indicators

Avoid:
- Excessive gradients
- Decorative UI that reduces readability
- Dense tables on small screens
- Too many colors
- Tiny touch targets
- Overly futuristic AI styling

## 3. Color Palette

Use semantic design tokens rather than hard-coded colors throughout the application.

Suggested foundation:
- Primary: deep navy/blue
- Background: light neutral
- Surface: white
- Text primary: dark neutral
- Text secondary: muted neutral
- Success: green semantic color
- Warning: amber semantic color
- Error: red semantic color
- Info: blue semantic color
- Border: subtle neutral

Exact values should be derived from the approved Figma design and centralized in the design system.

## 4. Typography

Use a modern system sans-serif suitable for mobile interfaces.

Establish a consistent type scale:
- Display
- Screen title
- Section heading
- Card title
- Body
- Secondary/body-small
- Caption

Typography should emphasize:
1. Screen title
2. Important case/hearing information
3. Status
4. Supporting metadata

## 5. Spacing

Use an 8pt spacing system.

Examples:
```text
8
16
24
32
40
48
```

Use consistent spacing tokens rather than arbitrary values.

## 6. UI Components

Build reusable components for:
- Buttons
- Icon buttons
- Cards
- Status badges
- Search bars
- Tabs
- Bottom navigation
- Inputs
- Selectors
- Date/calendar controls
- Case cards
- Hearing cards
- Document rows
- Task rows
- Payment summaries
- Empty states
- Loading states
- Error states
- Confirmation dialogs

Interactive controls should have comfortable touch targets.

## 7. Primary Screens

### Dashboard
Show:
- Greeting
- Search
- Hearing count
- Deadline count
- Task count
- Pending amount
- Today's schedule
- Upcoming actions

### Cases
- Search
- Filters
- Case cards
- Status
- Next hearing
- Court
- Case number

### Case Details
- Case identity
- Client
- Court
- Next hearing
- Tabs
- Summary
- Timeline
- Documents
- Tasks
- Financials

### Calendar
- Date navigation
- Hearings
- Meetings
- Filing deadlines
- Event details

### Documents
- Categories
- Search
- Upload
- File metadata
- Preview/open actions

### Client Profile
- Client identity
- Contact actions
- Active cases
- Payment summary
- Activity

### AI Assistant
- Suggested prompts
- Conversation
- Context-aware case/document actions
- Clear indication of AI-generated output
- User review before external use

## 8. UX States

Every data-driven screen should consider:
- Loading
- Empty
- Error
- Success
- Offline/degraded connection
- Permission denied
- Partial data

Never design only the happy path.

## 9. Accessibility

- Maintain readable contrast.
- Use accessible labels.
- Do not rely on color alone for status.
- Support dynamic text where practical.
- Maintain touch-friendly targets.
- Provide clear focus/interaction states where applicable.

## 10. Design System Rule

The Figma design is the visual source of truth.

When implementing UI:
- Match Figma spacing and hierarchy.
- Use reusable tokens.
- Avoid one-off visual values.
- Build reusable components instead of copying screens.
- Document intentional deviations from Figma.
