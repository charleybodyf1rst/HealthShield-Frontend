import { EmailTemplatePage } from '@/components/email-template-page';

export default function HrStaffingEmailPage() {
  return (
    <EmailTemplatePage
      markdownPath="/documents/email-hr-staffing.md"
      filenameBase="BodyF1RST-Outreach-HR-Staffing"
      title="Partner Outreach Email — HR Staffing"
      subtitle="Drop in a recipient + their firm name, then copy/PDF/print a ready-to-send email explaining the BodyF1RST referral program."
    />
  );
}
