import { MarketingHeader } from "@/components/marketing/header";
import { MarketingFooter } from "@/components/marketing/footer";
import { HealthShieldChatbot } from "@/components/chatbot/healthshield-chatbot";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-black">
      <MarketingHeader />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
      <HealthShieldChatbot />
    </div>
  );
}
