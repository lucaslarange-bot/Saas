import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 60;

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req) {
  try {
    const { nom, secteur, description, ton, palette } = await req.json();

    if (!nom || !description) {
      return Response.json({ error: "Champs manquants." }, { status: 400 });
    }

    const prompt = `Crée un site web complet en un seul fichier HTML (HTML+CSS+JS inline, aucune dépendance externe sauf Google Fonts via lien CDN si besoin).

Business : "${nom}"
Secteur : ${secteur}
Description du business : ${description}
Ton souhaité : ${ton}
Palette de couleurs à utiliser (respecte-la strictement) : fond ${palette.colors[0]}, texte/contraste ${palette.colors[1]}, accent ${palette.colors[2]}

CONTRAINTE TECHNIQUE CRITIQUE : le CSS doit être MINIMALISTE. Maximum 100 lignes de CSS au total. Utilise des classes utilitaires réutilisables plutôt qu'une règle par élément (ex: une seule classe ".btn" réutilisée, pas ".btn-primary" + ".btn-secondary" + ".btn-cta" séparées). Pas de commentaires dans le CSS. Pas d'animations complexes au scroll (juste des transitions CSS simples au survol si besoin). N'utilise PAS de variables CSS avec des dizaines de couleurs : seulement 3 variables (bg, text, accent).

Structure HTML requise (sois concis dans le HTML aussi, pas de sur-structuration) :
1. Header avec logo + navigation simple
2. Hero avec titre et sous-titre écrits spécifiquement pour ce business (pas de lorem ipsum)
3. Section présentation/à propos courte
4. Section services ou produits (3 items max, cohérents avec le secteur)
5. Section contact avec formulaire simple (nom, email, message)
6. Footer simple

PRIORITÉ ABSOLUE : le document HTML doit être ENTIÈREMENT COMPLET, avec la balise </html> à la toute fin. Un site simple mais complet est INFINIMENT préférable à un site détaillé mais coupé. Si tu sens que tu manques de place, simplifie encore plus le CSS et le HTML, jamais l'inverse.

Réponds UNIQUEMENT avec le code HTML complet, sans aucun texte avant ou après, sans balises markdown \`\`\`.`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 6000,
      messages: [{ role: "user", content: prompt }],
    });

    let text = message.content.find((b) => b.type === "text")?.text || "";
    text = text.replace(/```html|```/g, "").trim();

    if (!text.startsWith("<")) {
      return Response.json({ error: "Réponse IA invalide." }, { status: 502 });
    }

    if (!text.includes("</html>")) {
      return Response.json(
        { error: "Le site généré a été coupé (trop long). Réessaie, le prompt a été ajusté pour éviter ça." },
        { status: 502 }
      );
    }

    return Response.json({ html: text });
  } catch (err) {
    console.error(err);
    return Response.json({ error: err?.message || "Erreur serveur." }, { status: 500 });
  }
}
