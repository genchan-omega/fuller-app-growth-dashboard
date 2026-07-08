package com.example.minirecipelogger

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        setContent {
            MaterialTheme {
                MiniRecipeLoggerApp()
            }
        }
    }
}

@Composable
fun MiniRecipeLoggerApp() {
    val scope = rememberCoroutineScope()
    val statusMessage = remember { mutableStateOf("ログ送信待ち") }
    val searchKeyword = remember { mutableStateOf("") }

    LaunchedEffect(Unit) {
        try {
            sendEvent(
                eventName = "app_open",
                screenName = "home"
            )
            statusMessage.value = "app_open を送信しました"
        } catch (e: Exception) {
            statusMessage.value = "送信失敗: ${e.message}"
        }
    }

    Scaffold { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(24.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Text(
                text = "Mini Recipe Logger",
                style = MaterialTheme.typography.headlineMedium
            )

            Text(
                text = "ボタンを押すと、Next.js API経由でSupabaseにイベントログを保存します。",
                style = MaterialTheme.typography.bodyMedium
            )

            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors()
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Text(
                        text = "Recipe Actions",
                        style = MaterialTheme.typography.titleMedium
                    )

                    Button(
                        modifier = Modifier.fillMaxWidth(),
                        onClick = {
                            scope.launch {
                                runCatching {
                                    sendEvent(
                                        eventName = "recipe_list_view",
                                        screenName = "recipe_list"
                                    )
                                }.onSuccess {
                                    statusMessage.value = "recipe_list_view を送信しました"
                                }.onFailure {
                                    statusMessage.value = "送信失敗: ${it.message}"
                                }
                            }
                        }
                    ) {
                        Text("レシピ一覧を見る")
                    }

                    Button(
                        modifier = Modifier.fillMaxWidth(),
                        onClick = {
                            scope.launch {
                                runCatching {
                                    sendEvent(
                                        eventName = "recipe_detail_view",
                                        screenName = "recipe_detail",
                                        targetId = "recipe-001",
                                        metadata = mapOf(
                                            "recipe_title" to "Tomato Curry",
                                            "source" to "android_app"
                                        )
                                    )
                                }.onSuccess {
                                    statusMessage.value = "recipe_detail_view を送信しました"
                                }.onFailure {
                                    statusMessage.value = "送信失敗: ${it.message}"
                                }
                            }
                        }
                    ) {
                        Text("トマトカレーの詳細を見る")
                    }

                    Button(
                        modifier = Modifier.fillMaxWidth(),
                        onClick = {
                            scope.launch {
                                runCatching {
                                    sendEvent(
                                        eventName = "favorite_add",
                                        screenName = "recipe_detail",
                                        targetId = "recipe-001",
                                        metadata = mapOf(
                                            "recipe_title" to "Tomato Curry"
                                        )
                                    )
                                }.onSuccess {
                                    statusMessage.value = "favorite_add を送信しました"
                                }.onFailure {
                                    statusMessage.value = "送信失敗: ${it.message}"
                                }
                            }
                        }
                    ) {
                        Text("お気に入りに追加")
                    }
                }
            }

            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors()
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Text(
                        text = "Search",
                        style = MaterialTheme.typography.titleMedium
                    )

                    OutlinedTextField(
                        modifier = Modifier.fillMaxWidth(),
                        value = searchKeyword.value,
                        onValueChange = { searchKeyword.value = it },
                        label = { Text("検索キーワード") }
                    )

                    Button(
                        modifier = Modifier.fillMaxWidth(),
                        onClick = {
                            scope.launch {
                                runCatching {
                                    sendEvent(
                                        eventName = "recipe_search",
                                        screenName = "search",
                                        metadata = mapOf(
                                            "keyword" to searchKeyword.value
                                        )
                                    )
                                }.onSuccess {
                                    statusMessage.value = "recipe_search を送信しました"
                                }.onFailure {
                                    statusMessage.value = "送信失敗: ${it.message}"
                                }
                            }
                        }
                    ) {
                        Text("検索ログを送信")
                    }
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = "Status: ${statusMessage.value}",
                style = MaterialTheme.typography.bodyMedium
            )
        }
    }
}

suspend fun sendEvent(
    eventName: String,
    screenName: String,
    targetId: String? = null,
    metadata: Map<String, Any?> = emptyMap()
) {
    val url = URL("http://10.0.2.2:3000/api/events")

    val json = JSONObject().apply {
        put("user_id", "android-user-001")
        put("event_name", eventName)
        put("screen_name", screenName)
        put("target_id", targetId)
        put("metadata", JSONObject(metadata))
        put("device", "android")
        put("app_version", "1.0.0")
    }

    withContext(Dispatchers.IO) {
        val connection = url.openConnection() as HttpURLConnection
        connection.requestMethod = "POST"
        connection.setRequestProperty("Content-Type", "application/json")
        connection.doOutput = true

        connection.outputStream.use { outputStream ->
            outputStream.write(json.toString().toByteArray())
        }

        val responseCode = connection.responseCode
        connection.disconnect()

        if (responseCode !in 200..299) {
            throw RuntimeException("HTTP $responseCode")
        }
    }
}