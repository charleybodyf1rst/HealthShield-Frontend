# HealthShield - Feature Specifications

## Detailed Technical Specifications for All Platform Features

---

## 1. RAG Vector Store AI System

### Architecture
```
Knowledge Base
     ↓
VectorDocument[] (in-memory store)
     ↓
Keyword Matching + Scoring Algorithm
     ↓
RAG Response Generation
     ↓
AI Chat Response
```

### Data Structures

```typescript
interface VectorDocument {
  id: string;
  content: string;
  metadata: {
    category: 'boat' | 'faq' | 'policy' | 'location' | 'experience';
    keywords: string[];
    boatSlug?: string;
  };
  embedding?: number[]; // Future: real embeddings
}

interface RAGResponse {
  answer: string;
  sources: SearchResult[];
  confidence: number; // 0-1
  suggestedBoats?: Boat[];
}
```

### Search Algorithm
1. Query tokenization (lowercase, split by spaces)
2. Keyword matching (10 points per match)
3. Content matching (1 point per word match)
4. Exact phrase bonus (20 points)
5. Sort by score, return top K results

### Knowledge Base Categories
- **Boats:** 6 entries (one per boat)
- **FAQs:** 9 common questions
- **Policies:** 3 entries (safety, pets, gratuity)
- **Locations:** 1 entry (Lake Travis)
- **Experiences:** 4 entries (bachelor, birthday, corporate, romantic)

---

## 2. Captain AI Training System

### Module Structure
```typescript
interface TrainingModule {
  id: string;
  title: string;
  description: string;
  category: 'operations' | 'marketing' | 'finance' | 'customer' | 'automation';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  lessons: TrainingLesson[];
}

interface TrainingLesson {
  id: string;
  title: string;
  content: string; // Markdown content
  tips: string[];
  actionItems: string[];
}
```

### Training Modules (5 Total)
1. Getting Started with Your CRM - 30 min
2. Marketing Your Boat Business - 45 min
3. Financial Management & Growth - 60 min
4. Setting Up Automations - 40 min
5. Customer Experience Excellence - 35 min

### Automation Templates (10 Total)
| Template | Trigger | Time Saved |
|----------|---------|------------|
| Booking Confirmation | New booking | 5 min/booking |
| Pre-Trip Reminder | 24hrs before | 10 min/booking |
| Review Request | 24hrs after | 8 min/booking |
| Abandoned Booking | 1hr no complete | 15 min/lead |
| VIP Detection | 2nd booking or $1k+ | Ongoing |
| Weather Monitor | Daily 6AM/12PM | 20 min/day |
| Weekly Summary | Sundays 8PM | 30 min/week |
| Captain Assignment | Booking confirmed | 10 min/booking |
| Payment Reminder | 3 days before | 10 min/booking |
| Social Proof Collector | 5-star review | 15 min/review |

---

## 3. Business Analytics Dashboard

### Revenue Data Structure
```typescript
interface RevenueData {
  date: string;
  revenue: number;
  bookings: number;
  avgBookingValue: number;
}
```

### KPI Calculations
```typescript
// Total Revenue
totalRevenue = sum(monthlyData.revenue)

// Average Monthly
avgMonthlyRevenue = totalRevenue / months

// Growth Rate
recentAvg = avg(last 3 months)
earlierAvg = avg(first 3 months)
growthRate = ((recentAvg - earlierAvg) / earlierAvg) * 100

// Revenue Per Booking
revenuePerBooking = totalRevenue / totalBookings
```

### Boat Performance Metrics
| Metric | Calculation |
|--------|-------------|
| Total Revenue | Sum of all booking totals |
| Booking Count | Count of completed bookings |
| Avg Rating | Average of all customer reviews |
| Utilization Rate | (Booked hours / Available hours) * 100 |

### Customer Segments
| Segment | Avg Booking | Repeat Rate |
|---------|-------------|-------------|
| Bachelor/Bachelorette | $847 | 15% |
| Birthday | $774 | 25% |
| Corporate | $1,500 | 45% |
| Family | $711 | 35% |
| Casual | $528 | 40% |

### Seasonal Multipliers
| Month | Multiplier |
|-------|------------|
| Jan | 0.4 |
| Feb | 0.5 |
| Mar | 0.7 |
| Apr | 0.9 |
| May | 1.2 |
| Jun | 1.5 |
| Jul | 1.6 |
| Aug | 1.5 |
| Sep | 1.1 |
| Oct | 0.8 |
| Nov | 0.5 |
| Dec | 0.4 |

---

## 4. Document Management System

### Folder Structure
```
documents/
├── tax-receipts/
├── insurance/
├── boat-records/
├── legal/
├── captain-records/
├── customer-contracts/
└── marketing/
```

### Document Types
- receipt, invoice, contract, license, insurance
- maintenance, certification, tax_form, photo, other

### Tax Categories (with deduction rates)
| Category | Deduction Rate |
|----------|----------------|
| Fuel | 100% |
| Maintenance | 100% |
| Insurance | 100% |
| Marketing | 100% |
| Equipment | 100% |
| Professional Services | 100% |
| Software | 100% |
| Meals & Entertainment | 50% |
| Wages | 100% |
| Utilities | 100% |

### Tax Summary Calculation
```typescript
estimatedTaxSavings = totalDeductions * 0.25 // 25% marginal rate
```

---

## 5. Task Management System

### Board Structure
```typescript
interface TaskBoard {
  columns: [
    { status: 'backlog', limit: undefined },
    { status: 'todo', limit: 10 },
    { status: 'in_progress', limit: 5 },
    { status: 'review', limit: 5 },
    { status: 'done', limit: undefined }
  ]
}
```

### Task Priorities
| Priority | Color | Sort Order |
|----------|-------|------------|
| Urgent | Red | 4 |
| High | Orange | 3 |
| Medium | Blue | 2 |
| Low | Gray | 1 |

### Task Categories
- operations, maintenance, marketing
- customer, finance, admin, hr

### Recurrence Options
- Daily (interval: 1+)
- Weekly (with daysOfWeek selection)
- Monthly (with dayOfMonth selection)
- Yearly

---

## 6. E2E Encryption System

### Encryption Specification
- **Algorithm:** AES-256-GCM
- **Key Size:** 256 bits
- **IV Size:** 96 bits (12 bytes)
- **Key Derivation:** PBKDF2 (100,000 iterations, SHA-256)

### Key Storage
- IndexedDB database: `healthshield_crm_encryption`
- Object store: `encryption_keys`
- Key format: Base64 encoded

### Message Flow
```
1. User types message
2. Get/generate conversation key
3. Generate random IV
4. Encrypt with AES-GCM
5. Store encrypted content + IV
6. Recipient retrieves
7. Decrypt with same key + IV
8. Display plaintext
```

---

## 7. Payment System

### Pricing Structure
```typescript
const pricing = {
  depositPercentage: 50,
  weekendSurcharge: 20, // %
  holidaySurcharge: 50, // %
  largeGroupSurcharge: 10, // % (over 80% capacity)
};
```

### Holiday Weekends
- Memorial Day (May 25-31)
- July 4th (July 1-7)
- Labor Day (September 1-7)

### Gratuity Options
- 15% (Good)
- 20% (Great)
- 25% (Excellent)
- Custom amount

### Refund Policy
| Days Before Trip | Refund Amount |
|------------------|---------------|
| 7+ days | Full - $50 fee |
| 3-7 days | 50% |
| Less than 3 days | None |
| Weather cancellation | 100% |

---

## 8. Booking Engine

### Time Slot Generation
- Business hours: 9 AM - 11 PM
- Durations: 2hr, 4hr, 6hr, 8hr
- Conflict detection per boat

### Availability Check
```typescript
function checkAvailability(boatSlug, date, existingBookings) {
  // 1. Generate all possible slots
  // 2. Filter out conflicting times
  // 3. Return available slots with pricing
}
```

### Confirmation Code Format
`BB-{INITIALS}-{YEAR}-{RANDOM}`
Example: `BB-JJ-2024-123`

### Booking Statistics
- Total bookings
- Confirmed/Pending/Completed/Cancelled
- Today's bookings
- This week's revenue
- Popular boat
- Average group size

---

## API Endpoints (Future Implementation)

### Public API
- `GET /api/boats` - List all boats
- `GET /api/boats/:slug` - Get boat details
- `GET /api/availability` - Check availability
- `POST /api/booking` - Create booking
- `POST /api/chat` - AI chat endpoint

### Admin API
- `GET /api/admin/bookings` - List bookings
- `GET /api/admin/analytics` - Get analytics
- `GET /api/admin/documents` - List documents
- `POST /api/admin/tasks` - Create task
- `GET /api/admin/messages` - Get messages

---

## Performance Targets

| Metric | Target |
|--------|--------|
| Page Load | < 2s |
| AI Response | < 500ms |
| Search Results | < 100ms |
| Encryption | < 50ms |
| Build Size | < 5MB |

---

*Specifications Version: 1.0.0*
*Last Updated: December 2024*
