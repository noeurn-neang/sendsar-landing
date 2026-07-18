import { OnboardingForm } from "./OnboardingForm";

export const metadata = {
  title: "Workspace setup",
  robots: { index: false, follow: false },
};

export default function OnboardingPage() {
  return <OnboardingForm />;
}
