import FinanceConfigurationBase from "./FinanceConfigurationBase";
import type { Section } from "../types/Budget";

export default function InsuranceConfiguration({ sectionArr }: { sectionArr: Section[] }) {
  return (
    <FinanceConfigurationBase
      sectionArr={sectionArr}
      sectionName="insurance"
      title="Insurance Configuration"
      typeLabel="Insurance Type"
      typePlaceholder="Eg:- LIFE, HEALTH, VEHICLE, HOME, TRAVEL, etc."
      categoryLabel="Insurance Category"
      categoryPlaceholder="Eg:- TERM LIFE, WHOLE LIFE, ENDOWMENT, ULIP, etc."
      detailLabel="Policy"
      detailLabelPlaceholder="Eg:- LIC Term Insurance, HDFC Life Click 2 Protect, etc."
    />
  );
}
