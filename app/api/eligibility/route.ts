import { NextRequest, NextResponse } from "next/server";
import { EligibilityRequest, EligibilityResponse } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body: EligibilityRequest = await req.json();
    const { answers } = body;

    const { ageVerified, isCitizen, isResident, isRegistered } = answers;

    // All four must be answered
    if (ageVerified === null || isCitizen === null || isResident === null || isRegistered === null) {
      return NextResponse.json<EligibilityResponse>({
        eligible: false,
        reason: "Please answer all eligibility questions.",
        nextStep: "Answer all 4 questions to continue.",
      });
    }

    if (!ageVerified) {
      return NextResponse.json<EligibilityResponse>({
        eligible: false,
        reason: "You must be at least 18 years old on the qualifying date (e.g. Jan 1) to vote in India.",
        nextStep: "Unfortunately, you do not meet the age requirement yet. Use the Voter Helpline App to register when you come of age.",
      });
    }

    if (!isCitizen) {
      return NextResponse.json<EligibilityResponse>({
        eligible: false,
        reason: "Only Indian citizens are eligible to vote in national and state assembly elections.",
        nextStep: "If you need details about citizenship, please refer to the Ministry of Home Affairs.",
      });
    }

    if (!isResident) {
      return NextResponse.json<EligibilityResponse>({
        eligible: false,
        reason: "You must be an ordinary resident of the polling area where you wish to register.",
        nextStep: "Use Form 8 on voters.eci.gov.in to shift your constituency to your current residential address.",
      });
    }

    if (!isRegistered) {
      return NextResponse.json<EligibilityResponse>({
        eligible: true,
        reason: "You meet all eligibility requirements! However, your name must be on the electoral roll.",
        nextStep: "Fill out Form 6 online at voters.eci.gov.in to register as a new voter and get your EPIC card.",
      });
    }

    return NextResponse.json<EligibilityResponse>({
      eligible: true,
      reason: "Congratulations! You are eligible and registered to vote with your EPIC ID.",
      nextStep: "Proceed to verify your polling booth details and read up on the EVM process.",
    });
  } catch (error) {
    console.error("Eligibility API error:", error);
    return NextResponse.json({ error: "Failed to process eligibility check" }, { status: 500 });
  }
}
