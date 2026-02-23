import React, { useState } from 'react'
import { Check, Sparkles, Zap, Shield, GraduationCap } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const PLANS = [
    {
        id: 'free',
        name: 'Free',
        price: { monthly: 0, yearly: 0 },
        description: 'For individuals exploring AI grading.',
        icon: GraduationCap,
        color: 'bg-muted text-muted-foreground',
        features: [
            '30 papers / month',
            '5 answer keys',
            '3 question papers',
            'Basic AI grading',
            'Email support',
        ],
        cta: 'Current Plan',
        current: true,
    },
    {
        id: 'pro',
        name: 'Pro',
        price: { monthly: 499, yearly: 399 },
        description: 'For teachers who grade regularly.',
        icon: Zap,
        color: 'bg-primary/10 text-primary',
        popular: true,
        features: [
            'Unlimited papers',
            'Unlimited answer keys',
            'Unlimited question papers',
            'Advanced AI grading + rubrics',
            'Batch exports (PDF/Excel)',
            'Priority support',
        ],
        cta: 'Upgrade to Pro',
        current: false,
    },
    {
        id: 'school',
        name: 'School',
        price: { monthly: 1999, yearly: 1599 },
        description: 'For institutions with multiple teachers.',
        icon: Shield,
        color: 'bg-orange-100 text-orange-600',
        features: [
            'Everything in Pro',
            'Up to 30 teacher accounts',
            'Centralized admin dashboard',
            'Custom branding',
            'API access',
            'Dedicated account manager',
        ],
        cta: 'Contact Sales',
        current: false,
    },
]

export default function Pricing() {
    const [yearly, setYearly] = useState(false)

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="text-center space-y-2 max-w-xl mx-auto">
                <h2 className="text-3xl font-bold tracking-tight">Simple, Transparent Pricing</h2>
                <p className="text-muted-foreground">
                    Start free, upgrade when you're ready. No hidden fees.
                </p>

                {/* Toggle */}
                <div className="inline-flex items-center gap-3 mt-4 bg-muted p-1 rounded-full">
                    <button
                        onClick={() => setYearly(false)}
                        className={cn(
                            'px-4 py-1.5 rounded-full text-sm font-medium transition-all',
                            !yearly ? 'bg-white shadow text-primary' : 'text-muted-foreground'
                        )}
                    >
                        Monthly
                    </button>
                    <button
                        onClick={() => setYearly(true)}
                        className={cn(
                            'px-4 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-2',
                            yearly ? 'bg-white shadow text-primary' : 'text-muted-foreground'
                        )}
                    >
                        Yearly
                        <Badge variant="secondary" className="text-xs">Save 20%</Badge>
                    </button>
                </div>
            </div>

            {/* Cards */}
            <div className="grid gap-6 md:grid-cols-3">
                {PLANS.map(plan => {
                    const Icon = plan.icon
                    const price = yearly ? plan.price.yearly : plan.price.monthly
                    return (
                        <Card
                            key={plan.id}
                            className={cn(
                                'relative flex flex-col transition-all',
                                plan.popular && 'border-primary shadow-lg shadow-primary/10'
                            )}
                        >
                            {plan.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    <Badge className="gap-1 px-3">
                                        <Sparkles className="w-3 h-3" /> Most Popular
                                    </Badge>
                                </div>
                            )}
                            <CardHeader className="space-y-1">
                                <div className={`p-2 inline-flex rounded-lg w-fit ${plan.color}`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <CardTitle>{plan.name}</CardTitle>
                                <CardDescription>{plan.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col flex-1 gap-6">
                                {/* Price */}
                                <div className="flex items-baseline gap-1">
                                    {price === 0 ? (
                                        <span className="text-4xl font-bold">Free</span>
                                    ) : (
                                        <>
                                            <span className="text-sm text-muted-foreground">₹</span>
                                            <span className="text-4xl font-bold">{price}</span>
                                            <span className="text-sm text-muted-foreground">/mo</span>
                                        </>
                                    )}
                                </div>

                                {/* Features */}
                                <ul className="space-y-2 flex-1">
                                    {plan.features.map((f, i) => (
                                        <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Check className="w-4 h-4 text-primary shrink-0" />
                                            {f}
                                        </li>
                                    ))}
                                </ul>

                                <Button
                                    className="w-full"
                                    variant={plan.current ? 'outline' : plan.popular ? 'default' : 'outline'}
                                    disabled={plan.current}
                                >
                                    {plan.cta}
                                </Button>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {/* Footer note */}
            <p className="text-center text-sm text-muted-foreground">
                All plans include a 14-day free trial. Cancel anytime. Questions?{' '}
                <a href="mailto:support@gradeglide.com" className="text-primary hover:underline">
                    Contact us
                </a>
            </p>
        </div>
    )
}
