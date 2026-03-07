# Initial Next.js & Mapbox Scaffold

## Description
This pull request introduces the foundational frontend architecture for the BuffQuest project. The `frontend/` directory has been completely reinitialized with a clean Next.js boilerplate utilizing the App Router, TailwindCSS, and Mapbox GL JS for our location-based quest boards.

## Changes Included
- **Clean slate Next.js**: Reinitialized `frontend` with Next.js App Router and TypeScript to replace the previously empty boilerplate.
- **Tailwind Setup**: Added PostCSS and Tailwind dependencies correctly formatted for Next 15 component styling.
- **Mapbox & React Map GL Integration**: Added dependencies to display the fullscreen map centered around the CU Boulder canvas.
- **`MapMockup.tsx` Component**: Designed the initial prototype view including:
  - Sticky header overlay with mocked Credits (250) and Notoriety score (12).
  - Configured Mapbox styling using `mapbox/outdoors-v12`.
  - Displayed 3 interactive dummy map markers ("📍") simulating active quests in CU Boulder bounding boxes (Norlin Library, etc).
  - Floating Action Button to mock the "Create Quest" (`+ POST QUEST`) entry flow.
- **`page.tsx` integration**: Mounted the `MapMockup` directly to the `app/page` root.
- **Environment variables**: Added `.env.local` to securely house the `NEXT_PUBLIC_MAPBOX_TOKEN` and provided warning UI rendering if the token is missing.

## Instructions to Test
1. Pull this branch and navigate to `cd frontend`.
2. Grab a free Mapbox token and replace `YOUR_MAPBOX_TOKEN_HERE` in `frontend/.env.local` (Create the file if not pulled locally).
3. Run `npm install` and `npm run dev` to start the local webserver.
4. Visit `localhost:3000` to interact with the map, click the simulated quests, and test map zoom/scrolling around Boulder.

## Related Tasks
Closes: [Phase 2: Scaffold Next.js frontend with TailwindCSS and map out initial routing]
Closes: [Phase 4: Integrate Mapbox GL JS on the frontend]
