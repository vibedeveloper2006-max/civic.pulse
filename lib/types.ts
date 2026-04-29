export type VoterState =
  | "NOT_STARTED"
  | "ELIGIBILITY_VERIFIED"
  | "REGISTERED"
  | "READY_TO_VOTE"
  | "VOTED";

export type Intent =
  | "CHECK_ELIGIBILITY"
  | "VERIFY_REGISTRATION"
  | "FIND_POLLING_PLACE"
  | "DEADLINE_QUERY"
  | "GENERAL";

export interface EligibilityAnswers {
  ageVerified: boolean | null;
  isCitizen: boolean | null;
  isResident: boolean | null;
  isRegistered: boolean | null;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface PollingPlace {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  distance: number;
  waitTime: number;
  isOpen: boolean;
  hours: string;
  lat: number;
  lng: number;
}

export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  category: "registration" | "election" | "deadline" | "result";
  isPast: boolean;
  isCurrent: boolean;
}

export interface UserProgress {
  state: VoterState;
  eligibilityAnswers: EligibilityAnswers;
  completedSteps: number[];
  location?: string;
  sessionId: string;
}

export interface AssistantRequest {
  message: string;
  history: { role: string; content: string }[];
  userState: VoterState;
}

export interface AssistantResponse {
  reply: string;
  intent: Intent;
  suggestions: string[];
}

export interface EligibilityRequest {
  answers: EligibilityAnswers;
}

export interface EligibilityResponse {
  eligible: boolean;
  reason: string;
  nextStep: string;
}
