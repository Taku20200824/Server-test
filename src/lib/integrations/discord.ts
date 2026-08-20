import { siteConfig } from "@/data/site";
import { getFirestoreStaff } from "@/lib/firebase/firestore-data";
import { getServerStatusOrInitial } from "@/lib/firebase/server-status";

export async function getDiscordCommunity() {
  const [staff, serverStatus] = await Promise.all([getFirestoreStaff(), getServerStatusOrInitial()]);

  return {
    invite: serverStatus.discordUrl || siteConfig.discordInvite,
    serverId: serverStatus.discordServerId || "792269772473106452",
    staff,
    onlineModerators: staff.filter((member) => ["Owner", "Administrator", "Moderator"].includes(member.role)).length
  };
}
