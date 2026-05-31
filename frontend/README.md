# HAQMS Frontend - Next.js App Client

This is the Next.js client for the Hospital Appointment & Queue Management System.

## 🚀 Running the Client
The client runs on port `3000` by default.

Start the development server:
```bash
npm run dev
```

Build the production bundle:
```bash
npm run build
```

## 🔍 Technical Architecture
The client codebase is organized into several key modules:
- **State Management**: Uses React Context API for authentication and global session state.
- **Routing**: Implements Next.js App Router with navigation guards.
- **Real-time Sync**: Optimized polling logic for public displays.
- **Performance**: Strategic use of `useEffect` and `useMemo` to minimize re-renders.
- **Data Safety**: Hardened component logic with optional chaining and fallback rendering.
