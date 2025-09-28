# Sale44 Deployment Guide

This guide will help you deploy Sale44 to production using Vercel and set up all required services.

## Prerequisites

Before deploying, ensure you have:
- Vercel account
- Supabase account  
- Stripe account
- Domain name (optional, but recommended)

## Step 1: Supabase Setup

### 1.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note your project URL and anon key

### 1.2 Run Database Migration
1. Go to SQL Editor in Supabase dashboard
2. Copy and paste the content from `supabase/migrations/001_initial_schema.sql`
3. Execute the migration

### 1.3 Configure Authentication
1. Go to Authentication > Settings
2. Enable Google OAuth provider
3. Add your domain to allowed origins
4. Configure redirect URLs:
   - `https://yourdomain.com/auth/callback`
   - `http://localhost:3000/auth/callback` (for development)

## Step 2: Stripe Setup

### 2.1 Create Products and Prices
Create the following products in Stripe Dashboard:

**Starter Plan**
- Name: "Starter"
- Price: $19/month
- Recurring: Monthly
- Copy the Price ID

**Growth Plan**
- Name: "Growth" 
- Price: $59/month
- Recurring: Monthly
- Copy the Price ID

**Pro Plan**
- Name: "Pro"
- Price: $149/month
- Recurring: Monthly
- Copy the Price ID

### 2.2 Set Up Webhooks
1. Go to Developers > Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy the webhook signing secret

### 2.3 Enable Billing Portal
1. Go to Settings > Billing
2. Configure customer portal settings
3. Enable all features you want customers to access

## Step 3: Environment Variables

Create these environment variables in your deployment platform:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Stripe Price IDs
STRIPE_STARTER_PRICE_ID=price_xxx
STRIPE_GROWTH_PRICE_ID=price_xxx  
STRIPE_PRO_PRICE_ID=price_xxx

# Optional APIs
OPENAI_API_KEY=sk-xxx (for enhanced audit scoring)
HUNTER_API_KEY=xxx (for email verification)

# App URL
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## Step 4: Vercel Deployment

### 4.1 Connect Repository
1. Go to [vercel.com](https://vercel.com)
2. Import your Git repository
3. Select the Sale44 project

### 4.2 Configure Build Settings
Vercel should auto-detect Next.js settings:
- Framework Preset: Next.js
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

### 4.3 Add Environment Variables
1. Go to Project Settings > Environment Variables
2. Add all the environment variables from Step 3
3. Make sure to use production values (not test keys)

### 4.4 Deploy
1. Click "Deploy"
2. Wait for build to complete
3. Test the deployment

## Step 5: Domain Configuration (Optional)

### 5.1 Add Custom Domain
1. Go to Project Settings > Domains
2. Add your custom domain
3. Configure DNS records as instructed

### 5.2 Update Environment Variables
Update `NEXT_PUBLIC_APP_URL` to use your custom domain

### 5.3 Update Stripe Webhooks
Update webhook endpoint URL to use your custom domain

## Step 6: Post-Deployment Setup

### 6.1 Test Core Features
1. User registration and login
2. Business audit creation
3. Lead generation
4. PDF report download
5. Subscription upgrade flow
6. Billing portal access

### 6.2 Monitor Webhooks
1. Check Stripe webhook logs
2. Verify subscription events are processed
3. Test payment flows

### 6.3 Set Up Monitoring
Consider adding:
- Error tracking (Sentry)
- Analytics (Google Analytics)
- Uptime monitoring
- Performance monitoring

## Step 7: Production Checklist

### Security
- [ ] All API keys are production keys
- [ ] Webhook endpoints are secured
- [ ] CORS is properly configured
- [ ] Rate limiting is enabled
- [ ] SSL certificates are valid

### Functionality
- [ ] User registration works
- [ ] Email verification works
- [ ] Google OAuth works
- [ ] Audit creation works
- [ ] Lead generation works
- [ ] PDF reports generate
- [ ] Stripe payments work
- [ ] Webhooks process correctly
- [ ] Usage limits are enforced

### Performance
- [ ] Page load times are acceptable
- [ ] API responses are fast
- [ ] Database queries are optimized
- [ ] Images are optimized
- [ ] CDN is configured

### Monitoring
- [ ] Error tracking is set up
- [ ] Performance monitoring is active
- [ ] Uptime monitoring is configured
- [ ] Webhook monitoring is active

## Troubleshooting

### Common Issues

**Webhook Failures**
- Check webhook URL is correct
- Verify webhook secret matches
- Check Vercel function logs
- Ensure webhook events are selected

**Authentication Issues**
- Verify Supabase URLs are correct
- Check OAuth provider configuration
- Confirm redirect URLs are set

**Payment Issues**
- Verify Stripe keys are production keys
- Check price IDs are correct
- Confirm webhook is processing events

**Database Issues**
- Verify migration ran successfully
- Check RLS policies are active
- Confirm connection strings are correct

### Getting Help

1. Check Vercel deployment logs
2. Review Supabase logs
3. Check Stripe webhook logs
4. Review browser console errors
5. Check API response errors

## Maintenance

### Regular Tasks
- Monitor error rates
- Review webhook success rates
- Check database performance
- Update dependencies
- Review security settings
- Monitor usage patterns

### Scaling Considerations
- Database connection limits
- API rate limits
- Vercel function limits
- Stripe API limits
- Storage requirements

## Security Best Practices

1. **API Keys**: Never expose secret keys in client-side code
2. **Webhooks**: Always verify webhook signatures
3. **Database**: Use Row Level Security (RLS)
4. **Authentication**: Implement proper session management
5. **CORS**: Configure appropriate CORS policies
6. **Rate Limiting**: Implement rate limiting on APIs
7. **Monitoring**: Set up security monitoring and alerts

## Support

For deployment issues:
1. Check the troubleshooting section
2. Review service provider documentation
3. Check community forums
4. Contact support if needed

Remember to test thoroughly in a staging environment before deploying to production!
