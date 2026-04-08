/**
 * HealthShield - Premium Vector Store & RAG System
 *
 * This module provides intelligent AI-powered features:
 * - Vector embeddings for semantic search
 * - Knowledge base for insurance plan recommendations
 * - Context-aware AI responses
 * - Real-time enrollment insights
 */

// Types for Vector Store
export interface VectorDocument {
  id: string;
  content: string;
  metadata: Record<string, unknown>;
  embedding?: number[];
}

export interface SearchResult {
  document: VectorDocument;
  score: number;
}

export interface KnowledgeBaseEntry {
  category: 'plan' | 'faq' | 'policy' | 'wellness' | 'enrollment';
  question?: string;
  answer: string;
  keywords: string[];
  planSlug?: string;
}

// Knowledge Base - Comprehensive health insurance information
export const knowledgeBase: KnowledgeBaseEntry[] = [
  // Plan Information
  {
    category: 'plan',
    answer: 'The Bronze Plan is our most affordable option, designed for healthy individuals who want coverage for unexpected events. It covers preventive care at no cost, has a lower monthly premium, and includes telehealth access. Best for individuals and young adults on a budget.',
    keywords: ['bronze', 'affordable', 'budget', 'cheap', 'basic', 'low cost'],
    planSlug: 'bronze',
  },
  {
    category: 'plan',
    answer: 'The Silver Plan offers a balanced combination of monthly premiums and out-of-pocket costs. It covers preventive care, specialist visits, prescription drugs, and mental health services. Ideal for individuals and families who visit the doctor regularly.',
    keywords: ['silver', 'balanced', 'moderate', 'mid-range', 'standard'],
    planSlug: 'silver',
  },
  {
    category: 'plan',
    answer: 'The Gold Plan provides comprehensive coverage with lower out-of-pocket costs. It includes preventive care, specialist visits, hospital stays, prescription coverage, dental and vision basics, and wellness program access. Best for families and those with ongoing medical needs.',
    keywords: ['gold', 'comprehensive', 'family', 'full coverage', 'premium'],
    planSlug: 'gold',
  },
  {
    category: 'plan',
    answer: 'The Platinum Plan is our most comprehensive offering with the lowest out-of-pocket costs. It includes everything in the Gold Plan plus enhanced dental and vision, international coverage, concierge health services, and priority claims processing. Ideal for those who want maximum coverage and convenience.',
    keywords: ['platinum', 'maximum', 'best', 'top tier', 'elite', 'concierge'],
    planSlug: 'platinum',
  },

  // FAQs
  {
    category: 'faq',
    question: 'How do I enroll in a plan?',
    answer: 'You can enroll online at healthshield.ai, call our enrollment specialists, or use our AI assistant for guided enrollment. Open enrollment is available year-round for qualifying life events. Standard open enrollment runs November through January.',
    keywords: ['enroll', 'sign up', 'register', 'join', 'apply', 'enrollment'],
  },
  {
    category: 'faq',
    question: 'What is covered under preventive care?',
    answer: 'All HealthShield plans cover preventive care at no additional cost. This includes annual wellness visits, immunizations, screenings (blood pressure, cholesterol, cancer), and preventive counseling. No copay or deductible required for in-network preventive services.',
    keywords: ['preventive', 'wellness visit', 'screening', 'checkup', 'immunization', 'vaccine'],
  },
  {
    category: 'faq',
    question: 'How do I file a claim?',
    answer: 'Most claims are filed automatically by your healthcare provider. For out-of-network services or reimbursement requests, log into your HealthShield dashboard, navigate to Claims, and submit your claim with the required documentation. Claims are typically processed within 14 business days.',
    keywords: ['claim', 'file', 'submit', 'reimbursement', 'billing'],
  },
  {
    category: 'faq',
    question: 'Can I keep my current doctor?',
    answer: 'HealthShield partners with a wide network of healthcare providers. You can search our provider directory at healthshield.ai/providers to check if your doctor is in-network. Out-of-network care is covered at a reduced rate on Silver plans and above.',
    keywords: ['doctor', 'provider', 'network', 'in-network', 'out-of-network', 'physician'],
  },
  {
    category: 'faq',
    question: 'What are the payment options?',
    answer: 'We accept all major credit cards, debit cards, ACH bank transfers, and HSA/FSA payments. Monthly premiums can be set up for automatic payment. We also offer premium assistance for qualifying individuals.',
    keywords: ['payment', 'pay', 'credit card', 'billing', 'premium', 'cost'],
  },
  {
    category: 'faq',
    question: 'Do you offer telehealth services?',
    answer: 'Yes! All HealthShield plans include telehealth access at no additional cost. Connect with board-certified doctors 24/7 via video or phone for non-emergency medical issues, mental health counseling, and prescription refills.',
    keywords: ['telehealth', 'virtual', 'online doctor', 'video visit', 'remote'],
  },
  {
    category: 'faq',
    question: 'What wellness programs are available?',
    answer: 'HealthShield offers comprehensive wellness programs including fitness tracking rewards, nutrition counseling, mental health support, smoking cessation programs, weight management coaching, and preventive health challenges. Gold and Platinum members get enhanced wellness benefits.',
    keywords: ['wellness', 'fitness', 'nutrition', 'mental health', 'program', 'healthy'],
  },

  // Policies
  {
    category: 'policy',
    answer: 'HealthShield plans renew annually. You can make changes to your plan during the open enrollment period (November-January) or within 60 days of a qualifying life event such as marriage, birth of a child, job loss, or relocation.',
    keywords: ['renewal', 'change plan', 'open enrollment', 'life event', 'switch'],
  },
  {
    category: 'policy',
    answer: 'You can cancel your HealthShield plan at any time with 30 days written notice. Coverage will continue through the end of the paid period. Refunds for unused prepaid premiums are processed within 14 business days.',
    keywords: ['cancel', 'cancellation', 'stop', 'end coverage', 'terminate'],
  },
  {
    category: 'policy',
    answer: 'HealthShield protects your personal health information in compliance with HIPAA regulations. Your data is encrypted, access is restricted to authorized personnel, and we never share your information with third parties without your explicit consent.',
    keywords: ['privacy', 'hipaa', 'data', 'security', 'confidential', 'information'],
  },

  // Enrollment information
  {
    category: 'enrollment',
    answer: 'To enroll, you will need: a valid government-issued ID, Social Security number, proof of residency, income verification (for premium assistance eligibility), and information about any current coverage. The enrollment process takes approximately 15 minutes online.',
    keywords: ['documents', 'requirements', 'id', 'what do i need', 'verification'],
  },
  {
    category: 'enrollment',
    answer: 'Qualifying life events that allow enrollment outside the standard open enrollment period include: marriage or divorce, birth or adoption of a child, loss of other health coverage, relocation, change in income, and turning 26 (aging off parent plan).',
    keywords: ['qualifying event', 'special enrollment', 'life event', 'marriage', 'baby', 'job loss'],
  },

  // Wellness
  {
    category: 'wellness',
    answer: 'HealthShield Rewards lets you earn points for healthy activities: annual checkups (500 points), fitness milestones (100-300 points), completing health assessments (250 points), and participating in wellness challenges (varies). Points can be redeemed for premium discounts, gift cards, or wellness products.',
    keywords: ['rewards', 'points', 'earn', 'incentive', 'discount', 'healthy activities'],
  },
  {
    category: 'wellness',
    answer: 'Our mental health support includes unlimited telehealth counseling sessions, access to our mindfulness and meditation app, stress management workshops, crisis support hotline (24/7), and coverage for in-person therapy visits. No referral needed for mental health services.',
    keywords: ['mental health', 'therapy', 'counseling', 'stress', 'anxiety', 'depression', 'mindfulness'],
  },
];

// In-memory vector store (in production, use Pinecone/Weaviate/Qdrant)
class VectorStore {
  private documents: VectorDocument[] = [];

  constructor() {
    this.initializeKnowledgeBase();
  }

  private initializeKnowledgeBase() {
    this.documents = knowledgeBase.map((entry, index) => ({
      id: `kb-${entry.category}-${index}`,
      content: entry.answer,
      metadata: {
        category: entry.category,
        question: entry.question,
        keywords: entry.keywords,
        planSlug: entry.planSlug,
      },
    }));
  }

  // Simple keyword-based search (would use embeddings in production)
  search(query: string, topK: number = 5): SearchResult[] {
    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(/\s+/);

    const results = this.documents.map((doc) => {
      const keywords = (doc.metadata.keywords as string[]) || [];
      const content = doc.content.toLowerCase();

      let score = 0;

      // Keyword matching
      for (const word of queryWords) {
        if (keywords.some(kw => kw.includes(word) || word.includes(kw))) {
          score += 10;
        }
        if (content.includes(word)) {
          score += 1;
        }
      }

      // Exact phrase matching bonus
      if (content.includes(queryLower)) {
        score += 20;
      }

      return { document: doc, score };
    });

    return results
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }

  getDocumentsByCategory(category: string): VectorDocument[] {
    return this.documents.filter((d) => d.metadata.category === category);
  }

  addDocument(doc: VectorDocument) {
    this.documents.push(doc);
  }
}

// Singleton instance
export const vectorStore = new VectorStore();

// RAG Response Generator
export interface RAGResponse {
  answer: string;
  sources: SearchResult[];
  confidence: number;
  suggestedPlans?: string[];
}

export async function generateRAGResponse(query: string): Promise<RAGResponse> {
  const searchResults = vectorStore.search(query, 3);

  if (searchResults.length === 0) {
    return {
      answer: "I'd be happy to help you with your health insurance questions! Could you please tell me more about what you're looking for? I can help with plan comparison, enrollment, claims, wellness programs, or any other questions about your coverage.",
      sources: [],
      confidence: 0.3,
    };
  }

  // Determine if user is asking about specific plans
  const planSlugs = new Set<string>();
  for (const result of searchResults) {
    if (result.document.metadata.planSlug) {
      planSlugs.add(result.document.metadata.planSlug as string);
    }
  }

  const suggestedPlans = planSlugs.size > 0
    ? Array.from(planSlugs)
    : undefined;

  // Build comprehensive response
  const topResult = searchResults[0];
  let answer = topResult.document.content;

  // If multiple relevant results, combine key info
  if (searchResults.length > 1 && searchResults[1].score > 5) {
    const additionalInfo = searchResults
      .slice(1)
      .filter((r) => r.score > 5)
      .map((r) => r.document.content)
      .join('\n\n');

    if (additionalInfo && additionalInfo !== answer) {
      answer += '\n\nAdditionally: ' + additionalInfo;
    }
  }

  const confidence = Math.min(topResult.score / 30, 1);

  return {
    answer,
    sources: searchResults,
    confidence,
    suggestedPlans,
  };
}

// Smart Plan Recommendation Engine
export interface CoveragePreferences {
  age: number;
  familySize: number;
  budgetRange?: 'low' | 'moderate' | 'high';
  hasPreExistingConditions?: boolean;
  needsDental?: boolean;
  needsVision?: boolean;
  prioritizesLowPremium?: boolean;
  prioritizesLowDeductible?: boolean;
}

export function recommendPlans(preferences: CoveragePreferences): string[] {
  const recommendations: { plan: string; score: number }[] = [
    { plan: 'bronze', score: 50 },
    { plan: 'silver', score: 50 },
    { plan: 'gold', score: 50 },
    { plan: 'platinum', score: 50 },
  ];

  for (const rec of recommendations) {
    // Budget-based scoring
    if (preferences.budgetRange === 'low') {
      if (rec.plan === 'bronze') rec.score += 30;
      if (rec.plan === 'silver') rec.score += 15;
    } else if (preferences.budgetRange === 'high') {
      if (rec.plan === 'platinum') rec.score += 30;
      if (rec.plan === 'gold') rec.score += 20;
    }

    // Family size scoring
    if (preferences.familySize > 2) {
      if (rec.plan === 'gold') rec.score += 25;
      if (rec.plan === 'platinum') rec.score += 20;
    }

    // Pre-existing conditions
    if (preferences.hasPreExistingConditions) {
      if (rec.plan === 'gold') rec.score += 20;
      if (rec.plan === 'platinum') rec.score += 25;
      if (rec.plan === 'bronze') rec.score -= 10;
    }

    // Dental/Vision needs
    if (preferences.needsDental || preferences.needsVision) {
      if (rec.plan === 'gold') rec.score += 15;
      if (rec.plan === 'platinum') rec.score += 20;
    }

    // Premium vs deductible preference
    if (preferences.prioritizesLowPremium) {
      if (rec.plan === 'bronze') rec.score += 20;
      if (rec.plan === 'silver') rec.score += 10;
    }
    if (preferences.prioritizesLowDeductible) {
      if (rec.plan === 'platinum') rec.score += 20;
      if (rec.plan === 'gold') rec.score += 15;
    }
  }

  return recommendations
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((r) => r.plan);
}

// Enrollment Period Insights
export interface EnrollmentInsight {
  date: Date;
  isOpenEnrollment: boolean;
  recommendation: string;
  urgency: 'low' | 'medium' | 'high';
}

export function getEnrollmentInsights(date: Date): EnrollmentInsight {
  const month = date.getMonth();

  let isOpenEnrollment = false;
  let recommendation = '';
  let urgency: 'low' | 'medium' | 'high' = 'low';

  // Open enrollment period (November-January)
  if (month >= 10 || month === 0) {
    isOpenEnrollment = true;
    urgency = 'high';
    recommendation = 'Open enrollment is active! Now is the best time to enroll or change your plan.';
  }

  // Pre-enrollment awareness (September-October)
  if (month >= 8 && month <= 9) {
    urgency = 'medium';
    recommendation = 'Open enrollment starts soon. Review your current coverage and explore plan options.';
  }

  // Mid-year
  if (month >= 1 && month <= 7) {
    urgency = 'low';
    recommendation = 'Outside of open enrollment. You can still enroll if you have a qualifying life event.';
  }

  return {
    date,
    isOpenEnrollment,
    recommendation,
    urgency,
  };
}
