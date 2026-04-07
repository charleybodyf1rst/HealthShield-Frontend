/**
 * HealthShield - Premium Vector Store & RAG System
 *
 * This module provides intelligent AI-powered features:
 * - Vector embeddings for semantic search
 * - Knowledge base for boat recommendations
 * - Context-aware AI responses
 * - Real-time availability insights
 */

import { boats, type Boat } from '../boats';

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
  category: 'boat' | 'faq' | 'policy' | 'location' | 'experience';
  question?: string;
  answer: string;
  keywords: string[];
  boatSlug?: string;
}

// Knowledge Base - Comprehensive boat rental information
export const knowledgeBase: KnowledgeBaseEntry[] = [
  // Boat Information
  ...boats.map((boat) => ({
    category: 'boat' as const,
    answer: `${boat.name} is a ${boat.capacity}-person party boat located at ${boat.location}. ${boat.longDescription} Features include: ${boat.features.join(', ')}. Pricing starts at $${boat.pricing.weekday['3hr']} for 3 hours (Mon-Thu).`,
    keywords: [boat.name.toLowerCase(), boat.slug, boat.location.toLowerCase(), boat.lake, ...boat.features.map(f => f.toLowerCase())],
    boatSlug: boat.slug,
  })),

  // FAQs
  {
    category: 'faq',
    question: 'What should I bring on the boat?',
    answer: 'We recommend bringing: sunscreen, towels, swimsuits, snacks and drinks (no glass containers), a waterproof phone case, and a good attitude! We provide life jackets, a cooler with ice, lily pads, and Bluetooth speakers.',
    keywords: ['bring', 'pack', 'items', 'what to bring', 'checklist'],
  },
  {
    category: 'faq',
    question: 'Can I bring alcohol?',
    answer: 'Yes! You are welcome to bring your own alcoholic beverages. Please note: NO GLASS containers allowed on any of our boats for safety reasons. We recommend cans, plastic bottles, or boxed wine. Please drink responsibly.',
    keywords: ['alcohol', 'beer', 'wine', 'drinks', 'byob', 'liquor'],
  },
  {
    category: 'faq',
    question: 'What is your cancellation policy?',
    answer: 'Cancellations made 7+ days before: Full refund minus $50 processing fee. 3-7 days before: 50% refund. Less than 3 days: No refund. Weather cancellations by us: Full refund or reschedule with no penalty.',
    keywords: ['cancel', 'cancellation', 'refund', 'policy', 'reschedule'],
  },
  {
    category: 'faq',
    question: 'What if it rains?',
    answer: 'We monitor weather closely. If conditions are unsafe, we\'ll contact you to reschedule at no extra charge. Light rain typically doesn\'t affect trips - it can actually be fun! If you want to cancel due to weather, standard cancellation policy applies unless we officially cancel.',
    keywords: ['rain', 'weather', 'storm', 'cancel', 'bad weather'],
  },
  {
    category: 'faq',
    question: 'How much does it cost?',
    answer: 'Pricing varies by boat and duration. Our boats start at $450-$600 for 2 hours. All boats are on Lake Travis at Highland Lakes Marina. Weekend bookings have a 20% surcharge. Full payment is required at the time of booking.',
    keywords: ['price', 'cost', 'how much', 'pricing', 'rate', 'fee', 'deposit'],
  },
  {
    category: 'faq',
    question: 'What AI agents do you offer?',
    answer: 'Yes! All rentals include a licensed, experienced agent. You don\'t need any boating experience - just show up ready to have fun. Our agents know the best spots on the lake and will ensure your safety.',
    keywords: ['agent', 'driver', 'pilot', 'licensed', 'experience'],
  },
  {
    category: 'faq',
    question: 'How many people can fit on the boats?',
    answer: 'Our boats accommodate different group sizes: King Kong (25 people), Lemon Drop & Bananarama (21 people each), and Banana Daiquiri, Pineapple Express & Banana Split (18 people each). These are strict maximums per Coast Guard regulations.',
    keywords: ['capacity', 'people', 'guests', 'group size', 'maximum', 'how many'],
  },
  {
    category: 'faq',
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, Mastercard, Amex, Discover), debit cards, and Apple Pay/Google Pay. Full payment is required at the time of booking. No balance due at arrival.',
    keywords: ['payment', 'pay', 'credit card', 'deposit', 'cash', 'venmo'],
  },
  {
    category: 'faq',
    question: 'Can I have drinks delivered to the boat?',
    answer: 'Yes! We\'ve partnered with Party On Delivery, a locally-owned liquor store and delivery service. They can have your boat stocked with drinks upon arrival at our marinas. Use discount code BANANAboatATX at checkout to get FREE DELIVERY! Visit partyondelivery.com and give them at least 72 hours notice for best service.',
    keywords: ['drinks', 'delivery', 'alcohol delivery', 'party on delivery', 'liquor', 'stock', 'beverage'],
  },

  // Location Information
  {
    category: 'location',
    answer: 'Lake Travis is Austin\'s premier boating destination with crystal-clear water, dramatic cliffs, and hidden coves. All our boats launch from Highland Lakes Marina at 16120 Wharf Cove, Volente, TX 78641. Popular spots include cliff jumping areas, swimming coves, and scenic viewpoints.',
    keywords: ['lake travis', 'volente', 'highland lakes marina', 'cliffs', 'coves'],
  },
  {
    category: 'location',
    answer: 'Lake Travis is a larger, more adventurous lake with stunning cliff views, hidden coves, and deep blue water. It\'s about 20 minutes from downtown Austin and offers a more dramatic landscape. Popular for longer cruises and swimming in crystal-clear water.',
    keywords: ['lake travis', 'travis', 'cliffs', 'deep water', 'coves'],
  },

  // Policies
  {
    category: 'policy',
    answer: 'For safety, we have a few rules: No glass containers, no diving from the boat, life jackets for non-swimmers, follow agent instructions, and treat the boat with respect. Cleaning fee of $150 may apply for excessive mess.',
    keywords: ['rules', 'policy', 'safety', 'guidelines', 'restrictions'],
  },
  {
    category: 'policy',
    answer: 'We love dogs! Well-behaved dogs are welcome on all boats at no extra charge. Please bring waste bags and clean up after your pet. If your dog causes any damage, you\'ll be responsible for repairs.',
    keywords: ['dogs', 'pets', 'animals', 'dog friendly'],
  },
  {
    category: 'policy',
    answer: 'Gratuity for your agent is not included in the rental price. Tips are greatly appreciated and can be added during booking (15%, 20%, 25%) or given as cash directly to your agent.',
    keywords: ['tip', 'gratuity', 'tipping', 'agent tip'],
  },

  // Experience Types
  {
    category: 'experience',
    answer: 'Bachelor and bachelorette parties are our specialty! We recommend King Kong for large groups (25 people) or Bananarama for medium groups. Our boats come with premium sound systems perfect for dancing. We can connect you with local photographers and catering services.',
    keywords: ['bachelor', 'bachelorette', 'party', 'wedding', 'bridal'],
  },
  {
    category: 'experience',
    answer: 'Birthday celebrations on the water are magical! We see lots of milestone birthdays (21st, 30th, 40th, 50th). Consider Banana Split for a "sweet" celebration or any of our boats for a party atmosphere. Let us know it\'s a birthday and we\'ll make it special!',
    keywords: ['birthday', 'celebration', 'party', 'milestone'],
  },
  {
    category: 'experience',
    answer: 'Corporate events and team building on our boats create unforgettable bonding experiences. King Kong is ideal for large teams (up to 25). We can accommodate multi-boat rentals for bigger groups. Ask about our corporate packages.',
    keywords: ['corporate', 'team building', 'company', 'work event', 'business'],
  },
  {
    category: 'experience',
    answer: 'For a romantic sunset cruise, we recommend Banana Daiquiri or Pineapple Express on Lake Travis. The views are spectacular, and the intimate setting is perfect for anniversaries, proposals, or date nights. Best sunset times are typically around 7-8 PM in summer.',
    keywords: ['romantic', 'sunset', 'anniversary', 'date', 'proposal', 'couples'],
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
        boatSlug: entry.boatSlug,
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
  suggestedPlans?: Boat[];
}

export async function generateRAGResponse(query: string): Promise<RAGResponse> {
  const searchResults = vectorStore.search(query, 3);

  if (searchResults.length === 0) {
    return {
      answer: "I'd be happy to help you with your boat rental questions! Could you please tell me more about what you're looking for? I can help with boat selection, pricing, availability, what to bring, or any other questions about your upcoming trip.",
      sources: [],
      confidence: 0.3,
    };
  }

  // Determine if user is asking about specific boats
  const boatSlugs = new Set<string>();
  for (const result of searchResults) {
    if (result.document.metadata.boatSlug) {
      boatSlugs.add(result.document.metadata.boatSlug as string);
    }
  }

  const suggestedPlans = boatSlugs.size > 0
    ? boats.filter((b) => boatSlugs.has(b.slug))
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

// Smart Boat Recommendation Engine
export interface BookingPreferences {
  groupSize: number;
  occasion?: string;
  lake?: 'lake_travis';
  budget?: number;
  duration?: '3hr' | '4hr' | '5hr' | '6hr' | '7hr' | '8hr';
  features?: string[];
}

export function recommendBoats(preferences: BookingPreferences): Boat[] {
  let candidates = [...boats];

  // Filter by capacity
  candidates = candidates.filter((b) => b.capacity >= preferences.groupSize);

  // Filter by lake if specified
  if (preferences.lake) {
    candidates = candidates.filter((b) => b.lake === preferences.lake);
  }

  // Filter by budget if specified (using weekday prices as baseline)
  if (preferences.budget && preferences.duration) {
    candidates = candidates.filter(
      (b) => b.pricing.weekday[preferences.duration!] <= preferences.budget!
    );
  }

  // Score remaining boats
  const scored = candidates.map((boat) => {
    let score = 100;

    // Prefer boats closer to group size (not too big, not too small)
    const capacityDiff = boat.capacity - preferences.groupSize;
    if (capacityDiff < 3) score += 20; // Good fit
    if (capacityDiff > 10) score -= 10; // Way too big

    // Occasion-based scoring
    if (preferences.occasion) {
      const occasion = preferences.occasion.toLowerCase();

      if (occasion.includes('bachelor') || occasion.includes('bachelorette')) {
        if (boat.name === 'King Kong' || boat.name === 'Bananarama') score += 30;
      }

      if (occasion.includes('birthday')) {
        if (boat.name === 'Banana Split') score += 20;
      }

      if (occasion.includes('corporate') || occasion.includes('team')) {
        if (boat.name === 'King Kong') score += 30;
      }

      if (occasion.includes('romantic') || occasion.includes('sunset') || occasion.includes('anniversary')) {
        if (boat.lake === 'lake_travis') score += 20;
        if (boat.capacity <= 18) score += 15;
      }
    }

    // Feature matching
    if (preferences.features && preferences.features.length > 0) {
      for (const feature of preferences.features) {
        if (boat.features.some((f) => f.toLowerCase().includes(feature.toLowerCase()))) {
          score += 10;
        }
      }
    }

    return { boat, score };
  });

  // Sort by score and return top 3
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((s) => s.boat);
}

// Availability Insights
export interface AvailabilityInsight {
  date: Date;
  popularityScore: number;
  recommendation: string;
  pricingTier: 'standard' | 'peak' | 'premium';
}

export function getAvailabilityInsights(date: Date): AvailabilityInsight {
  const dayOfWeek = date.getDay();
  const month = date.getMonth();
  const dayOfMonth = date.getDate();

  let popularityScore = 50;
  let pricingTier: 'standard' | 'peak' | 'premium' = 'standard';
  let recommendation = '';

  // Weekend pricing (20% surcharge)
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    popularityScore += 30;
    pricingTier = 'peak';
    recommendation = 'Weekend bookings are popular! Consider booking early.';
  }

  // Summer months (May-September)
  if (month >= 4 && month <= 8) {
    popularityScore += 20;
    if (pricingTier === 'peak') pricingTier = 'premium';
    recommendation += ' Summer is our busiest season - boats fill up fast!';
  }

  // Holiday weekends
  const isHolidayWeekend = checkHolidayWeekend(date);
  if (isHolidayWeekend) {
    popularityScore += 25;
    pricingTier = 'premium';
    recommendation = 'Holiday weekend detected - book ASAP for best selection!';
  }

  // Friday (start of weekend)
  if (dayOfWeek === 5) {
    popularityScore += 15;
    pricingTier = 'peak';
  }

  return {
    date,
    popularityScore: Math.min(popularityScore, 100),
    recommendation: recommendation.trim() || 'Great choice! Standard availability expected.',
    pricingTier,
  };
}

function checkHolidayWeekend(date: Date): boolean {
  const month = date.getMonth();
  const dayOfMonth = date.getDate();

  // Memorial Day weekend (late May)
  if (month === 4 && dayOfMonth >= 25) return true;

  // July 4th weekend
  if (month === 6 && dayOfMonth >= 1 && dayOfMonth <= 7) return true;

  // Labor Day weekend (early September)
  if (month === 8 && dayOfMonth <= 7) return true;

  return false;
}
