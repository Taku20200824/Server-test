"use client";

import { useEffect, useState } from "react";
import { Activity, MapPin, Users } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

type ServerStatus = {
  serverName: string;
  status: string;
  ip: string;
  port: number | string;
  location: string;
  onlinePlayers: number;
  maxPlayers: number;
  map: string;
  version: string;
};

type LiveServerStatusProps = {
  fallback: ServerStatus;
};

export function LiveServerStatus({ fallback }: LiveServerStatusProps) {
  const [server, setServer] = useState<ServerStatus>(fallback);

  useEffect(() => {
    let mounted = true;

    async function loadServerStatus() {
      if (!db) return;

      const snapshot = await getDoc(doc(db, "serverStatus", "main"));
      if (!mounted || !snapshot.exists()) return;

      const data = snapshot.data();
      setServer({
        serverName: String(data.serverName || fallback.serverName),
        status: String(data.status || fallback.status),
        ip: String(data.ip || fallback.ip),
        port: typeof data.port === "number" || typeof data.port === "string" ? data.port : fallback.port,
        location: String(data.location || data.Location || fallback.location),
        onlinePlayers: Number(data.onlinePlayers ?? fallback.onlinePlayers),
        maxPlayers: Number(data.maxPlayers ?? fallback.maxPlayers),
        map: String(data.map || fallback.map),
        version: String(data.version || fallback.version),
      });
    }

    loadServerStatus().catch(() => undefined);

    return () => {
      mounted = false;
    };
  }, [fallback]);

  const isOnline = server.status.toLowerCase() === "online";

  return (
    <section id="server" className="statusBand">
      <div className={`statusCard ${isOnline ? "online" : "offline"}`}>
        <Activity size={20} />
        <div>
          <span>Status</span>
          <strong>{server.status}</strong>
        </div>
      </div>
      <div className="statusCard">
        <Users size={20} />
        <div>
          <span>Players</span>
          <strong>{server.onlinePlayers}/{server.maxPlayers}</strong>
        </div>
      </div>
      <div className="statusCard">
        <MapPin size={20} />
        <div>
          <span>{server.location}</span>
          <strong>{server.ip}:{server.port}</strong>
        </div>
      </div>
    </section>
  );
}
