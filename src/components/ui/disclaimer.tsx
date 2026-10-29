import * as React from "react";
import { AlertCircle, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export const MANDATORY_DISCLOSURE_VERSION = "2026.1";

export const MANDATORY_FULL_DISCLAIMER =
  "Arova provides potential business leads, not guaranteed business opportunities. Leads are not guaranteed to respond, convert, or generate revenue. You are responsible for contacting each business, pitching your services, following up, negotiating, and converting prospects into customers.";

export const MANDATORY_SHORT_DISCLAIMER =
  "Leads are prospects, not guaranteed customers. Conversion depends on your outreach, pitch, follow-up, and the business’s needs.";

export const MandatoryDisclaimerBanner: React.FC<{
  className?: string;
  variant?: "full" | "short";
}> = ({ className, variant = "full" }) => {
  return (
    <div
      role="note"
      className={cn(
        "rounded-[10px] border border-[rgba(200,105,56,0.3)] bg-[rgba(28,25,22,0.7)] p-4 text-xs text-[#D0CBC1] flex items-start gap-3 backdrop-blur-sm",
        className
      )}
    >
      <AlertCircle className="w-4 h-4 text-[#FFAA3D] shrink-0 mt-0.5" />
      <div className="space-y-1">
        <p className="font-semibold text-[#FFAA3D] uppercase tracking-wider text-[11px]">
          Mandatory Lead Limitation Notice
        </p>
        <p className="leading-relaxed">
          {variant === "full" ? MANDATORY_FULL_DISCLAIMER : MANDATORY_SHORT_DISCLAIMER}
        </p>
      </div>
    </div>
  );
};

export const DisclaimerAcknowledgementCheckbox: React.FC<{
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}> = ({ checked, onChange, className }) => {
  return (
    <div
      className={cn(
        "p-4 rounded-[10px] border border-[rgba(232,75,44,0.25)] bg-[#111110] space-y-2",
        className
      )}
    >
      <label className="flex items-start gap-3 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-1 h-4 w-4 rounded border-[rgba(243,240,232,0.2)] bg-[#161514] text-[#E84B2C] focus:ring-[#E84B2C] focus:ring-offset-[#080505]"
        />
        <span className="text-xs text-[#D0CBC1] leading-relaxed">
          <strong className="text-[#F3F0E8] block mb-0.5">
            I understand and acknowledge the lead limitation terms:
          </strong>
          {MANDATORY_FULL_DISCLAIMER}
        </span>
      </label>
      <div className="text-[10px] text-[#9E9B93] pl-7">
        Disclosure version: {MANDATORY_DISCLOSURE_VERSION} · Explicit acknowledgement is logged upon subscription activation.
      </div>
    </div>
  );
};
