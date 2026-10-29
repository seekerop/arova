"use client";

import { useState } from "react";
import { DashboardHeader } from "@/components/navigation/dashboard-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { APPROVED_CATEGORIES } from "@/lib/constants/categories";
import { CheckCircle2, ShieldCheck, MapPin } from "lucide-react";

export default function PreferencesPage() {
  const [selectedCategory, setSelectedCategory] = useState("Website & E-commerce");
  const [targetCities, setTargetCities] = useState<string[]>([
    "Mumbai",
    "Bengaluru",
    "Pune",
    "Hyderabad",
  ]);
  const [newCity, setNewCity] = useState("");
  const [saved, setSaved] = useState(false);

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

  const handleSavePreferences = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col">
      <DashboardHeader
        title="Delivery Preferences"
        subtitle="Configure your target service category and regional delivery parameters"
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
                  className={`p-5 rounded-[12px] border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-[#161514] border-[rgba(232,75,44,0.45)] shadow-[0_0_20px_rgba(232,75,44,0.15)] ring-1 ring-[#E84B2C]"
                      : "bg-[#111110] border-[rgba(243,240,232,0.08)] hover:border-[rgba(243,240,232,0.16)]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-display font-semibold text-sm text-[#F3F0E8]">
                      {cat.name}
                    </h4>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-[#E84B2C]" />
                    )}
                  </div>
                  <p className="text-xs text-[#A39E93] mt-2 line-clamp-2">
                    {cat.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Location Preferences */}
        <div className="space-y-4 pt-4 border-t border-[rgba(243,240,232,0.06)]">
          <div>
            <h3 className="font-display text-lg font-bold text-[#F3F0E8]">
              Target Location Focus
            </h3>
            <p className="text-xs text-[#A39E93]">
              Add preferred cities or metropolitan areas across India for lead routing prioritization.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {targetCities.map((city) => (
              <span
                key={city}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#161514] border border-[rgba(243,240,232,0.1)] text-xs text-[#F3F0E8]"
              >
                <MapPin className="w-3.5 h-3.5 text-[#FFAA3D]" />
                {city}
                <button
                  type="button"
                  onClick={() => handleRemoveCity(city)}
                  className="ml-1 text-[#A39E93] hover:text-[#E84B2C]"
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          <form onSubmit={handleAddCity} className="flex gap-2 max-w-sm">
            <input
              type="text"
              placeholder="Add another city (e.g. Delhi NCR)..."
              value={newCity}
              onChange={(e) => setNewCity(e.target.value)}
              className="flex h-9 w-full rounded-[6px] border border-[rgba(243,240,232,0.12)] bg-[#111110] px-3 py-1 text-xs text-[#F3F0E8] focus:outline-none focus:border-[#E84B2C]"
            />
            <Button type="submit" variant="secondary" size="sm">
              Add
            </Button>
          </form>
        </div>

        {/* Save CTA */}
        <div className="pt-4 border-t border-[rgba(243,240,232,0.06)] flex items-center justify-between">
          {saved ? (
            <span className="text-xs text-[#34D399] font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Delivery preferences updated successfully.
            </span>
          ) : (
            <span className="text-xs text-[#A39E93]">
              Updates apply to all future automated lead delivery rounds.
            </span>
          )}
          <Button variant="primary" onClick={handleSavePreferences}>
            Save Preferences
          </Button>
        </div>
      </div>
    </div>
  );
}
