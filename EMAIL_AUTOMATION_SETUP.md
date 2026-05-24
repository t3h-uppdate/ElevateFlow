# Email Automation Setup (Resend Inbound)

Denna guide visar hur du sätter upp tvåvägs e-postkonversation med din AI-agent.

## 1. Aktivera Inbound Emails i Resend

1. Gå till [Resend Dashboard](https://resend.com)
2. Skapa en ny domän (eller använd befintlig)
3. Gå till **Inbound** → Aktivera Inbound Emails
4. Skapa en **Inbound Endpoint** och peka den mot:
   ```
   https://din-domän.se/api/webhook/email
   ```

## 2. Lägg till i .env.local

```env
RESEND_DOMAIN=din-domän.se
```

## 3. Hur det fungerar

- När en lead kommer in → AI skickar första e-post (via `/api/lead`)
- När kunden svarar på mailet → Resend skickar det till din webhook
- AI genererar svar och skickar tillbaka automatiskt
- Allt sparas i databasen (samma som SMS)

## 4. Rekommendationer

- Använd samma `from`-adress som du skickar ut med
- Se till att `RESEND_DOMAIN` matchar din verifierade domän
- Testa flödet med ett riktigt mejl

Nu har du både **SMS** och **Email** automation igång!