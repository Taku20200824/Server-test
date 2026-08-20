import { DiscordPageContent } from "@/components/discord-page-content";
import { getDiscordCommunity } from "@/lib/integrations/discord";

export default async function DiscordPage() {
  const discord = await getDiscordCommunity();

  return <DiscordPageContent discord={discord} />;
}
