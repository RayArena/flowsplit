# FlowSplit

FlowSplit is a workflow-focused web application built with Next.js and TypeScript.

## Features

- Modern React app using the Next.js App Router
- Authentication and user management with Clerk
- Flow/graph-style interfaces with `@xyflow/react`
- Form handling and validation with React Hook Form + Zod
- Real-time capabilities with Pusher
- Data visualizations with Recharts
- Image and media integrations via Cloudinary
- OCR support with `tesseract.js`
- State management with Zustand and server-state management with TanStack Query
- Styled with Tailwind CSS and Radix UI primitives

## Tech Stack

- **Framework:** Next.js 15
- **Language:** TypeScript
- **UI:** React 19, Tailwind CSS 4, Radix UI, Framer Motion
- **Auth:** Clerk
- **Data/State:** TanStack Query, Zustand
- **Database:** Mongoose (MongoDB)
- **Realtime:** Pusher + pusher-js
- **Media:** Cloudinary + next-cloudinary
- **Validation & Forms:** Zod + React Hook Form

## Setup / Install

### 1) Clone the repository

```bash
git clone https://github.com/RayArena/flowsplit.git
cd flowsplit
```

### 2) Install dependencies

```bash
npm install
```

### 3) Configure environment variables

Create a `.env.local` file in the project root and add required values.

Example placeholders:

```bash
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Database
MONGODB_URI=

# Pusher
PUSHER_APP_ID=
PUSHER_KEY=
PUSHER_SECRET=
PUSHER_CLUSTER=
NEXT_PUBLIC_PUSHER_KEY=
NEXT_PUBLIC_PUSHER_CLUSTER=

# Cloudinary
CLOUDINARY_URL=
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=

# Optional: app URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> Replace these with your actual values. Check your codebase/config for the exact required variable names in your deployment environment.

### 4) Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

From `package.json`:

- `npm run dev` — start local development server
- `npm run build` — build production bundle
- `npm run start` — run production server
- `npm run lint` — run ESLint

## Usage

1. Configure environment variables.
2. Run `npm run dev`.
3. Open the app in your browser.
4. Authenticate (if required by route/middleware).
5. Create and manage your flows/workspaces in the UI.

## Deployment

FlowSplit can be deployed to any platform that supports Next.js (e.g., Vercel).

### Vercel (recommended)

1. Import the repository into Vercel.
2. Set all required environment variables in Vercel Project Settings.
3. Deploy.

For custom hosting, build and run:

```bash
npm run build
npm run start
```

## License

No license is currently specified in this repository.
