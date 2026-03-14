import SectionProgressTracker from "./SectionProgressTracker";
import type { Section} from "../types/Budget";

export default function InvestmentTracker({ sectionArr }: { sectionArr: Section[] }) {
  return (
    <SectionProgressTracker
      sectionArr={sectionArr}
      sectionName="investments"
      title="💹 Investment Tracker"
      headerColor="bg-success"
    />
  );
}
