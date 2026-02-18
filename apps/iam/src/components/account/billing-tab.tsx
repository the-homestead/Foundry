"use client";

import { Button } from "@foundry/ui/primitives/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@foundry/ui/primitives/card";
import { CreditCard, DollarSign, Gift, Receipt } from "lucide-react";

export function BillingTab() {
    return (
        <div className="space-y-6">
            {/* Current Subscription */}
            <Card>
                <CardHeader>
                    <CardTitle>Current Subscription</CardTitle>
                    <CardDescription>Manage your subscription and billing details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="flex items-start gap-3">
                            <CreditCard className="mt-1 h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="font-medium">Free Plan</p>
                                <p className="text-muted-foreground text-sm">You're currently on the free plan with basic features</p>
                            </div>
                        </div>
                        <Button disabled variant="outline">
                            Upgrade
                        </Button>
                    </div>

                    <div className="rounded-lg bg-muted/50 p-4">
                        <p className="text-center text-muted-foreground text-sm">
                            <Gift className="mr-1 inline h-4 w-4" />
                            Premium features and subscriptions coming soon!
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Billing History */}
            <Card>
                <CardHeader>
                    <CardTitle>Billing History</CardTitle>
                    <CardDescription>View and download your invoices</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center space-y-3 py-8">
                        <Receipt className="h-12 w-12 text-muted-foreground" />
                        <p className="text-center text-muted-foreground">No billing history yet</p>
                        <p className="max-w-md text-center text-muted-foreground text-sm">Your invoices and payment receipts will appear here once you subscribe to a plan</p>
                    </div>
                </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
                <CardHeader>
                    <CardTitle>Payment Method</CardTitle>
                    <CardDescription>Manage your payment methods and billing address</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center space-y-3 py-8">
                        <CreditCard className="h-12 w-12 text-muted-foreground" />
                        <p className="text-center text-muted-foreground">No payment method on file</p>
                        <Button disabled variant="outline">
                            Add Payment Method
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Donations */}
            <Card>
                <CardHeader>
                    <CardTitle>Support Development</CardTitle>
                    <CardDescription>Help us continue improving Foundry</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-start gap-3 rounded-lg border p-4">
                        <DollarSign className="mt-1 h-5 w-5 text-muted-foreground" />
                        <div className="flex-1">
                            <p className="font-medium">Make a Donation</p>
                            <p className="text-muted-foreground text-sm">Your contributions help us maintain and improve Foundry for everyone</p>
                        </div>
                    </div>

                    <div className="rounded-lg bg-muted/50 p-4">
                        <p className="text-center text-muted-foreground text-sm">
                            <Gift className="mr-1 inline h-4 w-4" />
                            Donation options coming soon! Thank you for your support.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
