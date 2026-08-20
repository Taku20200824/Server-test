import { ChevronRight, Database, RadioTower, Search, ShieldCheck, UserPlus } from "lucide-react";
import { EmployeeFirebasePanel } from "@/components/employee-firebase-panel";
import { LiveServerStatus } from "@/components/live-server-status";
import { features, serverStatusFallback, site, stats } from "@/lib/site-data";

const navItems = [
  ["Status", "#status"],
  ["Register", "#register"],
  ["Search", "#search"],
  ["IRIS", "#iris"],
];

export default function Home() {
  return (
    <main>
      <header className="nav">
        <a className="brand" href="#top" aria-label="Home">
          <span className="brandMark">ST</span>
          <span>{site.name}</span>
        </a>
        <nav aria-label="Primary navigation">
          {navItems.map(([item, href]) => (
            <a key={item} href={href}>{item}</a>
          ))}
        </nav>
        <a className="serviceButton" href="#status">Live</a>
      </header>

      <section id="top" className="hero">
        <div className="heroBackdrop" />
        <div className="heroInner">
          <p className="eyebrow"><RadioTower size={16} /> Firebase connected Server-test</p>
          <h1>{site.name}</h1>
          <p className="heroText">
            Employee registration, user search, and IRIS/Laravel test work are kept as the site's main purpose. Registration and user data are stored in Firebase.
          </p>
          <div className="heroActions">
            <a className="primaryAction" href="#register">Open register flow <ChevronRight size={18} /></a>
            <a className="secondaryAction" href="#status"><Database size={18} /> {site.endpoint}</a>
          </div>
        </div>
      </section>

      <LiveServerStatus fallback={serverStatusFallback} />

      <section id="register" className="gridSection" aria-label="Server-test overview">
        <div className="sectionLead">
          <p className="eyebrow">Project Control</p>
          <h2>社員登録と検索のServer-testに戻しました。</h2>
          <p>
            Repository content points to IRIS class samples, Laravel front-end work, barcode handling, mobile API registration, and user search. The live register panel writes user data to Firebase Firestore.
          </p>
        </div>
        <div className="featureGrid">
          {features.map((feature, index) => {
            const Icon = [UserPlus, Search, ShieldCheck][index] ?? ShieldCheck;
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

      <EmployeeFirebasePanel />

      <section id="search" className="statsBand">
        {stats.map(([label, value]) => (
          <div key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </section>

      <section id="iris" className="contentBand">
        <div>
          <p className="eyebrow">IRIS / Laravel</p>
          <h2>Repository content decides the site.</h2>
        </div>
        <ul>
          <li>社員登録 samples stay the main direction.</li>
          <li>User search and barcode/API files are represented as app functions.</li>
          <li>Firebase is separate and stores status plus employee user data.</li>
        </ul>
      </section>

      <footer>
        <span>{site.name}</span>
        <span>Vercel + Next.js + Firebase server-test-ef8cb</span>
      </footer>
    </main>
  );
}
