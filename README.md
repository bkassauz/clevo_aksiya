# Clevo Telegram Mini App + Admin

1. Supabase: yangi project -> SQL Editor -> `supabase/schema.sql` ni ishga tushiring.
2. Project Settings -> API: `Project URL` va `service_role` kalitni oling.
3. GitHub'ga yuklang -> Vercel'da import qiling -> Environment Variables:
   SUPABASE_URL, SUPABASE_SERVICE_KEY, SESSION_SECRET, ADMIN_LOGIN, ADMIN_PASSWORD (.env.example'ga qarang).
4. Deploy tugagach `https://SIZNING-DOMEN.vercel.app/admin` ga kiring -> Bot nazorati -> BotFather tokenini kiriting.
5. Kodlar bo'limida kod yarating (CSV: kod + QR havolasi), QR kodlarni chop eting.
