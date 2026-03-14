import FinanceConfigurationBase from "./FinanceConfigurationBase";
import type { Section } from "../types/Budget";

export default function InvestmentConfiguration({ sectionArr }: { sectionArr: Section[] }) {
  return (
    <FinanceConfigurationBase
      sectionArr={sectionArr}
      sectionName="savings"
      title="Savings Configuration"
      typeLabel="Savings Type"
      typePlaceholder="e.g. BANK SAVINGS, RECURRING DEPOSIT (RD), FIXED DEPOSIT (FD), POST OFFICE SAVINGS, PIGGY BANK, EMERGENECY FUND, etc."
      categoryLabel="Savings Category"
      categoryPlaceholder="e.g. SHORT-TERM SAVINGS, LONG-TERM SAVINGS, EMERGENCY FUND, CHILD EDUCATION SAVINGS, TRAVEL SAVINGS, HOME PURCHASE SAVINGS, etc."
      detailLabel="Fund"
      detailLabelPlaceholder="e.g. SBI Savings Account, HDFC RD, ICICI FD, Post Office RD, Cash Envelope for Travel, Kids Education Fund, etc."
    />
  );
}
