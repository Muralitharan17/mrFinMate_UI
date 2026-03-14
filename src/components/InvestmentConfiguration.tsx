import FinanceConfigurationBase from "./FinanceConfigurationBase";
import type { Section } from "../types/Budget";

export default function InvestmentConfiguration({ sectionArr }: { sectionArr: Section[] }) {
  return (
    <FinanceConfigurationBase
      sectionArr={sectionArr}
      sectionName="investments"
      title="Investment Configuration"
      typeLabel="Investment Type"
      typePlaceholder="e.g. MUTUAL FUND, STOCKS, BONDS, GOLD, SILVER, etc."
      categoryLabel="Investment Category"
      categoryPlaceholder="e.g. LARGE CAP, MID CAP, SMALL CAP, etc."
      detailLabel="Fund"
      detailLabelPlaceholder="e.g. HDFC Equity Fund, SBI Bluechip Fund, etc."
    />
  );
}
