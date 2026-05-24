# ElevateFlow AI

AI-driven lead-kvalificering via SMS och E-post för hantverksföretag.

## Funktioner

- **Dynamisk AI-agent** – Anpassar sig automatiskt efter valda tjänster per företag
- **SMS + Email automation** (tvåvägskonversation)
- **Meta Ads integration**
- **Automatisk sammanfattning** till hantverkaren
- **Admin-gränssnitt** för Musse att hantera företag + tjänster
- **API-nycklar** per företag

## Setup

```bash
cp .env.example .env.local
npm install
```

Kör Supabase-migreringar:
- `supabase/schema.sql`
- `supabase/api_keys.sql`
- `supabase/add_services_column.sql`
- `supabase/row_level_security_v2.sql`

Starta Inngest:
```bash
npx inngest dev
```

Starta appen:
```bash
npm run dev
```

## Viktiga Sidor

- `/admin/companies` – Hantera företag och tjänster
- `/dashboard` – Översikt över leads
- `/test-lead` – Testa AI-agenten

## Struktur

- `agent.md` → Systemprompt (tjänsteanpassad)
- `app/api/lead` → Första kontakt
- `app/api/webhook/sms` + `email` → Inkommande konversationer
- `inngest/functions` → Retry + Sammanfattningar
- `components/ui` → shadcn/ui-komponenter

## Teknik

- Next.js + TypeScript
- Supabase (databas + auth)
- Claude 3.5 Sonnet
- Twilio + Resend
- Inngest (bakgrundsjobb)
- shadcn/ui + Tailwind

---

**Redo för demo.**