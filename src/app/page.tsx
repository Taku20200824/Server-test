import { Activity, ChevronRight, Copy, MapPin, RadioTower, Shield, Trophy, Users } from "lucide-react";
import { features, site, stats } from "@/lib/site-data";

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

      <section id="server" className="statusBand">
        <div className="statusCard online">
          <Activity size={20} />
          <div>
            <span>Status</span>
            <strong>Firebase ready</strong>
          </div>
        </div>
        <div className="statusCard">
          <Users size={20} />
          <div>
            <span>Capacity</span>
            <strong>32 players</strong>
          </div>
        </div>
        <div className="statusCard">
          <MapPin size={20} />
          <div>
            <span>Location</span>
            <strong>{site.location}</strong>
          </div>
        </div>
      </section>

      <section className="gridSection" aria-label="Server overview">
        <div className="sectionLead">
          <p className="eyebrow">Community Control Center</p>
          <h2>Built like THE-ISLE, ready for a separate Firebase project.</h2>
          <p>
            This repo now has the Vercel app shell, Firebase web config path, Firestore rules, and environment template needed to connect a brand-new Firebase project.
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
        <span>Vercel + Next.js + separate Firebase project</span>
      </footer>
    </main>
  );
}
