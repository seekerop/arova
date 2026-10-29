import { PublicHeader } from "@/components/navigation/public-header";
import { PublicFooter } from "@/components/navigation/public-footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MandatoryDisclaimerBanner } from "@/components/ui/disclaimer";
import { APPROVED_CATEGORIES } from "@/lib/constants/categories";
import Link from "next/link";
import { Code2, Film, TrendingUp, ShoppingBag, Cpu, ArrowRight } from "lucide-react";

export default function CategoriesPage() {
  const iconMap: Record<string, any> = {
    Code2,
    Film,
    TrendingUp,
    ShoppingBag,
    Cpu,
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#080505]">
      <PublicHeader />

      <main className="flex-1 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16">
          {/* Header */}
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <Badge variant="amber" size="sm">
              APPROVED DOMAINS
            </Badge>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-[#F3F0E8]">
              The 5 Approved Categories
            </h1>
            <p className="text-sm sm:text-base text-[#D0CBC1] leading-relaxed">
              We specialize strictly in five flat, high-demand commercial domains. By focusing our manual sourcing exclusively on these sectors, we eliminate spam and deliver relevant commercial prospects.
            </p>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {APPROVED_CATEGORIES.map((cat, idx) => {
              const Icon = iconMap[cat.icon] || Code2;
              return (
                <Card
                  key={cat.slug}
                  className="bg-[#111110] border-[rgba(243,240,232,0.08)] hover:border-[rgba(232,75,44,0.35)] p-8 space-y-6 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-[10px] bg-[#161514] border border-[rgba(243,240,232,0.1)] flex items-center justify-center text-[#FFAA3D]">
                      <Icon className="w-6 h-6 text-[#E84B2C]" />
                    </div>
                    <div>
                      <span className="font-technical text-xs font-semibold text-[#A39E93]">
                        CATEGORY 0{idx + 1}
                      </span>
                      <h3 className="font-display text-xl font-bold text-[#F3F0E8] mt-1">
                        {cat.name}
                      </h3>
                    </div>
                    <p className="text-xs sm:text-sm text-[#A39E93] leading-relaxed">
                      {cat.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[rgba(243,240,232,0.06)] flex items-center justify-between text-xs">
                    <span className="text-[#34D399] font-medium flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#34D399]" />
                      Active Inventory
                    </span>
                    <Link
                      href={`/pricing`}
                      className="text-[#FFAA3D] hover:text-[#F3F0E8] font-medium transition-colors"
                    >
                      Subscribe →
                    </Link>
                  </div>
                </Card>
              );
            })}

            {/* Strict Operating Policy Card */}
            <Card className="bg-[#161514] border-[rgba(200,105,56,0.25)] p-8 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <Badge variant="copper" size="sm">
                  STRICT OPERATING POLICY
                </Badge>
                <h3 className="font-display text-xl font-bold text-[#F3F0E8]">
                  Zero Subcategory Complexity
                </h3>
                <p className="text-xs text-[#A39E93] leading-relaxed">
                  Arova does not support subcategories, multi-tiered tagging trees, or noisy nested filters. Leads belong strictly to one of these 5 flat categories with optional flat location/industry tags.
                </p>
              </div>
              <Link href="/pricing" className="block pt-2">
                <Button variant="secondary" className="w-full text-xs">
                  Review Plan Options
                </Button>
              </Link>
            </Card>
          </div>

          <div className="max-w-4xl mx-auto">
            <MandatoryDisclaimerBanner variant="full" />
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

