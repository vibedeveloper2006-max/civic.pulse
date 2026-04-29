import { SmartStepper } from "@/components/SmartStepper";
import { Card, CardContent } from "@/components/ui/Card";
import { ExternalLink, BookOpen, Shield, CheckSquare } from "lucide-react";

const RESOURCES = [
  {
    title: "Register to Vote (Form 6)",
    description: "Use the Voters Service Portal to register for your EPIC card online.",
    href: "https://voters.eci.gov.in/",
    icon: CheckSquare,
    cta: "Register Now",
  },
  {
    title: "Electoral Search",
    description: "Check if your name is already enrolled in the Electoral Roll.",
    href: "https://electoralsearch.eci.gov.in/",
    icon: Shield,
    cta: "Search Roll",
  },
  {
    title: "Know Your Candidate",
    description: "Use the KYC App to verify details of contesting candidates.",
    href: "https://eci.gov.in/it-applications/mobile-applications/kyc-know-your-candidate-r38/",
    icon: BookOpen,
    cta: "Know Candidate",
  },
];

const VOTING_TIPS = [
  "Bring your EPIC card (Voter ID) or an ECI-approved alternative photo ID to the booth.",
  "Check your Polling Station location via the Voter Helpline App or 1950 in advance.",
  "Ensure your name is explicitly in the voter list—having an EPIC card alone without a roll entry isn't enough.",
  "Mobile phones are generally NOT allowed inside the polling booth.",
  "You will press the blue button on the Balloting Unit against the candidate of your choice.",
  "Listen for the loud beep and look at the VVPAT slip printout to confirm your vote.",
];

export default function GuidePage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-[#181c1e]">Voter Guide</h1>
        <p className="text-[#43474f] mt-1 text-sm">
          Your step-by-step roadmap from eligibility to casting your ballot.
        </p>
      </div>

      {/* Smart Stepper */}
      <SmartStepper />

      {/* Resources */}
      <div id="resources" className="scroll-mt-20">
        <h2 className="text-lg font-bold text-[#181c1e] mb-4">Official Resources</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {RESOURCES.map(({ title, description, href, icon: Icon, cta }) => (
            <Card key={title} elevated className="hover:border-[#002855] transition-colors group">
              <CardContent className="py-5 flex flex-col gap-3 h-full">
                <div className="w-9 h-9 bg-[#d6e3ff] rounded flex items-center justify-center">
                  <Icon className="w-5 h-5 text-[#002855]" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-[#181c1e] text-sm mb-1">{title}</h3>
                  <p className="text-xs text-[#43474f] leading-relaxed">{description}</p>
                </div>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#002855] hover:underline"
                >
                  {cta} <ExternalLink className="w-3 h-3" />
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Voting Tips */}
      <div id="tips" className="scroll-mt-20">
        <h2 className="text-lg font-bold text-[#181c1e] mb-4">Voting Day Tips</h2>
        <Card elevated>
          <CardContent className="py-5">
            <ul className="space-y-3">
              {VOTING_TIPS.map((tip, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-[#181c1e]">
                  <span className="w-5 h-5 rounded-full bg-[#002855] text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {tip}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
