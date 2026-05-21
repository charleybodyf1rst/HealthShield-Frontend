import CampaignDetailClient from './CampaignDetailClient';

export function generateStaticParams() {
  return [{ id: '_' }];
}

export default function CampaignDetailPage() {
  return <CampaignDetailClient />;
}
