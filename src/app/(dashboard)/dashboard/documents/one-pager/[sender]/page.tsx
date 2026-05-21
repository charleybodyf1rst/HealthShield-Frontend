import OnePagerClient from './OnePagerClient';

export function generateStaticParams() {
  return [
    { sender: 'charley' },
    { sender: 'ken' },
    { sender: 'brian' },
  ];
}

export default function OnePagerPage({ params }: { params: Promise<{ sender: string }> }) {
  return <OnePagerClient params={params} />;
}
