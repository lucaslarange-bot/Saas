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

    const prompt = `Tu es un rédacteur web. Pour ce business, génère UNIQUEMENT le texte (pas de HTML, pas de CSS) au format JSON strict ci-dessous, rien d'autre avant ou après.

Business : "${nom}"
Secteur : ${secteur}
Description : ${description}
Ton : ${ton}

Réponds avec EXACTEMENT ce format JSON (remplis chaque champ, reste concis) :
{
  "tagline": "un badge court de 2-4 mots (ex: Excellence depuis 2020)",
  "heroTitle": "titre principal accrocheur, 6-12 mots",
  "heroSubtitle": "sous-titre, 1-2 phrases",
  "aboutTitle": "titre section à propos, court",
  "aboutText": "2-3 phrases de présentation du business",
  "services": [
    {"title": "nom service/produit 1", "desc": "1 phrase descriptive"},
    {"title": "nom service/produit 2", "desc": "1 phrase descriptive"},
    {"title": "nom service/produit 3", "desc": "1 phrase descriptive"}
  ],
  "ctaText": "texte du bouton principal (2-4 mots)",
  "contactTitle": "titre section contact, court"
}

Réponds UNIQUEMENT avec ce JSON, sans markdown, sans \`\`\`.`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1200,
      messages: [{ role: "user", content: prompt }],
    });

    let raw = message.content.find((b) => b.type === "text")?.text || "";
    raw = raw.replace(/```json|```/g, "").trim();

    let content;
    try {
      content = JSON.parse(raw);
    } catch {
      return Response.json({ error: "Réponse IA invalide (JSON non parsable)." }, { status: 502 });
    }

    const html = buildSite({ nom, content, palette });
    return Response.json({ html });
  } catch (err) {
    console.error(err);
    return Response.json({ error: err?.message || "Erreur serveur." }, { status: 500 });
  }
}

function esc(s = "") {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function buildSite({ nom, content, palette }) {
  const [bg, text, accent] = palette.colors;
  const c = content;

  const servicesHtml = (c.services || [])
    .map(
      (s) => `
      <div class="card">
        <h3>${esc(s.title)}</h3>
        <p>${esc(s.desc)}</p>
      </div>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(nom)}</title>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Inter',sans-serif;background:${bg};color:${text};line-height:1.7}
  h1,h2,h3{font-family:'Playfair Display',serif;line-height:1.25}
  a{text-decoration:none;color:inherit}
  .wrap{max-width:1100px;margin:0 auto;padding:0 24px}
  header{position:sticky;top:0;background:${bg};border-bottom:1px solid ${text}22;z-index:10}
  header .wrap{display:flex;align-items:center;justify-content:space-between;height:72px}
  .logo{font-family:'Playfair Display',serif;font-weight:700;font-size:1.3rem}
  .badge{display:inline-block;border:1px solid ${accent};color:${accent};font-size:.75rem;letter-spacing:.08em;text-transform:uppercase;padding:.35rem .9rem;border-radius:50px;margin-bottom:1.5rem}
  .hero{padding:6rem 0 5rem;text-align:center}
  .hero h1{font-size:clamp(2rem,5vw,3.2rem);margin-bottom:1.2rem}
  .hero p{font-size:1.05rem;opacity:.75;max-width:560px;margin:0 auto 2rem}
  .btn{display:inline-block;background:${accent};color:${bg};padding:.9rem 2rem;border-radius:6px;font-weight:600;font-size:.9rem;letter-spacing:.03em}
  section{padding:4.5rem 0}
  .about{text-align:center}
  .about h2{font-size:2rem;margin-bottom:1rem}
  .about p{opacity:.75;max-width:600px;margin:0 auto;font-size:1rem}
  .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1.5rem;margin-top:3rem}
  .card{border:1px solid ${text}22;border-radius:10px;padding:2rem}
  .card h3{font-size:1.15rem;margin-bottom:.6rem}
  .card p{opacity:.7;font-size:.92rem}
  .contact{background:${text}0d;text-align:center}
  .contact h2{font-size:1.8rem;margin-bottom:2rem}
  form{max-width:480px;margin:0 auto;display:flex;flex-direction:column;gap:1rem;text-align:left}
  input,textarea{width:100%;background:${bg};border:1px solid ${text}33;border-radius:6px;padding:.85rem 1rem;color:${text};font-family:inherit;font-size:.9rem}
  textarea{min-height:120px;resize:vertical}
  footer{padding:2.5rem 0;text-align:center;font-size:.85rem;opacity:.6;border-top:1px solid ${text}22}
</style>
</head>
<body>
  <header><div class="wrap"><span class="logo">${esc(nom)}</span></div></header>

  <section class="hero">
    <div class="wrap">
      <span class="badge">${esc(c.tagline)}</span>
      <h1>${esc(c.heroTitle)}</h1>
      <p>${esc(c.heroSubtitle)}</p>
      <a href="#contact" class="btn">${esc(c.ctaText)}</a>
    </div>
  </section>

  <section class="about">
    <div class="wrap">
      <h2>${esc(c.aboutTitle)}</h2>
      <p>${esc(c.aboutText)}</p>
    </div>
  </section>

  <section>
    <div class="wrap">
      <h2 style="text-align:center;font-size:1.8rem">Nos services</h2>
      <div class="grid">${servicesHtml}</div>
    </div>
  </section>

  <section class="contact" id="contact">
    <div class="wrap">
      <h2>${esc(c.contactTitle)}</h2>
      <form onsubmit="event.preventDefault();alert('Message envoyé (démo)');">
        <input type="text" placeholder="Votre nom" required>
        <input type="email" placeholder="Votre email" required>
        <textarea placeholder="Votre message" required></textarea>
        <button type="submit" class="btn" style="border:none;cursor:pointer">Envoyer</button>
      </form>
    </div>
  </section>

  <footer>© ${new Date().getFullYear()} ${esc(nom)}. Tous droits réservés.</footer>
</body>
</html>`;
}
