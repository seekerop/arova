"use client";

import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/navigation/dashboard-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { APPROVED_CATEGORIES } from "@/lib/constants/categories";
import { CheckCircle2, ShieldCheck, MapPin, RefreshCw } from "lucide-react";

export default function PreferencesPage() {
  const [selectedCategory, setSelectedCategory] = useState("Website & E-commerce");
  const [targetCities, setTargetCities] = useState<string[]>([
    "Mumbai",
    "Bengaluru",
    "Pune",
    "Hyderabad",
  ]);
  const [newCity, setNewCity] = useState("");
  const [weeklyPacing, setWeeklyPacing] = useState(true);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchPrefs = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/dashboard/preferences");
      if (res.ok) {
        const data = await res.json();
        if (data.preferences) {
          if (data.preferences.target_categories && data.preferences.target_categories[0]) {
            // Find category name by slug or use first
            const match = APPROVED_CATEGORIES.find(
              (c) => c.slug === data.preferences.target_categories[0] || c.name === data.preferences.target_categories[0]
            );
            if (match) setSelectedCategory(match.name);
          }
          if (Array.isArray(data.preferences.target_locations)) {
            setTargetCities(data.preferences.target_locations);
          }
          if (typeof data.preferences.weekly_pacing === "boolean") {
            setWeeklyPacing(data.preferences.weekly_pacing);
          }
        }
      }
    } catch (err) {
      console.error("Failed to load preferences:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrefs();
  }, []);

  const handleAddCity = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCity.trim() && !targetCities.includes(newCity.trim())) {
      setTargetCities([...targetCities, newCity.trim()]);
      setNewCity("");
    }
  };

  const handleRemoveCity = (city: string) => {
    setTargetCities(targetCities.filter((c) => c !== city));
  };

  const handleSavePreferences = async () => {
    setSaving(true);
    try {
      const match = APPROVED_CATEGORIES.find((c) => c.name === selectedCategory);
      const slug = match ? match.slug : "website-ecommerce";

      const res = await fetch("/api/dashboard/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target_categories: [slug],
          target_locations: targetCities,
          weekly_pacing: weeklyPacing,
        }),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (err) {
      console.error("Save preferences error:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <DashboardHeader
        title="Delivery Preferences"
        subtitle="Configure your target service category and regional delivery parameters"
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={handleSavePreferences}
            isLoading={saving}
          >
            {saved ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-[#34D399]" />
                Saved to Database
              </>
            ) : (
              "Save Preferences"
            )}
          </Button>
        }
      />

      <div className="p-6 md:p-8 space-y-8 max-w-5xl mx-auto w-full">
        {/* Category Selection (Strictly 5 approved categories, NO subcategories) */}
        <div className="space-y-4">
          <div>
            <h3 className="font-display text-lg font-bold text-[#F3F0E8]">
              Primary Service Category
            </h3>
            <p className="text-xs text-[#A39E93]">
              Choose one of the 5 approved commercial domains. Subcategories are not supported to preserve high matching precision.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {APPROVED_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.name;

              return (
                <div
                  key={cat.slug}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`p-4 rounded-[10px] border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-[#161514] border-[rgba(232,75,44,0.4)] shadow-[0_0_20px_rgba(232,75,44,0.1)]"
                      : "bg-[#111110] border-[rgba(243,240,232,0.06)] hover:border-[rgba(243,240,232,0.15)]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-xs text-[#F3F0E8]">
                      {cat.name}
                    </span>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-[#E84B2C]" />
                    )}
                  </div>
                  <p className="text-[11px] text-[#A39E93] mt-2 line-clamp-2">
                    {cat.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Geographic Focus */}
        <div className="space-y-4">
          <div>
            <h3 className="font-display text-lg font-bold text-[#F3F0E8]">
              Target Metro Cities & Regions
            </h3>
            <p className="text-xs text-[#A39E93]">
              Only leads with headquarters or commercial presence in these locations will be delivered to your review queue.
            </p>
          </div>

          <Card className="p-6 bg-[#111110] border-[rgba(243,240,232,0.08)] space-y-4">
            <div className="flex flex-wrap gap-2">
              {targetCities.map((city) => (
                <Badge
                  key={city}
                  variant="outline"
                  className="flex items-center gap-1.5 py-1.5 px-3 text-xs bg-[#161514] border-[rgba(232,75,44,0.25)] text-[#F3F0E8]"
                >
                  <MapPin className="w-3 h-3 text-[#FFAA3D]" />
                  <span>{city}</span>
                  <button
                    onClick={() => handleRemoveCity(city)}
                    className="ml-1 text-[#A39E93] hover:text-[#E84B2C]"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>

            <form onSubmit={handleAddCity} className="flex gap-2 max-w-md pt-2">
              <Input
                type="text"
                placeholder="Add city (e.g. Chennai, Kolkata, NCR)..."
                value={newCity}
                onChange={(e) => setNewCity(e.target.value)}
                className="text-xs"
              />
              <Button type="submit" variant="secondary" size="sm">
                Add City
              </Button>
            </form>
          </Card>
        </div>

        {/* Delivery Pacing Mode */}
        <div className="space-y-4">
          <div>
            <h3 className="font-display text-lg font-bold text-[#F3F0E8]">
              Scheduled Delivery Cadence
            </h3>
            <p className="text-xs text-[#A39E93]">
              Control how new lead offers are throttled into your queue across each 30-day billing window.
            </p>
          </div>

          <Card className="p-6 bg-[#111110] border-[rgba(243,240,232,0.08)]">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={weeklyPacing}
                onChange={(e) => setWeeklyPacing(e.target.checked)}
                className="mt-1 w-4 h-4 rounded bg-[#161514] border-[rgba(243,240,232,0.2)] text-[#E84B2C] focus:ring-0"
              />
              <div className="space-y-1">
                <span className="font-medium text-xs text-[#F3F0E8] block">
                  Enable Scheduled Pacing (Recommended)
                </span>
                <span className="text-xs text-[#A39E93] block">
                  Distributes your total monthly lead quota evenly across the 4 billing weeks rather than consuming your entire allocation in a single day.
                </span>
              </div>
            </label>
          </Card>
        </div>
      </div>
    </div>
  );
}
