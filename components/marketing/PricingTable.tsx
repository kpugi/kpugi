'use client';

import { useState } from 'react';
import { Switch } from '@/components/base-ui/switch';
import { Button } from '@/components/base-ui/button';
import { FaCheckCircle } from 'react-icons/fa';
import { cn } from '@/lib/utils';

export interface PricingFeature {
  name: string;
}

export interface PricingTier {
  id: string;
  name: string;
  monthlyPrice: string;
  yearlyPrice: string;
  priceUnit: string;
  buttonText: string;
  isHighlighted?: boolean;
  features: PricingFeature[];
  onSelect?: () => void;
}

export interface Pricing2Props {
  title?: string;
  subtitle?: string;
  yearlyLabel?: string;
  monthlyLabel?: string;
  discountText?: string;
  tiers?: PricingTier[];
}

export const defaultTiers: PricingTier[] = [
  {
    id: 'tier-essential',
    name: 'Essential',
    monthlyPrice: '$0',
    yearlyPrice: '$0',
    priceUnit: 'Month',
    buttonText: 'Get Started Now',
    features: [
      { name: 'Up to 5 team members' },
      { name: 'Basic workspace analytics' },
      { name: 'Community forum access' },
      { name: 'Standard integrations' },
    ],
  },
  {
    id: 'tier-professional',
    name: 'Professional',
    monthlyPrice: '$39',
    yearlyPrice: '$29',
    priceUnit: 'Month',
    buttonText: 'Start 14-Day Free Trial',
    features: [
      { name: 'Unlimited team members' },
      { name: 'Advanced performance metrics' },
      { name: 'Priority email & chat support' },
      { name: 'Custom workflow automation' },
    ],
  },
  {
    id: 'tier-business',
    name: 'Business',
    monthlyPrice: '$149',
    yearlyPrice: '$119',
    priceUnit: 'Month',
    buttonText: 'Start 14-Day Free Trial',
    isHighlighted: true,
    features: [
      { name: 'Everything in Professional' },
      { name: 'Dedicated success manager' },
      { name: 'SAML Single Sign-On (SSO)' },
      { name: 'Role-based access control' },
      { name: 'Data export & compliance' },
    ],
  },
  {
    id: 'tier-enterprise',
    name: 'Enterprise',
    monthlyPrice: 'Custom',
    yearlyPrice: 'Custom',
    priceUnit: '',
    buttonText: 'Contact Sales Team',
    features: [
      { name: 'Custom deployment options' },
      { name: 'White-label branding' },
      { name: '24/7 dedicated phone support' },
      { name: 'Customized SLA agreements' },
    ],
  },
];

export const defaultAdvertisingTiers: PricingTier[] = [
  {
    id: 'tier-essential',
    name: 'Starter Drop',
    monthlyPrice: '₦150k',
    yearlyPrice: '₦120k',
    priceUnit: 'Week',
    buttonText: 'Select Starter Drop',
    features: [
      { name: '1x Medium Rectangle (300x250)' },
      { name: 'Native in-feed placement on /browse' },
      { name: 'Real-time impression & click analytics' },
      { name: 'Standard UTM link attribution' },
    ],
  },
  {
    id: 'tier-professional',
    name: 'Billboard Flight',
    monthlyPrice: '₦500k',
    yearlyPrice: '₦400k',
    priceUnit: '2 Weeks',
    buttonText: 'Select Billboard Drop',
    features: [
      { name: '1x Leaderboard (970x250 / 728x90)' },
      { name: '1x Mobile Sticky Banner (320x50)' },
      { name: '50%+ Above-the-fold Share of Voice' },
      { name: 'Weekly verified analytics breakdown' },
    ],
  },
  {
    id: 'tier-business',
    name: 'Complete Takeover',
    monthlyPrice: '₦1.5M',
    yearlyPrice: '₦1.2M',
    priceUnit: 'Month',
    buttonText: 'Select Complete Takeover',
    isHighlighted: true,
    features: [
      { name: 'Full Display Bundle (Billboard + MPU + Skyscraper)' },
      { name: 'Dedicated Friday Payout newsletter sponsorship' },
      { name: '1x Pinned "Featured Sponsor" in catalogue' },
      { name: '100% Category Share of Voice' },
      { name: 'Priority Ad Operations support' },
    ],
  },
  {
    id: 'tier-enterprise',
    name: 'Enterprise Network',
    monthlyPrice: 'Custom',
    yearlyPrice: 'Custom',
    priceUnit: '',
    buttonText: 'Contact Ad Sales Team',
    features: [
      { name: 'Custom multi-channel banner & email campaigns' },
      { name: 'Instant Drop Alert email blast sponsor' },
      { name: 'Custom A/B creative testing & 3rd-party tags' },
      { name: 'Dedicated Ad Operations account director' },
      { name: 'Custom SLA & invoicing agreements' },
    ],
  },
];

export function Pricing2({
  title = 'Simple, transparent pricing for teams of all sizes',
  subtitle = 'Choose the plan that fits your needs. No hidden fees, ever.',
  yearlyLabel = 'Pay Yearly',
  monthlyLabel = 'Pay Monthly',
  discountText = 'Save 20%',
  tiers = defaultTiers,
}: Pricing2Props) {
  const [isMonthly, setIsMonthly] = useState(true);

  return (
    <section className="bg-background w-full py-8 md:py-16">
      <div className="container mx-auto max-w-7xl px-4 md:px-6">
        <div className="mb-16 flex flex-col items-center justify-center space-y-4 text-center">
          {title && (
            <h2 className="text-foreground max-w-3xl text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-muted-foreground mt-4 max-w-2xl text-lg md:text-xl">
              {subtitle}
            </p>
          )}

          <div className="bg-muted border-border mt-8 flex items-center justify-center space-x-4 rounded-none border p-2">
            <div className="flex items-center">
              {discountText && (
                <span className="text-primary bg-primary/10 mr-3 rounded-none px-2.5 py-1 text-xs font-semibold md:text-sm">
                  {discountText}
                </span>
              )}
              <span
                className={cn(
                  'cursor-pointer text-sm font-medium transition-colors md:text-base',
                  !isMonthly ? 'text-foreground' : 'text-muted-foreground',
                )}
                onClick={() => setIsMonthly(false)}
              >
                {yearlyLabel}
              </span>
            </div>

            <Switch
              checked={isMonthly}
              onCheckedChange={setIsMonthly}
              className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted rounded-none shadow-[inset_0_0px_4px_1px_rgba(0,0,0,0.15)] [&_span]:rounded-none"
              aria-label="Toggle pricing period"
            />

            <span
              className={cn(
                'cursor-pointer text-sm font-medium transition-colors md:text-base',
                isMonthly ? 'text-foreground' : 'text-muted-foreground',
              )}
              onClick={() => setIsMonthly(true)}
            >
              {monthlyLabel}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 items-stretch gap-6 pt-4 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {tiers.map((tier) => {
            const priceToDisplay = isMonthly
              ? tier.monthlyPrice
              : tier.yearlyPrice;
            const isHighlighted = tier.isHighlighted;

            return (
              <div
                key={tier.id}
                className={cn(
                  'relative flex flex-col rounded-none border p-4 transition-all duration-300',
                  isHighlighted
                    ? 'bg-primary text-primary-foreground border-primary z-10 shadow-xl lg:-translate-y-4 lg:scale-105'
                    : 'bg-muted text-card-foreground border-border shadow-sm hover:shadow-md',
                )}
              >
                {isHighlighted && (
                  <div className="bg-muted border-border text-foreground absolute top-0 left-1/2 shrink-0 -translate-x-1/2 -translate-y-1/2 rounded-none border px-3 py-1 text-xs font-bold tracking-wider uppercase">
                    Popular
                  </div>
                )}

                <div className="mb-8">
                  <h3
                    className={cn(
                      'mb-4 text-xl font-semibold',
                      isHighlighted
                        ? 'text-primary-foreground'
                        : 'text-foreground',
                    )}
                  >
                    {tier.name}
                  </h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold tracking-tight md:text-5xl">
                      {priceToDisplay}
                    </span>
                    {tier.priceUnit && priceToDisplay !== 'Custom' && (
                      <span
                        className={cn(
                          'text-base font-medium',
                          isHighlighted
                            ? 'text-primary-foreground/80'
                            : 'text-muted-foreground',
                        )}
                      >
                        / {tier.priceUnit}
                      </span>
                    )}
                  </div>
                </div>

                <Button
                  className={cn(
                    'mb-8 w-full rounded-none py-6 font-semibold transition-all duration-200',
                    isHighlighted
                      ? 'bg-muted text-foreground hover:bg-muted/90'
                      : 'bg-primary text-primary-foreground hover:bg-primary/90',
                  )}
                  variant={isHighlighted ? 'secondary' : 'default'}
                  size="lg"
                  onClick={tier.onSelect}
                >
                  {tier.buttonText}
                </Button>

                <div className="flex flex-1 flex-col gap-4">
                  {tier.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <FaCheckCircle
                        className={cn(
                          'mt-0.5 h-5 w-5 shrink-0',
                          isHighlighted
                            ? 'text-primary-foreground'
                            : 'text-primary/80',
                        )}
                      />
                      <span
                        className={cn(
                          'text-sm leading-relaxed',
                          isHighlighted
                            ? 'text-primary-foreground/90'
                            : 'text-muted-foreground',
                        )}
                      >
                        {feature.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Pricing2;
