# Rakta-Vahini: Android (Kotlin) Implementation Guide

Since you requested a Kotlin/Android implementation, here is a breakdown of how to port this React frontend to **Jetpack Compose**.

## 1. Project Setup
Add these dependencies to your `build.gradle`:
- **Navigation Compose**: For screen transitions.
- **Material3**: For the latest healthcare UI look.
- **Dagger Hilt**: For dependency injection.
- **Room**: For local database (Donation Log).

## 2. Core Logic (Eligibility)
```kotlin
fun isEligible(lastDonationDate: LocalDate): Boolean {
    val ninetyDaysAgo = LocalDate.now().minusDays(90)
    return lastDonationDate.isBefore(ninetyDaysAgo)
}
```

## 3. UI Components (Jetpack Compose)

### Eligibility Card
```kotlin
@Composable
fun EligibilityCard(daysLeft: Int, isEligible: Boolean) {
    Card(
        modifier = Modifier.fillMaxWidth().padding(16.dp),
        colors = CardDefaults.cardColors(
            containerColor = if (isEligible) Color(0xFFEA4335) else Color(0xFF1A1A1A)
        ),
        shape = RoundedCornerShape(32.dp)
    ) {
        Column(modifier = Modifier.padding(24.dp)) {
            Text("Status", style = MaterialTheme.typography.labelMedium)
            Text(
                if (isEligible) "Ready to Donate!" else "$daysLeft Days to go",
                style = MaterialTheme.typography.displaySmall
            )
            // LinearProgressIndicator here...
        }
    }
}
```

## 4. Emergency Search Filter
Use a `LazyColumn` to display donors filtered by blood group.
```kotlin
val eligibleDonors = allDonors.filter { 
    it.bloodGroup == selectedGroup && isEligible(it.lastDonationDate) && it.isReady 
}
```

## 5. Navigation
Define a `NavHost` with:
- `onboarding`
- `home`
- `search`
- `history`
- `profile`

The current React implementation in the preview simulates this flow perfectly so you can test the UX before coding the Android app!
