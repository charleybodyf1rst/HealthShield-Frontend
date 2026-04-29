'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Copy, Mail, Eye, EyeOff, FileText, Plus } from 'lucide-react';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  category: string;
  createdBy: string;
}

const templates: EmailTemplate[] = [
  {
    id: '1',
    name: 'HealthShield + BodyF1RST Outreach',
    subject: 'Save $681/employee in payroll taxes — quick question for [Company Name]',
    category: 'Cold Outreach',
    createdBy: 'Charley Blanchard',
    body: `Hi [First Name],

I work with Austin companies to reduce healthcare costs while giving employees better benefits. Here's what we do:

HealthShield — Preventive Healthcare (IRS Section 125)
• Saves employers $681 per employee per year in payroll taxes
• Employees get free urgent care, 800+ prescriptions, 24/7 telehealth, and mental health support
• Zero out-of-pocket cost to you or your employees
• Covers employees + spouses + dependents
• Partnered with SilverPoint Health — trusted by companies nationwide

BodyF1RST — AI-Powered Corporate Wellness
• Personalized fitness coaching, nutrition planning, and mental health in one app
• 89% employee retention rate — people actually use it
• AI avatar coach, team challenges, gamification, and leaderboards
• HR dashboard with real-time engagement metrics and ROI tracking

The bottom line: Companies with 20+ employees are saving tens of thousands per year in payroll taxes while building a healthier, more productive workforce.

I attached a one-pager with more details. Would 10 minutes this week work for a quick call to show you what this looks like for [Company Name]?

Best,
[Your Name]
BodyF1RST Corporate Wellness
[Phone] | [Email]`,
  },
  {
    id: '2',
    name: 'HealthShield + BodyF1RST — Short Teaser',
    subject: 'Quick question about [Company Name]\'s healthcare costs',
    category: 'Cold Outreach',
    createdBy: 'Charley Blanchard',
    body: `Hi [First Name],

What if I told you there's a way to save your company $681 per employee per year in payroll taxes while giving your team free urgent care, 800+ prescriptions, 24/7 telehealth, and mental health support — all at zero out-of-pocket cost to you or your employees? It's called HealthShield, a preventive healthcare plan built on IRS Section 125, and companies across Austin are already using it to cut costs and take better care of their people.

We also partner with BodyF1RST, an AI-powered wellness platform that combines personalized fitness coaching, nutrition planning, and mental health support — all in one app your employees actually use (89% retention rate). Together, HealthShield + BodyF1RST give your team real healthcare savings AND a wellness program that drives productivity. I'd love 10 minutes to show you what this would look like for [Company Name] — would this Thursday or Friday work for a quick call?

Best,
[Your Name]
BodyF1RST Corporate Wellness
[Phone] | [Email]`,
  },
  {
    id: '3',
    name: 'Follow-Up — After No Response',
    subject: 'Re: Save $681/employee in payroll taxes',
    category: 'Follow-Up',
    createdBy: 'Charley Blanchard',
    body: `Hi [First Name],

Just circling back on my email from last week. I know you're busy — here's the quick version:

• Your company could save $681/employee/year in payroll taxes through HealthShield (IRS Section 125)
• Employees get free urgent care, prescriptions, telehealth — at zero cost to them
• Takes 2 weeks to set up, no disruption to current insurance

Would a quick 10-minute call this week work? Happy to show you the numbers for [Company Name] specifically.

Best,
[Your Name]
BodyF1RST Corporate Wellness
[Phone] | [Email]`,
  },
  {
    id: '4',
    name: 'Post-Demo Follow-Up',
    subject: 'Great talking with you — next steps for [Company Name]',
    category: 'Post-Demo',
    createdBy: 'Charley Blanchard',
    body: `Hi [First Name],

Thanks for taking the time to meet today! Here's a quick recap of what we covered:

Your Projected Savings:
• [X] employees × $681 = $[Total]/year in payroll tax savings
• Free urgent care, 800+ prescriptions, and 24/7 telehealth for your entire team
• BodyF1RST wellness platform included — AI coaching, team challenges, HR dashboard

Next Steps:
1. I'll send over the custom ROI report for [Company Name]
2. We'll need a census (employee list) to finalize enrollment
3. Enrollment takes ~2 weeks — employees start saving Day 1

I've attached the one-pager we reviewed for your reference. Let me know if you have any questions!

Best,
[Your Name]
BodyF1RST Corporate Wellness
[Phone] | [Email]`,
  },
];

export default function EmailTemplatesPage() {
  const [expandedId, setExpandedId] = useState<string | null>('1');

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const copyFull = (template: EmailTemplate) => {
    const full = `Subject: ${template.subject}\n\n${template.body}`;
    navigator.clipboard.writeText(full);
    toast.success('Full email copied to clipboard');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Email Templates</h1>
          <p className="text-muted-foreground mt-1">
            Ready-to-use email templates for HealthShield + BodyF1RST outreach
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        {templates.map((template) => (
          <Card key={template.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    <Badge variant="secondary" className="text-xs">
                      {template.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Subject:</span> {template.subject}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Created by {template.createdBy}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(template.subject, 'Subject line')}
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Subject
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyFull(template)}
                  >
                    <Mail className="h-3 w-3 mr-1" />
                    Copy All
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedId(expandedId === template.id ? null : template.id)}
                  >
                    {expandedId === template.id ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            {expandedId === template.id && (
              <CardContent className="pt-0">
                <div className="bg-muted/30 rounded-lg p-4 border">
                  <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed">
                    {template.body}
                  </pre>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
