import "./globals.css";

export const metadata = {
  title: "Portfolio — A Letter From Jefrin M S A",
  description: "A vintage letter-style portfolio. Crafting digital experiences, one line at a time.",
  keywords: ["portfolio", "developer", "vintage", "letter"],
  authors: [{ name: "Jefrin M S A" }],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Courier+Prime:ital,wght@0,400;0,700;1,400;1,700&family=IM+Fell+English:ital@0;1&family=Special+Elite&family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
