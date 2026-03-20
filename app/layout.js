import "./globals.css";

export const metadata = {
  title: "ZapTools — Free Tools for Creators & Builders",
  description: "5 free tools for creators, builders and hustlers. QR Generator, Hashtag Generator, Domain Checker, Resume Builder & File Share QR. No signup needed.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cabinet+Grotesk:wght@400;500;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}