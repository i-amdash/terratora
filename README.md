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

The service-role key is server-only and must never be prefixed with `NEXT_PUBLIC_`.

## Email notifications

Create a Resend API key, verify your sending domain, then set `RESEND_API_KEY`, `NOTIFICATION_EMAIL`, and `EMAIL_FROM`. Enquiries and bookings are saved even if email delivery is unavailable.

## Deployment

Deploy to Vercel, add every value from `.env.example` in the project settings, and set `SITE_URL` to the production domain. It is read only on the server and does not need the `NEXT_PUBLIC_` prefix.
