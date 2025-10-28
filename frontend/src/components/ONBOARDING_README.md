# User Onboarding System

Complete onboarding and tutorial system for ChocoChoco game, designed to help new players understand game mechanics and navigate the interface smoothly.

## Components

### 1. OnboardingTour
Full-screen modal tour that introduces new players to the game concept and mechanics.

**Features:**
- 5-step interactive tour
- Animated cat illustrations
- Progress indicators
- Skip/Next navigation
- LocalStorage persistence

**Usage:**
```tsx
import { OnboardingTour, useOnboarding } from './components/OnboardingTour'

function MyPage() {
  const { hasSeenOnboarding, markAsCompleted } = useOnboarding()
  
  return (
    <>
      {/* Your page content */}
      
      {!hasSeenOnboarding && (
        <OnboardingTour
          onComplete={markAsCompleted}
          onSkip={markAsCompleted}
        />
      )}
    </>
  )
}
```

**Steps:**
1. **Welcome** - Game introduction
2. **How to Play** - Basic mechanics
3. **Commit Phase** - Tribe selection and staking
4. **Reveal & Win** - Reveal process and rewards
5. **Track Progress** - Leaderboard and stats

### 2. FeatureTooltip
Context-aware tooltips that highlight specific UI elements and explain their function.

**Features:**
- Smart positioning (top/bottom/left/right)
- Target element highlighting with pulse animation
- Sequential walkthrough
- Per-feature storage keys

**Usage:**
```tsx
import { FeatureTooltip } from './components/FeatureTooltip'
import { JOIN_PAGE_TOOLTIPS } from './lib/tooltip-configs'

function JoinPage() {
  return (
    <>
      {/* Add data-tooltip attributes to target elements */}
      <div data-tooltip="tribe-selection">
        {/* Your tribe selection UI */}
      </div>
      
      <FeatureTooltip
        steps={JOIN_PAGE_TOOLTIPS}
        onComplete={() => console.log('Tour complete!')}
        storageKey="chocochoco:tooltips:join"
      />
    </>
  )
}
```

### 3. HelpButton
Quick access button to replay the onboarding tour at any time.

**Features:**
- Compact button with ? icon
- Shows/hides tour on click
- Responsive design (text hidden on mobile)

**Usage:**
```tsx
import { HelpButton } from './components/HelpButton'

function Header() {
  return (
    <header>
      <nav>
        {/* Other nav items */}
        <HelpButton />
      </nav>
    </header>
  )
}
```

## Tooltip Configurations

Pre-configured tooltip steps for each page are available in `lib/tooltip-configs.ts`:

- `JOIN_PAGE_TOOLTIPS` - Commit flow tooltips
- `REVEAL_PAGE_TOOLTIPS` - Reveal process tooltips
- `CLAIM_PAGE_TOOLTIPS` - Rewards claiming tooltips
- `PROFILE_PAGE_TOOLTIPS` - Profile management tooltips
- `LEADERBOARD_PAGE_TOOLTIPS` - Leaderboard navigation tooltips

## Target Element Requirements

To use FeatureTooltip, add `data-tooltip` attributes to target elements:

```tsx
// Example: Join page tribe selection
<div data-tooltip="tribe-selection" className="...">
  <button>Milk Tribe</button>
  <button>Cacao Tribe</button>
</div>

// Example: Commit button
<Button data-tooltip="commit-button" onClick={handleCommit}>
  Commit
</Button>
```

## Storage Keys

The system uses localStorage to track completion:

- `chocochoco:onboarding:completed` - Main onboarding tour
- `chocochoco:tooltips:join` - Join page tooltips
- `chocochoco:tooltips:reveal` - Reveal page tooltips
- `chocochoco:tooltips:claim` - Claim page tooltips
- `chocochoco:tooltips:profile` - Profile page tooltips
- `chocochoco:tooltips:leaderboard` - Leaderboard tooltips

## Styling

Custom CSS for tooltip highlighting is exported from FeatureTooltip:

```tsx
import { FEATURE_TOOLTIP_STYLES } from './components/FeatureTooltip'

// Add to your global CSS or style tag
<style>{FEATURE_TOOLTIP_STYLES}</style>
```

## Accessibility

- Keyboard navigation support (Tab, Enter, Escape)
- Proper ARIA labels on close buttons
- Focus management during tours
- High contrast mode compatible

## Reset for Testing

To reset onboarding for testing:

```tsx
const { resetOnboarding } = useOnboarding()

// Call this to show onboarding again
resetOnboarding()

// Or clear all tooltip storage
localStorage.clear()
```

## Best Practices

1. **Show onboarding on first visit only** - Check `hasSeenOnboarding` before rendering
2. **Add data-tooltip attributes early** - Ensure elements exist before showing tooltips
3. **Use specific storage keys** - Different keys for different features
4. **Test on mobile** - Ensure tooltips fit on small screens
5. **Keep descriptions concise** - Users won't read long text
6. **Use appropriate icons** - Visual cues help understanding

## Future Enhancements

Potential improvements:
- Video tutorials integration
- Interactive sandbox mode
- Gamified tutorial rewards
- Multi-language support
- Adaptive tooltips based on user behavior
- Analytics tracking for tour completion rates
