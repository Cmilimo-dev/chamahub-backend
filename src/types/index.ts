
// Standardized types for the application
export interface Group {
  id: string;
  name: string;
  description: string;
  members: number;
  totalSavings: number;
  nextContribution: string;
  contributionAmount: number;
  role: string;
  // New customization fields
  minContributionAmount?: number;
  maxContributionAmount?: number;
  loanInterestRate?: number;
  maxLoanMultiplier?: number;
  allowPartialContributions?: boolean;
  contributionGracePeriodDays?: number;
  groupRules?: Record<string, any>;
}

export interface GroupCustomizationSetting {
  id: string;
  groupId: string;
  settingCategory: string;
  settingKey: string;
  settingValue: any;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
