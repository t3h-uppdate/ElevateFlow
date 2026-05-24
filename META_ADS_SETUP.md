# Meta Lead Ads + ElevateFlow AI – Setup Guide

Denna guide visar hur du kopplar Meta Lead Ads till din AI-agent.

## Steg 1: Skapa en Facebook App

1. Gå till [Meta for Developers](https://developers.facebook.com/)
2. Skapa en ny app → **Business** typ
3. Lägg till produkten **Webhooks**

## Steg 2: Konfigurera Webhook

1. I din Facebook App → **Webhooks**
2. Välj **Lead Ads** som objekt
3. Sätt **Callback URL** till:
   ```
   https://din-domän.se/api/webhook/meta
   ```
4. Sätt **Verify Token** till en hemlig sträng (t.ex. `elevateflow-meta-2025`)
5. Lägg till följande fält:
   - `leadgen`
   - `leadgen_id`

## Steg 3: Lägg till Verify Token i .env

Lägg till i `.env.local`:

```env
META_WEBHOOK_VERIFY_TOKEN=elevateflow-meta-2025
```

## Steg 4: Konfigurera Lead Form i Meta Ads

1. Gå till **Meta Business Suite** → **Event Manager**
2. Skapa eller välj ett Lead Form
3. Se till att formuläret innehåller:
   - Namn
   - Telefonnummer
   - E-post (valfritt)
   - Eventuella extra fält (projektbeskrivning, tjänst etc.)

## Steg 5: Testa

1. Skapa en test-lead via Meta Lead Ads Preview
2. Kolla att din AI-agent skickar ett SMS inom sekunder

## Tips

- Använd **Instant Forms** för snabbast respons
- Se till att `companyId` är korrekt i `meta/route.ts`
- Du kan skapa flera webhooks för olika företag

## Felsökning

- Kolla Meta App Dashboard → Webhooks → Logs
- Kolla dina server logs för fel

---

Nu kan du köra Meta Ads och låta din AI-agent hantera alla leads automatiskt!