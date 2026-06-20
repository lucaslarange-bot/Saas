import Anthropic from "@anthropic-ai/sdk";

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

Exigences :
- Site complet : header avec navigation, hero percutant avec un vrai titre et sous-titre écrits pour CE business précis, section "à propos"/présentation, section services ou produits (3-4 items inventés de façon cohérente avec le secteur), section témoignages ou réassurance, section contact avec un formulaire (sans backend, juste visuel), footer.
- Design soigné, typographie avec hiérarchie claire (Google Fonts), responsive mobile, pas de lorem ipsum, du vrai texte rédigé.
- Pas de bibliothèque externe (pas de Tailwind CDN, pas de React) : du CSS pur dans une balise <style>, MAIS reste CONCIS sur le CSS (pas de commentaires, pas de règles redondantes) pour garantir que le document HTML complet (avec body et tout le contenu) soit généré sans être coupé.
- Anime légèrement au scroll ou au hover si pertinent, sans exagérer, sans dépasser le nécessaire.
- Priorité absolue : le document doit être COMPLET, avec balise </html> finale. Mieux vaut un CSS plus simple mais un site entier, qu'un CSS riche mais un fichier tronqué.
- Réponds UNIQUEMENT avec le code HTML complet, sans aucun texte avant ou après, sans balises markdown \`\`\`.`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 16000,
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
