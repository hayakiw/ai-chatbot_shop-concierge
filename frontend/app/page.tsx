import Link from "next/link";

export default function HomePage() {
  return (
    <main style={{ padding: 24 }}>
      <h1><Link href="/chat" style={linkStyle}>AIコンシェルジュ</Link></h1>
    </main>
  );
}

const linkStyle: React.CSSProperties = {
  color: "#333",
};
