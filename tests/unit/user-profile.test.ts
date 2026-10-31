import { describe, it, expect } from "vitest";

function computeInitials(name?: string | null, email?: string | null): string {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  }
  if (email && email.trim()) {
    const prefix = email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "");
    if (prefix.length >= 2) {
      return prefix.slice(0, 2).toUpperCase();
    }
    return (prefix[0] || "U").toUpperCase();
  }
  return "U";
}

describe("Dashboard User Profile & Identity Helpers", () => {
  it("derives initials from multi-word full names", () => {
    expect(computeInitials("Avi Nigam", "avinigam@gmail.com")).toBe("AN");
    expect(computeInitials("Siddharth Mehta", "siddharth@studio.com")).toBe("SM");
    expect(computeInitials("John Doe", "john@example.com")).toBe("JD");
  });

  it("derives initials from single-word names", () => {
    expect(computeInitials("Avi", "avinigam@gmail.com")).toBe("AV");
    expect(computeInitials("K", "k@gmail.com")).toBe("K");
  });

  it("derives initials from email when name is omitted or whitespace", () => {
    expect(computeInitials("", "avinigam@gmail.com")).toBe("AV");
    expect(computeInitials("   ", "contact@agency.in")).toBe("CO");
    expect(computeInitials(null, "user@test.org")).toBe("US");
  });

  it("handles edge cases and fallbacks cleanly", () => {
    expect(computeInitials(null, null)).toBe("U");
    expect(computeInitials("", "")).toBe("U");
    expect(computeInitials(undefined, "a@b.com")).toBe("A");
  });
});
