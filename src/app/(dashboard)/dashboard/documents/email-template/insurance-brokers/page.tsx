import { EmailTemplatePage } from '@/components/email-template-page';

export default function InsuranceBrokersEmailPage() {
  return (
    <EmailTemplatePage
      markdownPath="/documents/email-insurance-brokers.md"
      filenameBase="BodyF1RST-Outreach-Insurance-Brokers"
      title="Partner Outreach Email — Insurance Brokers"
      subtitle="Drop in a recipient + their brokerage name, then copy/PDF/print a ready-to-send email explaining the BodyF1RST referral program."
    />
  );
}
