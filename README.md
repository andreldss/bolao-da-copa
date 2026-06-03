# Bolão da Copa - World Cup Pool

A World Cup 2026 prediction pool to play with friends. You sign in with Google, create or join a group through an invite link, predict match scores, and follow the group ranking. Results come in on their own as the games happen.

## How it works

- You sign in with Google, no password.
- Anyone can create a group (up to 5 per person). The group has an invite link, and you can also join by typing the code right on the home page.
- The owner decides whether the group is open or closed, and can delete it. Anyone who is not the owner can leave whenever they want.
- Inside a group, each person predicts the score of every match. The prediction locks at the match kickoff time.
- Matches are split into open and finished. Finished ones show the official score next to your prediction.
- If you are in more than one group, you can copy your predictions from one group to another in one go.
- Other people's predictions only show up after the match starts.
- The ranking and the member list live on the group page itself, in tabs. When a match ends, points are calculated and the ranking updates.

Scoring:

- Exact score: 3 points
- Right result only (winner or draw): 1 point
- Wrong: 0

The values live in `lib/scoring.ts` if you want to change them.

## Tech

- Next.js (App Router) and TypeScript
- Tailwind CSS
- Supabase (Postgres and Google sign-in)
- Deployed on Vercel
- Matches and results from the openfootball project (`worldcup.json`)
- GitHub Actions to update results automatically

## Running locally

You need Node 18.18 or newer.

1. Install the dependencies:
```bash
   npm install
```
2. Create a Supabase project and run the table SQL in the SQL Editor (see the Database section).
3. In Supabase, under Authentication > Providers, enable Google and fill in the Client ID and Secret (created in the Google Cloud Console). Under Authentication > URL Configuration, set the Site URL and add `http://localhost:3000/**` to the Redirect URLs.
4. Create a `.env.local` file in the root (see Environment variables).
5. Run it:
```bash
   npm run dev
```
6. Open http://localhost:3000, sign in with Google, and import the matches once by opening http://localhost:3000/api/import.

## Environment variables

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
CRON_SECRET=
```

- The first two come from Settings > API in Supabase (the URL and the public key).
- The `SUPABASE_SERVICE_ROLE_KEY` is the secret key (same place). It only runs on the server and never reaches the browser.
- The `CRON_SECRET` is any random string. It protects the route that imports results.

Do not put the real values in the repository. In production these same variables go in the Vercel dashboard, under Settings > Environment Variables, since `.env.local` is not committed.

## Database

There are five tables in Supabase:

- `profiles`: one row per user, with the display name. Created automatically on first sign-in.
- `groups`: the pools. Holds the name, invite code, whether it is open or closed, and who the owner is.
- `group_members`: who belongs to each group.
- `matches`: the World Cup games (teams, kickoff time, score, status). The same for every group.
- `predictions`: the predictions, tied to a group, a player and a match.

Reading matches is allowed for anyone signed in. The groups and predictions tables are only accessed by the server (the routes in `app/api`), which checks who the user is and what they are allowed to do before writing.

## Matches and results

The matches come from openfootball's `worldcup.json`, which is open and needs no API key. The `app/api/import` route downloads that file and inserts or updates the matches in the database. Running it again updates the scores of games that already happened.

To avoid doing this by hand, there is a GitHub Action at `.github/workflows/import.yml` that calls this route every 30 minutes. It sends the `CRON_SECRET` in the header, and in production the route only accepts the request if the secret matches.

openfootball's scores can take a while to show up after the final whistle. If you need to fix one right away, you can edit `home_score`, `away_score` and `status` directly in the `matches` table in Supabase.

## Deploy

Deployment is on Vercel, connected to the repository. Every push to the `main` branch publishes production.

To make it work in production:

- Add the four environment variables in the Vercel dashboard.
- In Supabase, add the production URL (`https://your-app.vercel.app/**`) to the Redirect URLs.
- In `.github/workflows/import.yml`, use the production URL in the `curl` call.
- Create the `CRON_SECRET` secret in GitHub, under Settings > Secrets and variables > Actions, with the same value as in Vercel.

## Structure

```
app/          screens and routes (home, groups, predictions, ranking) and the API routes
components/   UI components (forms, buttons, lists)
lib/          Supabase connection, match import, scoring and helpers
public/       PWA icons and service worker
.github/      the Action that updates results
```
