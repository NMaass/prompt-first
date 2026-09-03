import type { Mission } from "./types"

export const missions: Mission[] = [
  {
    id: "shelter-shifts",
    title: "Shelter Shift Board",
    summary: "Build a volunteer signup product where limited shift capacity stays trustworthy on every screen size.",
    starter: "Build a volunteer shift signup product for a neighborhood animal shelter. Start with useful reversible implementation immediately, then verify the important behavior with evidence.",
    user: "People volunteering at a neighborhood animal shelter",
    problem: "Volunteers need to see available shifts and claim or cancel a place without overfilling a shift.",
    outcome: "A volunteer can confidently find an appropriate shift, claim it, see the remaining capacity, and cancel if plans change.",
    acceptance: [
      "A volunteer can browse upcoming shifts and see remaining capacity.",
      "A volunteer cannot claim a shift after its capacity is full.",
      "Cancelling a signup immediately reopens that place.",
      "The primary signup and cancellation journey works at mobile and desktop sizes.",
    ],
    quality: [
      "Primary controls have accessible names and labels.",
      "The primary journey is keyboard operable.",
      "Empty, full, success, and error states are understandable.",
    ],
    consequences: ["Claiming a scarce volunteer slot", "Cancelling a signup"],
    learning: ["observable acceptance criteria", "responsive verification", "capacity constraints", "accessibility evidence"],
    level: 1,
  },
  {
    id: "appointment-desk",
    title: "Appointment Desk",
    summary: "Build a booking product with multiple roles, exclusive timeslots, privacy boundaries, and failure recovery.",
    starter: "Build an appointment booking product for a small tutoring center. Treat role boundaries and double-booking prevention as consequential behavior and prove them.",
    user: "Students booking tutoring and staff managing the schedule",
    problem: "Students need available appointments while staff need schedule control without exposing private appointment information or allowing double booking.",
    outcome: "Students can book or cancel available appointments while staff can manage availability and see the information appropriate to their role.",
    acceptance: [
      "Two users cannot successfully claim the same appointment slot.",
      "Students can only see and modify their own bookings.",
      "Staff can create and close appointment availability.",
      "A failed booking attempt leaves the schedule in a consistent state and gives useful feedback.",
    ],
    quality: [
      "Role boundaries are enforced in product logic rather than only hidden in the interface.",
      "The booking journey remains usable on a small screen.",
      "Private appointment data is minimized in student-facing views.",
    ],
    consequences: ["Claiming exclusive appointment inventory", "Changing role-restricted schedule data"],
    learning: ["authorization", "conflicting actions", "negative-path testing", "privacy boundaries"],
    level: 2,
  },
  {
    id: "community-fundraiser",
    title: "Community Fundraiser",
    summary: "Build a fundraiser checkout with simulated payments and confirmation effects before any live consequence is considered.",
    starter: "Build a small community fundraiser checkout. Payments and confirmations must begin as simulations. Verify idempotency and failure behavior before discussing any live effect.",
    user: "People contributing to a local community fundraiser",
    problem: "Contributors need a clear checkout while organizers need trustworthy donation records without accidental duplicate charges or confirmations.",
    outcome: "A contributor can choose an amount, complete a simulated payment, and receive one simulated confirmation with an auditable receipt.",
    acceptance: [
      "A successful simulated payment creates exactly one donation record.",
      "Repeating the same submission does not create a duplicate payment effect.",
      "A simulated payment failure does not create a successful donation record or confirmation.",
      "A successful donation produces one simulated confirmation receipt.",
    ],
    quality: [
      "The checkout communicates mock versus live mode clearly.",
      "Payment and confirmation effects are visible in the evidence ledger.",
      "The checkout remains keyboard operable and usable on mobile.",
    ],
    consequences: ["Charging money", "Sending confirmation communication", "Recording a financial transaction"],
    learning: ["mock versus live integrations", "idempotency", "effect receipts", "release risk"],
    level: 3,
  },
]

export function customMission(idea: string): Mission {
  return {
    id: `custom-${crypto.randomUUID()}`,
    title: "Build your own product",
    summary: idea,
    starter: `Build this product: ${idea}\n\nStart reversible implementation immediately. Infer a Mission Contract, make assumptions visible, and gather evidence for the most important product behavior.`,
    user: "To be clarified from the learner's idea",
    problem: idea,
    outcome: "The learner's intended primary journey works and is supported by evidence.",
    acceptance: [
      "The primary user journey works from start to finish.",
      "Important failure and empty states are understandable.",
      "The primary journey works at mobile and desktop sizes.",
    ],
    quality: ["Baseline accessibility is checked.", "Important product claims are backed by evidence."],
    consequences: [],
    learning: ["requirements", "delegation", "verification", "calibrated release judgment"],
    level: "custom",
  }
}
