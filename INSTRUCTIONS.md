# FORCE REBUILD INSTRUCTIONS

## Overview
This package contains modifications designed to force Vercel to rebuild and use your updated StrategicCourtroom component. The core issue is likely with Vercel's caching mechanism, which is sometimes very aggressive, especially with JavaScript bundles.

## Key Changes in This Package:

1. **Modified StrategicCourtroom Component**:
   - Added highly visible red banner showing "UPDATED VERSION"
   - Added timestamp comments that force the build system to see this as a new file
   - Maintained all original functionality and features

2. **Anti-Cache vercel.json**:
   - Added strict no-cache headers for all files
   - Added unique build ID and timestamp to force full rebuilds
   - Disabled asset caching completely

## Deployment Steps:

1. **Replace these files**:
   - `src/components/game/StrategicCourtroom.tsx` (Modified with visual indicators)
   - `vercel.json` (Modified with cache busting settings)

2. **Force a full rebuild in Vercel**:
   - In your Vercel project dashboard, go to Settings → General
   - Find the "Build & Development Settings" section
   - Click on "Clear build cache and deploy"
   - Alternatively, you can redeploy with the "FORCE" option

3. **Verify the changes**:
   - After deployment, you should see a red banner at the top of the courtroom page saying "UPDATED VERSION"
   - This confirms the new code is actually being deployed and served

## If This Still Doesn't Work:

Try the last resort option:
1. Create a new Vercel project
2. Connect it to your repository
3. Deploy the new project with a new URL

This bypasses any persistent caching issues with the existing deployment.