import SectionProgressTracker from "./SectionProgressTracker";
import type { Section} from "../types/Budget";

export default function InsuranceTracker({ sectionArr }: { sectionArr: Section[] }) {
  return (
    <SectionProgressTracker
      sectionArr={sectionArr}
      sectionName="insurance"
      title="🛡️ Insurance Tracker"
      headerColor="bg-primary"
    />
  );
}
