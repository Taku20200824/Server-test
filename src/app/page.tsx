import { ChevronRight, Copy, RadioTower, Shield, Trophy, Users } from "lucide-react";
import { LiveServerStatus } from "@/components/live-server-status";
import { features, serverStatusFallback, site, stats } from "@/lib/site-data";

const navItems = ["Server", "Rules", "Dinosaurs", "Map", "Leaderboard", "Events"];

export default function Home() {
  return (
    <main>
      <header className="nav">
        <a className="brand" href="#top" aria-label="Home">
          <span className="brandMark">TI</span>
          <span>{site.name}</span>
        </a>
        <nav aria-label="Primary navigation">
          {navItems.map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`}>{item}</a>
          ))}
        </nav>
        <a className="discordButton" href={site.discordUrl}>Discord</a>
      </header>

      <section id="top" className="hero">
        <div className="heroBackdrop" />
        <div className="heroInner">
          <p className="eyebrow"><RadioTower size={16} /> The Isle Evrima Asia Community</p>
          <h1>{site.name}</h1>
          <p className="heroText">
            A survival, PvP, nesting, events, and regional coordination hub for players across Japan, Mongolia, Korea, Hong Kong, Taiwan, Singapore, and Southeast Asia.
          </p>
          <div className="heroActions">
            <a className="primaryAction" href={site.discordUrl}>Join Discord <ChevronRight size={18} /></a>
            <a className="secondaryAction" href="#server"><Copy size={18} /> {site.serverIp}:{site.serverPort}</a>
          </div>
        </div>
      </section>

      <LiveServerStatus fallback={serverStatusFallback} />

      <section className="gridSection" aria-label="Server overview">
        <div className="sectionLead">
          <p className="eyebrow">Community Control Center</p>
          <h2>Built like THE-ISLE, connected to Firebase serverStatus/main.</h2>
          <p>
            The homepage now reads Firestore data from the Firebase document you opened, while still falling back to safe default values when Firebase variables are missing.
          </p>
        </div>
        <div className="featureGrid">
          {features.map((feature, index) => {
            const Icon = [Users, Shield, Trophy][index] ?? Shield;
            return (
              <article className="featureCard" key={feature.title}>
                <Icon size={24} />
                <h3>{feature.title}</h3>
                <p>{feature.body}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section id="leaderboard" className="statsBand">
        {stats.map(([label, value]) => (
          <div key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </section>

      <section id="rules" className="contentBand">
        <div>
          <p className="eyebrow">Rules</p>
          <h2>Clean survival rules, fast admin updates.</h2>
        </div>
        <ul>
          <li>No cheating, exploiting, harassment, or stream sniping.</li>
          <li>Respect nesting, events, staff calls, and regional players.</li>
          <li>Use Discord for reports, support, announcements, and community coordination.</li>
        </ul>
      </section>

      <footer>
        <span>{site.name}</span>
        <span>Vercel + Next.js + Firebase Firestore</span>
      </footer>
    </main>
  );
}
