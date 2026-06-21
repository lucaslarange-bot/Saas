import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 30;

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req) {
  try {
    const { nom, secteur, description, ton, palette } = await req.json();

    if (!nom || !description) {
      return Response.json({ error: "Champs manquants." }, { status: 400 });
    }

    const prompt = `Tu es un expert en contenu web. Génère le contenu texte pour ce site en format JSON STRICT.

Business : "${nom}"
Secteur : ${secteur}
Description : ${description}
Ton : ${ton}

Réponds UNIQUEMENT avec ce JSON, rien avant ni après (pas de \`\`\`json, pas de backticks) :
{
  "tagline": "badge court, 2-4 mots",
  "heroTitle": "titre accrocheur principal, 6-12 mots",
  "heroSubtitle": "sous-titre, 1-2 phrases",
  "aboutTitle": "titre section à propos",
  "aboutText": "2-3 phrases de présentation",
  "services": [
    {"title": "service 1", "desc": "1 phrase"},
    {"title": "service 2", "desc": "1 phrase"},
    {"title": "service 3", "desc": "1 phrase"}
  ],
  "ctaText": "texte bouton principal, 2-4 mots",
  "contactTitle": "titre section contact"
}`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 800,
      messages: [{ role: "user", content: prompt }],
    });

    let raw = message.content.find((b) => b.type === "text")?.text || "";
    raw = raw.trim();

    let content;
    try {
      content = JSON.parse(raw);
    } catch (e) {
      console.error("JSON parse error:", raw);
      return Response.json(
        { error: "Réponse IA invalide (JSON non parsable)." },
        { status: 502 }
      );
    }

    return Response.json({
      success: true,
      content,
      palette: palette.colors,
    });
  } catch (err) {
    console.error("Error:", err);
    return Response.json(
      { error: err?.message || "Erreur serveur." },
      { status: 500 }
    );
  }
}
