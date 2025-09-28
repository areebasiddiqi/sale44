# Sale44 - Autonomous Business Audit & Lead Generation

A complete SaaS application for business auditing and lead generation built with Next.js 14, Supabase, and Stripe.

## Features

- **6-Parameter Business Audit**: Comprehensive analysis across digital presence, market visibility, operations, positioning, data insights, and compliance
- **Verified Lead Generation**: Generate 10-5,000+ leads per month with accuracy, deliverability, relevance, and compliance verification
- **Subscription Management**: Multiple pricing tiers with Stripe integration
- **PDF Report Generation**: Detailed audit reports with watermarking for free users
- **Usage Tracking**: Monitor audits, leads, and API credits with plan limits
- **Export Capabilities**: CSV/JSON export for leads
- **Real-time Analytics**: Dashboard with usage metrics and insights

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Server Actions
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **Authentication**: Supabase Auth with Google OAuth
- **Payments**: Stripe (Subscriptions, One-time payments, Billing portal)
- **PDF Generation**: pdf-lib
- **Charts**: Recharts
- **UI Components**: Radix UI, Shadcn/UI
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Stripe account
- (Optional) OpenAI API key for enhanced audit scoring
- (Optional) Hunter.io API key for email verification

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd sale44
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Fill in your environment variables:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Stripe Price IDs (create these in Stripe Dashboard)
STRIPE_STARTER_PRICE_ID=price_xxx
STRIPE_GROWTH_PRICE_ID=price_xxx
STRIPE_PRO_PRICE_ID=price_xxx

# Optional APIs
OPENAI_API_KEY=your_openai_api_key
HUNTER_API_KEY=your_hunter_api_key

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Set up Supabase:
   - Create a new Supabase project
   - Run the migration in `supabase/migrations/001_initial_schema.sql`
   - Enable Google OAuth in Authentication settings

5. Set up Stripe:
   - Create products and prices for each plan
   - Set up webhook endpoint pointing to `/api/webhooks/stripe`
   - Configure webhook events: `customer.subscription.*`, `invoice.payment_*`

6. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
sale44/
├── app/                    # Next.js 14 app directory
│   ├── (auth)/            # Auth-protected routes
│   │   ├── dashboard/     # Main dashboard
│   │   ├── audits/        # Audit management
│   │   ├── leads/         # Lead management
│   │   └── billing/       # Subscription management
│   ├── api/               # API routes
│   │   ├── audits/        # Audit creation and management
│   │   ├── leads/         # Lead generation and export
│   │   ├── billing/       # Stripe integration
│   │   └── webhooks/      # Stripe webhooks
│   ├── auth/              # Authentication pages
│   └── globals.css        # Global styles
├── components/            # Reusable UI components
│   ├── ui/                # Base UI components (Shadcn)
│   ├── dashboard/         # Dashboard-specific components
│   ├── audit/             # Audit-related components
│   └── billing/           # Billing components
├── lib/                   # Utility libraries
│   ├── supabase/          # Supabase client and types
│   ├── audit/             # Audit scoring logic
│   ├── leads/             # Lead generation logic
│   ├── pdf/               # PDF report generation
│   ├── stripe.ts          # Stripe configuration
│   └── utils.ts           # General utilities
├── supabase/              # Database migrations
└── public/                # Static assets
```

## Database Schema

The application uses the following main tables:

- `users`: User profiles with plan information
- `audits`: Business audit records with scores and insights
- `leads`: Generated leads with verification status
- `usage`: Monthly usage tracking per user
- `subscriptions`: Stripe subscription management

## API Endpoints

### Audits
- `POST /api/audits` - Create new audit
- `GET /api/audits` - Get user's audits
- `GET /api/audits/[id]/report` - Download PDF report

### Leads
- `POST /api/leads` - Generate leads from audit
- `GET /api/leads` - Get user's leads
- `GET /api/leads/export` - Export leads as CSV/JSON

### Billing
- `POST /api/billing/create-checkout` - Create Stripe checkout session
- `POST /api/billing/create-portal` - Create billing portal session
- `POST /api/webhooks/stripe` - Handle Stripe webhooks

## Deployment

### Vercel (Recommended)

1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy

### Manual Deployment

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

## Configuration

### Stripe Setup

1. Create products in Stripe Dashboard:
   - Starter Plan ($19/month)
   - Growth Plan ($59/month) 
   - Pro Plan ($149/month)

2. Create webhook endpoint:
   - URL: `https://yourdomain.com/api/webhooks/stripe`
   - Events: `customer.subscription.*`, `invoice.payment_*`

3. Update environment variables with price IDs

### Supabase Setup

1. Run the database migration
2. Enable Row Level Security
3. Configure authentication providers
4. Set up storage buckets (if needed)

## Features in Detail

### Business Audit System

The audit system analyzes websites across 6 parameters:

1. **Website & Digital Presence (30%)**: Design, SEO, mobile-friendliness
2. **Market Visibility & Reputation (25%)**: Social media, reviews, engagement
3. **Business Operations & Scalability (20%)**: Technology stack, automation
4. **Competitive Positioning (15%)**: Market differentiation, value proposition
5. **Data & Insight Capability (10%)**: Analytics, tracking, performance
6. **Compliance & Risk Management (10%)**: Privacy policies, security, compliance

### Lead Generation

- Generates leads based on audit insights
- Targets similar companies in same industry/geography
- Verifies leads for accuracy, deliverability, relevance, and compliance
- Supports filtering by industry, location, company size, and job titles

### Subscription Management

- Free tier with credit card gate
- Three paid tiers with different limits
- Automatic usage tracking and limit enforcement
- Stripe-powered billing with portal access
- Overage charging for soft caps

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@sale44.com or create an issue in the repository.
