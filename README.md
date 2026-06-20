# SiteGen — SaaS de génération de sites par IA

## 1. Tester en local

```bash
npm install
cp .env.example .env.local
# Mets ta clé API Anthropic dans .env.local
npm run dev
```

Ouvre http://localhost:3000

## 2. Déployer sur Vercel (recommandé, gratuit)

1. Crée un repo GitHub et pousse ce dossier dedans :
   ```bash
   git init
   git add .
   git commit -m "SiteGen v1"
   git remote add origin https://github.com/TON_USER/sitegen.git
   git push -u origin main
   ```

2. Va sur https://vercel.com → "Add New Project" → connecte ton repo GitHub

3. Dans les "Environment Variables" du projet Vercel, ajoute :
   - `ANTHROPIC_API_KEY` = ta clé API (récupérée sur console.anthropic.com)

4. Clique "Deploy". En 1-2 minutes, ton site est en ligne sur une URL `*.vercel.app`

## 3. Brancher ton propre nom de domaine

Dans Vercel → ton projet → Settings → Domains → ajoute ton domaine (acheté sur Namecheap, OVH, etc.) et suis les instructions DNS affichées.

## 4. Pour ajouter un paywall (Stripe)

Une fois que tu as des premiers clients beta validés, on ajoute :
- Stripe Checkout pour le paiement
- Une limite de générations gratuites par utilisateur (stockée en base, ex: Supabase ou Vercel KV)

Demande-moi quand tu es prêt pour cette étape.
