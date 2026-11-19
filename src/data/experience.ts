/**
 * EXPERIENCE: dates are "YYYY-MM". Entries render newest-first on the
 * timeline; the ruler range adjusts automatically.
 */

export type ExperienceItem = {
  id: string;
  role: string;
  org: string;
  detail?: string;
  location?: string;
  start: string;
  end: string;
  points: string[];
  tags: string[];
};

export const experience: ExperienceItem[] = [
  {
    id: "haloadmit",
    role: "Summer Marketing Intern",
    org: "HaloAdmit AI",
    detail: "Harvard-based ed-tech startup",
    start: "2026-05",
    end: "2026-06",
    points: [
      "Selected by the founder after an interview for a roughly 20-intern cohort.",
      "Created short-form UGC videos for TikTok and Instagram about college admissions.",
      "Supervised 16 waitlist sign-ups through a team referral code.",
    ],
    tags: ["TikTok", "Instagram", "UGC video"],
  },
  {
    id: "tutor",
    role: "Math Tutor",
    org: "Private tutoring",
    location: "Remote · video calls",
    start: "2025-01",
    end: "2026-12",
    points: [
      "Tutored four younger students in Algebra I and II through video calls.",
      "Covered homework, test preparation, and challenging mathematical concepts.",
    ],
    tags: ["Algebra I", "Algebra II"],
  },
];

/** High-school leadership: shown compactly in the About section. */
export const leadership = [
  {
    role: "Co-Founder & Vice President",
    org: "Asian & Pacific Islander Club",
    start: "2024-01",
    end: "2026-12",
    points: [
      "Planned monthly meetings.",
      "Raised $200 through a fundraising collaboration with a local boba shop.",
    ],
  },
  {
    role: "Co-Founder & Vice President",
    org: "VEX Robotics Club",
    start: "2025-01",
    end: "2026-12",
    points: ["Co-founded the club.", "Assembled a team of five for competition assembly."],
  },
];
