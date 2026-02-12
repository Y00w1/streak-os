import { ContributionProvider } from '../../domain/ports/ContributionProvider'
import { Streak } from '../../domain/entities/Streak'

export class CalculateStreak {
  constructor(
    private readonly provider: ContributionProvider
  ) {}

  async execute(username: string): Promise<Streak> {
    const dates = await this.provider.getActivityDates(username)

    if (!dates.length) {
      return new Streak(0, new Date(0))
    }

    const sorted = dates.sort((a, b) => b.getTime() - a.getTime())

    let streak = 1

    for (let i = 1; i < sorted.length; i++) {
      const diff =
        (sorted[i - 1].getTime() - sorted[i].getTime()) /
        (1000 * 60 * 60 * 24)

      if (diff <= 1.5) {
        streak++
      } else {
        break
      }
    }

    return new Streak(streak, sorted[0])
  }
}
