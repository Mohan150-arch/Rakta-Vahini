# Rakta-Vahini: Android Kotlin Implementation

Copy this code into your Android Studio project to recreate the frontend UI.

## 1. Data Models (`Models.kt`)
```kotlin
enum class BloodGroup {
    APlus, AMinus, BPlus, BMinus, ABPlus, ABMinus, OPlus, OMinus;
    override fun toString(): String = name.replace("Plus", "+").replace("Minus", "-")
}

data class Donor(
    val id: String,
    val name: String,
    val bloodGroup: BloodGroup,
    val lastDonationDate: String, // ISO format yyyy-MM-dd
    val location: String,
    val isReady: Boolean = true
)
```

## 2. Main UI Component (`MainActivity.kt`)
```kotlin
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import java.time.LocalDate
import java.time.temporal.ChronoUnit

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            RaktaVahiniTheme {
                MainApp()
            }
        }
    }
}

@Composable
fun MainApp() {
    // This is where you would handle Navigation
    HomeScreen(
        userName = "Arjun",
        bloodGroup = "O+",
        lastDonation = "2024-01-15"
    )
}

@Composable
fun HomeScreen(userName: String, bloodGroup: String, lastDonation: String) {
    val lastDate = LocalDate.parse(lastDonation)
    val daysSince = ChronoUnit.DAYS.between(lastDate, LocalDate.now())
    val daysLeft = (90 - daysSince).coerceAtLeast(0)
    val isEligible = daysLeft <= 0

    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Text("Welcome,", fontSize = 12.sp, color = Color.Gray)
        Text(userName, fontSize = 24.sp, fontWeight = FontWeight.Bold)
        
        Spacer(modifier = Modifier.height(24.dp))
        
        // Status Card
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(24.dp),
            colors = CardDefaults.cardColors(
                containerColor = if (isEligible) Color(0xFFEA4335) else Color(0xFF1A1A1A)
            )
        ) {
            Column(modifier = Modifier.padding(24.dp)) {
                Text(bloodGroup, color = Color.White.copy(alpha = 0.5f), fontWeight = FontWeight.Bold)
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    if (isEligible) "Eligible to Donate" else "$daysLeft Days Left",
                    color = Color.White,
                    fontSize = 32.sp,
                    fontWeight = FontWeight.Bold
                )
                Spacer(modifier = Modifier.height(16.dp))
                LinearProgressIndicator(
                    progress = (daysSince.toFloat() / 90f).coerceIn(0f, 1f),
                    modifier = Modifier.fillMaxWidth(),
                    color = Color.White,
                    trackColor = Color.White.copy(alpha = 0.2f)
                )
            }
        }
    }
}
```

## 3. Retrofit Implementation (Option 1)

Add these dependencies to your `build.gradle` (Module: app):
```gradle
implementation 'com.squareup.retrofit2:retrofit:2.9.0'
implementation 'com.squareup.retrofit2:converter-gson:2.9.0'
```

### Retrofit Service (`ApiService.kt`)
```kotlin
import retrofit2.http.*
import retrofit2.Call

interface BloodApi {
    @GET("api/donors")
    fun getDonors(@Query("bloodGroup") group: String?): Call<List<Donor>>

    @POST("api/donors")
    fun registerDonor(@Body donor: Donor): Call<Donor>

    @PATCH("api/donors/{id}/status")
    fun updateStatus(@Path("id") id: String, @Body status: Map<String, Boolean>): Call<Donor>
}
```

### Connecting in Android Studio
Use the URL from your browser's address bar (e.g., `https://ais-dev-...run.app/`) as the `BASE_URL`.

```kotlin
val retrofit = Retrofit.Builder()
    .baseUrl("YOUR_APPLET_URL/") 
    .addConverterFactory(GsonConverterFactory.create())
    .build()

val api = retrofit.create(BloodApi::class.java)
```

## 4. Next Steps
- **Permissions**: Add `<uses-permission android:name="android.permission.INTERNET" />` to your `AndroidManifest.xml`.
- **Backend**: The Express server I just created now handles these requests! You can test by registering a donor in the app and seeing them appear in the API calls.
