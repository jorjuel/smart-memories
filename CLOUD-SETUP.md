# Smart Memories V7 cloud setup
1. Create a Supabase project.
2. Open SQL Editor and run `supabase-setup.sql`.
3. In Supabase Project Settings/API, copy the Project URL and service-role secret key.
4. Locally, copy `.env.example` to `.env.local` and fill in the two values.
5. Run `npm.cmd install`, then `npm.cmd run build`, then `npm.cmd run dev`.
6. In Vercel > project > Settings > Environment Variables, add the same two variables. Treat `SUPABASE_SERVICE_ROLE_KEY` as Secret. Redeploy.
7. Create a NEW memory. Old browser-only memory codes are not automatically migrated.
