import SectionProgressTracker from "./SectionProgressTracker";
import type { Section} from "../types/Budget";

export default function SavingsTracker({ sectionArr }: { sectionArr: Section[] }) {
  return (
    <SectionProgressTracker
      sectionArr={sectionArr}
      sectionName="savings"
      title="💰 Savings Tracker"
      headerColor="bg-success"
    />
  );
}
