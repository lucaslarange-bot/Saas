import "./globals.css";

export const metadata = {
  title: "SiteGen — Génère ton site en 30 secondes",
  description: "Crée un site web complet pour ton business grâce à l'IA.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
