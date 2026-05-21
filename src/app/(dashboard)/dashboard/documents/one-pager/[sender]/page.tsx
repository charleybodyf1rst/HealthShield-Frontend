import OnePagerClient from './OnePagerClient';

export function generateStaticParams() {
  return [
    { sender: 'charley' },
    { sender: 'ken' },
    { sender: 'brian' },
    { sender: 'jonathan' },
    { sender: 'billy' },
    { sender: 'nahid' },
    { sender: 'dustin' },
    { sender: 'chris' },
    { sender: 'amy' },
  ];
}

export default function OnePagerPage({ params }: { params: Promise<{ sender: string }> }) {
  return <OnePagerClient params={params} />;
}
