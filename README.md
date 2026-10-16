# Terratora

A bespoke strategy and transformation website with a Supabase CMS, journal, enquiry capture, session booking, and email notifications.

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

The public website works immediately using built-in preview content. Contact, bookings, authentication, and publishing require Supabase.

## Connect the backend

1. Create a Supabase project and run `supabase/schema.sql` in its SQL editor.
2. Add the project URL, anon key, and service-role key to `.env.local`.
3. Create an email/password user in Supabase Authentication.
4. Run the promotion query at the bottom of `supabase/schema.sql`, using that user's email.
5. Visit `/admin` and sign in.

For an existing project, run these migrations in order:

1. `supabase/migrations/20261007_admin_users_roles_permissions.sql` before opening the new **Users** section. Existing CMS administrators are promoted to Owner by this migration.
2. `supabase/migrations/20261008_site_analytics.sql` to enable consent-based visit and page-view reporting on the admin dashboard.
3. `supabase/migrations/20261014_newsletter_subscriptions.sql` to add subscribers, newsletter delivery history and the newsletter permission.
4. `supabase/migrations/20261016_admin_workflows_and_geo_analytics.sql` to add newsletter drafts and scheduling, provider settings, and approximate visitor location analytics.

The service-role key is server-only and must never be prefixed with `NEXT_PUBLIC_`.

## Email notifications

Create a Resend API key, verify your sending domain, then set `RESEND_API_KEY`, `NOTIFICATION_EMAIL`, and `EMAIL_FROM`. Enquiries and bookings are saved even if email delivery is unavailable. Newsletters require both `RESEND_API_KEY` and a verified `EMAIL_FROM`; subscriber contacts are synchronised to a dedicated Resend segment when a newsletter is sent or scheduled. Resend handles scheduled delivery, while each recipient keeps a private link to confirm unsubscribe and data deletion. You may optionally set `RESEND_SEGMENT_ID` to reuse an existing segment; otherwise the application creates and remembers one automatically.

## Deployment

Deploy to Vercel, add every value from `.env.example` in the project settings, and set `SITE_URL=https://www.terratoraconsulting.com`. It is read only on the server and does not need the `NEXT_PUBLIC_` prefix.
