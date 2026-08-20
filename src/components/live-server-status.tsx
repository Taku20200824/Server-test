"use client";

import { useEffect, useState } from "react";
import { Activity, Database, MapPin } from "lucide-react";
import { doc, onSnapshot } from "firebase/firestore";
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
    if (!db) return;

    return onSnapshot(doc(db, "serverStatus", "main"), (snapshot) => {
      if (!snapshot.exists()) return;

      const data = snapshot.data();
      setServer({
        serverName: String(data.serverName || fallback.serverName),
        status: String(data.status || fallback.status),
        ip: String(data.ip || data.endpoint || fallback.ip),
        port: typeof data.port === "number" || typeof data.port === "string" ? data.port : fallback.port,
        location: String(data.location || data.Location || fallback.location),
        onlinePlayers: Number(data.onlinePlayers ?? data.completed ?? fallback.onlinePlayers),
        maxPlayers: Number(data.maxPlayers ?? data.total ?? fallback.maxPlayers),
        map: String(data.map || data.module || fallback.map),
        version: String(data.version || fallback.version),
      });
    });
  }, [fallback]);

  const isReady = ["ready", "online", "active"].includes(server.status.toLowerCase());

  return (
    <section id="status" className="statusBand">
      <div className={`statusCard ${isReady ? "online" : "offline"}`}>
        <Activity size={20} />
        <div>
          <span>Status</span>
          <strong>{server.status}</strong>
        </div>
      </div>
      <div className="statusCard">
        <Database size={20} />
        <div>
          <span>{server.map}</span>
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
