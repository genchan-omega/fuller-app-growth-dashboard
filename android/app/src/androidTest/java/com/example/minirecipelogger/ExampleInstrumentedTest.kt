package com.example.minirecipelogger

import android.content.Context
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.platform.app.InstrumentationRegistry

import org.junit.Test
import org.junit.runner.RunWith

import org.junit.Assert.*

/**
 * Instrumented test, which will execute on an Android device.
 *
 * See [testing documentation](http://d.android.com/tools/testing).
 */
@RunWith(AndroidJUnit4::class)
class ExampleInstrumentedTest {
    @Test
    fun useAppContext() {
        // Context of the app under test.
        val appContext = InstrumentationRegistry.getInstrumentation().targetContext
        assertEquals("com.example.minirecipelogger", appContext.packageName)
    }

    @Test
    fun anonymousUserIdPersistsForSameInstall() {
        val testContext = InstrumentationRegistry.getInstrumentation().context
        val preferences = testContext.getSharedPreferences(
            "mini_recipe_logger_user",
            Context.MODE_PRIVATE
        )
        preferences.edit().clear().commit()

        val firstUserId = getOrCreateAnonymousUserId(testContext)
        val secondUserId = getOrCreateAnonymousUserId(testContext)

        assertTrue(firstUserId.startsWith("android-user-"))
        assertEquals(firstUserId, secondUserId)
    }
}
