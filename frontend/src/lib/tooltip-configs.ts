import { TooltipStep } from '../components/FeatureTooltip'

export const JOIN_PAGE_TOOLTIPS: TooltipStep[] = [
  {
    id: 'join-tribe-selection',
    targetSelector: '[data-tooltip="tribe-selection"]',
    title: 'Choose Your Tribe 🎯',
    description: 'Select between Milk or Cacao tribe. Remember: the minority wins! Think strategically.',
    placement: 'bottom',
    icon: 'shield',
  },
  {
    id: 'join-salt-input',
    targetSelector: '[data-tooltip="salt-input"]',
    title: 'Keep Your Salt Secret 🔐',
    description: 'This random salt keeps your choice hidden until reveal phase. Save it securely!',
    placement: 'right',
    icon: 'sparkles',
  },
  {
    id: 'join-stake-input',
    targetSelector: '[data-tooltip="stake-input"]',
    title: 'Enter Your Stake 💰',
    description: 'Choose how many FOOD tokens to stake. Higher stake = bigger potential rewards!',
    placement: 'bottom',
    icon: 'treasury',
  },
  {
    id: 'join-commit-button',
    targetSelector: '[data-tooltip="commit-button"]',
    title: 'Commit Your Choice ✅',
    description: 'Click here to submit your commitment. Once committed, your choice is locked until reveal!',
    placement: 'top',
    icon: 'success',
  },
  {
    id: 'join-countdown',
    targetSelector: '[data-tooltip="countdown"]',
    title: 'Watch the Clock ⏱️',
    description: 'Commit before time runs out! After the deadline, you can reveal your choice.',
    placement: 'left',
    icon: 'history',
  },
]

export const REVEAL_PAGE_TOOLTIPS: TooltipStep[] = [
  {
    id: 'reveal-list',
    targetSelector: '[data-tooltip="reveal-list"]',
    title: 'Your Past Commits 📜',
    description: 'See all your previous commitments here. Click on any to reveal during reveal phase.',
    placement: 'bottom',
    icon: 'history',
  },
  {
    id: 'reveal-button',
    targetSelector: '[data-tooltip="reveal-button"]',
    title: 'Reveal Your Choice 🎭',
    description: 'Use your saved salt to reveal your tribe. This proves you committed honestly!',
    placement: 'top',
    icon: 'sparkles',
  },
  {
    id: 'reveal-results',
    targetSelector: '[data-tooltip="reveal-results"]',
    title: 'Check Results 🏆',
    description: 'After revealing, see if you were in the minority tribe and won rewards!',
    placement: 'bottom',
    icon: 'trophy',
  },
]

export const CLAIM_PAGE_TOOLTIPS: TooltipStep[] = [
  {
    id: 'claim-winnings',
    targetSelector: '[data-tooltip="claim-winnings"]',
    title: 'Claim Your Rewards 💎',
    description: 'If you were in the minority tribe, claim your share of the pot here!',
    placement: 'bottom',
    icon: 'treasury',
  },
  {
    id: 'claim-history',
    targetSelector: '[data-tooltip="claim-history"]',
    title: 'Earnings History 📊',
    description: 'Track all your past winnings and see your total earnings over time.',
    placement: 'right',
    icon: 'history',
  },
]

export const PROFILE_PAGE_TOOLTIPS: TooltipStep[] = [
  {
    id: 'profile-avatar',
    targetSelector: '[data-tooltip="profile-avatar"]',
    title: 'Choose Your Cat Avatar 🐱',
    description: 'Pick from 45+ adorable cat avatars to represent you in the game!',
    placement: 'bottom',
    icon: 'sparkles',
  },
  {
    id: 'profile-stats',
    targetSelector: '[data-tooltip="profile-stats"]',
    title: 'Your Game Stats 📈',
    description: 'View your win rate, total earnings, games played, and current rank.',
    placement: 'right',
    icon: 'trophy',
  },
]

export const LEADERBOARD_PAGE_TOOLTIPS: TooltipStep[] = [
  {
    id: 'leaderboard-top-payouts',
    targetSelector: '[data-tooltip="leaderboard-top-payouts"]',
    title: 'Top Earners 🏆',
    description: 'See the highest earning players. Compete to get on this list and earn special badges!',
    placement: 'bottom',
    icon: 'treasury',
  },
  {
    id: 'leaderboard-win-rate',
    targetSelector: '[data-tooltip="leaderboard-win-rate"]',
    title: 'Best Win Rates 🎯',
    description: 'These players have the highest winning percentage. Can you beat them?',
    placement: 'bottom',
    icon: 'trophy',
  },
]
