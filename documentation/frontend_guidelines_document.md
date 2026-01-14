# Frontend Guideline Document

## 1. Frontend Architecture

### Overview
We build our Local Archive Web App on Next.js (App Router) and React. This gives us:
- File-based routing out of the box
- Built-in support for server and client components
- Automatic code splitting and optimized builds
- TypeScript safety throughout

Under the hood, we use:
- **React** for interactive UIs
- **Next.js App Router** for page structure and data fetching
- **Tailwind CSS** for rapid, utility-first styling
- **shadcn/ui** component library for consistent form, table, and layout elements
- **Better Auth** for multi-role authentication flows
- **Drizzle ORM** (with MySQL) for type-safe database queries

### Scalability, Maintainability, Performance
1. **Scalability**: File-based routing plus modular `app/` and `components/` folders means we can add new features (e.g., more entity pages) without clutter.
2. **Maintainability**: TypeScript + Drizzle ORM types cover both front and back—reducing runtime errors. A clear folder structure (UI vs. business logic vs. API) keeps code organized.
3. **Performance**: Next.js automatically splits code by route and component. We use dynamic imports for heavy components, lazy-loading for offscreen content, and Tailwind’s purge process to strip unused CSS.

## 2. Design Principles

### Usability
- Simple, consistent layouts built with `shadcn/ui` cards and tables
- Clear form labels, validation messages, and inline help text
- Collapsible sidebar that keeps navigation within thumb reach on mobile

### Accessibility
- Semantic HTML (`<header>`, `<nav>`, `<main>`, `<table>`, `<form>`)
- ARIA attributes on custom components (e.g., `aria-expanded` on the sidebar toggle)
- Keyboard-friendly navigation and focus outlines

### Responsiveness
- Mobile-first breakpoints in Tailwind (`sm`, `md`, `lg`, `xl`)
- Flexible grid layouts for tables and forms
- Hamburger-style sidebar toggle on small screens

## 3. Styling and Theming

### Styling Approach
- Utility-first with **Tailwind CSS** (no BEM/SMACSS—Tailwind classes handle scope)
- CSS variables (`:root`) for theme colors and easy overrides
- `dark:` variant in Tailwind for dark mode styles

### Theming
- Two themes: **Light** (default) and **Dark**
- Toggle component stores preference in `localStorage` and React Context
- Tailwind config defines `theme.extend.colors` and `darkMode: 'class'`

### Visual Style
- **Modern flat design**: clean surfaces, subtle shadows, clear typography
- Cards and modals use slight border-radius (6px) and minimal drop-shadows

### Color Palette
| Role        | Light Mode       | Dark Mode        |
|-------------|------------------|------------------|
| Background  | #F9FAFB (gray50)  | #111827 (gray900)|
| Surface     | #FFFFFF (white)   | #1F2937 (gray800)|
| Primary     | #3B82F6 (blue500) | #60A5FA (blue400)|
| Secondary   | #6366F1 (indigo500)| #818CF8 (indigo400)|
| Accent      | #10B981 (emerald500)| #34D399 (emerald400)|
| Text High   | #111827 (gray900) | #F9FAFB (gray50) |
| Text Medium | #6B7280 (gray500) | #D1D5DB (gray300)|
| Border      | #E5E7EB (gray200)| #374151 (gray700)|
| Error       | #EF4444 (red500)  | #F87171 (red400)|
| Warning     | #F59E0B (yellow500)| #FBBF24 (yellow400)|

### Fonts
- Primary: **Inter**, fallback to `system-ui, -apple-system, sans-serif`
- Font sizes and line-heights defined in Tailwind’s `theme.fontSize`

## 4. Component Structure

### Organization
- `app/`: Next.js pages and layouts
- `components/`: Feature-agnostic UI (buttons, modals), plus layout helpers
- `components/ui/`: Overrides or extensions of `shadcn/ui` elements
- `lib/`: Auth hooks, API client, utility functions

### Component-Based Benefits
- **Reusability**: Build once (e.g., data table) and reuse across entities
- **Isolation**: Each component owns its logic, markup, and styles
- **Testability**: Small components are easier to unit test

## 5. State Management

### Authentication & Session
- Custom React Context (`AuthContext`) provides current user, roles, and login/logout functions
- Wrapped around the app in `layout.tsx`

### Data Fetching
- **Next.js server components** fetch data with `fetch()` and Drizzle on the server side
- **Client components** use React hooks and can leverage **SWR** or **TanStack Query** for revalidation and caching

### Global UI State
- Theme (light/dark) managed with React Context + `localStorage`
- Sidebar open/close state handled in the Layout component’s local state

## 6. Routing and Navigation

### File-Based Routing
- `/app/sign-in`, `/app/sign-up` for auth
- `/app/dashboard/` is the parent route with nested folders for each entity: `arsip-unit`, `berkas-arsip`, etc.
- Dynamic routes for detail pages: `/dashboard/berkas-arsip/[id]`

### Navigation Components
- **Sidebar**: `components/Sidebar.tsx` with `<Link>` items
- **Breadcrumbs**: optional, built from route segments
- **Header**: contains theme toggle and user menu

## 7. Performance Optimization

- **Automatic Code Splitting**: Next.js splits per page and per dynamic import
- **Lazy Loading**: Use `next/dynamic` for heavy charts or editors
- **Image Optimization**: Use `next/image` for archive thumbnails
- **Asset Minification**: Handled by Next.js (CSS, JS, HTML)
- **Tailwind Purge**: Removes unused classes in production

## 8. Testing and Quality Assurance

### Unit Tests
- **Jest** + **React Testing Library** for components and hooks
- Mock API calls with `msw` (Mock Service Worker)

### Integration Tests
- Test pages with multiple components working together
- Ensure auth flows and role-based UI appear correctly

### End-to-End Tests
- **Cypress** or **Playwright** to cover user journeys:
  - Sign-up → Pending → Superadmin approval → Login
  - CRUD flows for each entity
  - Dark mode toggle

### Continuous Integration
- Run linting (`eslint`), type checks (`tsc --noEmit`), and tests on every pull request

## 9. Conclusion and Overall Frontend Summary

This Frontend Guideline Document lays out a clear, maintainable approach for building our Local Archive Web Application. By leveraging Next.js’s App Router, React, Tailwind CSS, and a component-based design, we achieve a fast, scalable, and consistent user interface. Authentication via Better Auth and type-safe data operations with Drizzle ORM ensure security and reliability. Our design principles—usability, accessibility, and responsiveness—guide each UI decision, while testing and performance optimizations guarantee a high-quality experience. With this foundation, any developer can confidently extend, maintain, and scale the archive system.