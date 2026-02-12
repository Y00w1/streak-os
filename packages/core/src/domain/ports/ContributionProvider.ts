export interface ContributionProvider {
  getActivityDates(username: string): Promise<Date[]>
}