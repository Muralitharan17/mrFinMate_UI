import FinanceConfigurationBase from "./FinanceConfigurationBase";
import type { Section } from "../types/Budget";

export default function InvestmentConfiguration({ sectionArr }: { sectionArr: Section[] }) {
  return (
    <FinanceConfigurationBase
      sectionArr={sectionArr}
      sectionName="wants"
      title="Want Configuration"
      typeLabel="Want Type"
      typePlaceholder="e.g. ELECTRONICS, FURNITURE, CLOTHING, etc."
      categoryLabel="Want Category"
      categoryPlaceholder="e.g. MOBILE, SOFA, SHIRTS, etc."
      detailLabel="Detail"
      detailLabelPlaceholder="e.g. MOBILE, SOFA, SHIRTS, etc."
    />
  );
}
