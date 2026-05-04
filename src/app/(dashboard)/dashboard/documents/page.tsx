'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Download, ExternalLink, FileText, Film, Globe, FolderOpen, FileSpreadsheet, Mail } from 'lucide-react';

interface Document {
  id: string;
  name: string;
  description: string;
  category: string;
  type: 'pdf' | 'link' | 'video' | 'template' | 'xlsx';
  url: string;
  icon: 'pdf' | 'link' | 'video' | 'template' | 'xlsx';
  download?: boolean;
}

const documents: Document[] = [
  // PDFs
  {
    id: '1',
    name: 'BodyF1RST + HealthShield One-Pager (Charley)',
    description: 'Sales one-pager with HealthShield benefits, BodyF1RST features, ROI calculator, and how it works. Charley Blanchard contact info.',
    category: 'Sales Collateral',
    type: 'pdf',
    url: '/documents/HealthShield-BodyF1RST-Overview.pdf',
    icon: 'pdf',
  },
  {
    id: '2',
    name: 'BodyF1RST + HealthShield One-Pager (Ken Laney)',
    description: 'Same one-pager with Ken Laney contact info. Ken@bodyf1rst.com | (512) 470-0454.',
    category: 'Sales Collateral',
    type: 'pdf',
    url: '/documents/HealthShield-BodyF1RST-Overview-KenLaney.pdf',
    icon: 'pdf',
  },

  // Websites
  {
    id: '3',
    name: 'BodyF1RST Website',
    description: 'Main BodyF1RST website — fitness, nutrition, mental health, AI coaching platform overview.',
    category: 'Websites',
    type: 'link',
    url: 'https://bodyf1rst.com',
    icon: 'link',
  },
  {
    id: '4',
    name: 'B1 Corporate Wellness',
    description: 'B1 Corporate Wellness presentation site — Where Prevention Meets Performance. Interactive demo and discovery.',
    category: 'Websites',
    type: 'link',
    url: 'https://b1-corporate-wellness.web.app',
    icon: 'link',
  },
  {
    id: '5',
    name: 'HealthShield Page',
    description: 'HealthShield preventive healthcare details — IRS Section 125, SilverPoint Health partnership, benefits overview.',
    category: 'Websites',
    type: 'link',
    url: 'https://bodyf1rst.com/healthshield',
    icon: 'link',
  },

  // Videos
  {
    id: '6',
    name: 'SilverPoint Health Overview',
    description: 'Video overview of SilverPoint Health — the preventive healthcare network behind HealthShield. Share with prospects.',
    category: 'Videos',
    type: 'video',
    url: 'https://vimeo.com/1043593610',
    icon: 'video',
  },
  {
    id: '7',
    name: 'HealthShield Explainer Video',
    description: 'HealthShield product explainer — how the IRS Section 125 preventive care plan works, employee benefits, employer savings.',
    category: 'Videos',
    type: 'video',
    url: 'https://vimeo.com/1097456061',
    icon: 'video',
  },

  // SilverPoint Onboarding Templates
  {
    id: '8',
    name: 'SilverPoint Initial Census Template',
    description: 'Excel template for collecting employee census data — first names, last names, DOB, employee class, dependents, salary. Required for proposal generation.',
    category: 'Templates',
    type: 'xlsx',
    url: '/templates/silverpoint-initial-census.xlsx',
    icon: 'xlsx',
    download: true,
  },
  {
    id: '9',
    name: 'Group Information Form',
    description: 'PDF form for collecting company demographics, payroll details, broker info, and authorized signer. Required to prepare the SilverPoint agreement.',
    category: 'Templates',
    type: 'template',
    url: '/templates/group-information-form.pdf',
    icon: 'template',
    download: true,
  },
];

const categoryColors: Record<string, string> = {
  'Sales Collateral': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  'Websites': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'Videos': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  'Templates': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
};

const iconMap = {
  pdf: FileText,
  link: Globe,
  video: Film,
  template: FileText,
  xlsx: FileSpreadsheet,
};

export default function DocumentsPage() {
  const [filter, setFilter] = useState<string>('all');

  const categories = ['all', ...Array.from(new Set(documents.map((d) => d.category)))];
  const filtered = filter === 'all' ? documents : documents.filter((d) => d.category === filter);

  const handleOpen = (doc: Document) => {
    if (doc.download) {
      // Trigger download
      const a = document.createElement('a');
      a.href = doc.url;
      a.download = doc.url.split('/').pop() || 'download';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success('Downloading ' + doc.name);
    } else {
      window.open(doc.url, '_blank');
    }
  };

  const handleCopyLink = (url: string) => {
    const fullUrl = url.startsWith('http') ? url : window.location.origin + url;
    navigator.clipboard.writeText(fullUrl);
    toast.success('Link copied to clipboard');
  };

  const handleEmailLead = (doc: Document) => {
    const fullUrl = doc.url.startsWith('http') ? doc.url : window.location.origin + doc.url;
    const subject = encodeURIComponent('HealthShield: ' + doc.name);
    const body = encodeURIComponent('Hi,\n\nAttached is the ' + doc.name + ' you can download here:\n' + fullUrl + '\n\n' + doc.description + '\n\nBest,\nHealthShield Team');
    window.location.href = 'mailto:?subject=' + subject + '&body=' + body;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Documents & Resources</h1>
          <p className="text-muted-foreground mt-1">
            Sales collateral, websites, and videos for HealthShield + BodyF1RST
          </p>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap">
        {categories.map((cat) => (
          <Button
            key={cat}
            variant={filter === cat ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(cat)}
            className={filter === cat ? 'bg-orange-500 hover:bg-orange-600' : ''}
          >
            {cat === 'all' ? 'All' : cat}
          </Button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((doc) => {
          const Icon = iconMap[doc.icon];
          return (
            <Card key={doc.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleOpen(doc)}>
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className={`h-12 w-12 rounded-lg flex items-center justify-center shrink-0 ${
                    doc.type === 'pdf' ? 'bg-red-100 dark:bg-red-900/30' :
                    doc.type === 'video' ? 'bg-purple-100 dark:bg-purple-900/30' :
                    doc.type === 'xlsx' ? 'bg-green-100 dark:bg-green-900/30' :
                    doc.type === 'template' ? 'bg-amber-100 dark:bg-amber-900/30' :
                    'bg-blue-100 dark:bg-blue-900/30'
                  }`}>
                    <Icon className={`h-6 w-6 ${
                      doc.type === 'pdf' ? 'text-red-600 dark:text-red-400' :
                      doc.type === 'video' ? 'text-purple-600 dark:text-purple-400' :
                      doc.type === 'xlsx' ? 'text-green-600 dark:text-green-400' :
                      doc.type === 'template' ? 'text-amber-600 dark:text-amber-400' :
                      'text-blue-600 dark:text-blue-400'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-sm truncate">{doc.name}</h3>
                      <Badge className={`text-xs shrink-0 ${categoryColors[doc.category] || ''}`}>
                        {doc.category}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{doc.description}</p>
                    <div className="flex gap-2 mt-3 flex-wrap">
                      <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleOpen(doc); }}>
                        {doc.download ? <Download className="h-3 w-3 mr-1" /> : <ExternalLink className="h-3 w-3 mr-1" />}
                        {doc.download ? 'Download' : doc.type === 'pdf' ? 'View PDF' : doc.type === 'video' ? 'Watch' : 'Visit'}
                      </Button>
                      {doc.category === 'Templates' && (
                        <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleEmailLead(doc); }}>
                          <Mail className="h-3 w-3 mr-1" />
                          Email to Lead
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleCopyLink(doc.url); }}>
                        Copy Link
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
