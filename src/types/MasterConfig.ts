export interface MasterConfig {
  id?: number;
  profileId: number;
  profileName: string;
  month: string | null;
  year: string | null;
  configName: string;
  configValue: string;
  description: string;
}