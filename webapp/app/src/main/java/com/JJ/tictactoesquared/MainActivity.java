package com.JJ.tictactoesquared;

import android.annotation.SuppressLint;
import android.content.Context;
import android.content.Intent;
import android.content.res.Configuration;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import android.view.KeyEvent;
import android.view.View;
import android.webkit.CookieManager;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import androidx.appcompat.app.AppCompatActivity;
import androidx.webkit.WebSettingsCompat;
import androidx.webkit.WebViewFeature;

import com.JJ.tictactoesquared.notification.Schedule;

import java.util.Objects;

public class MainActivity extends AppCompatActivity {
	
	String url;
	String backupUrl;
	
	String webViewUrl;
	
	@SuppressLint("SetJavaScriptEnabled")
	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.activity_main);
		Context context = MainActivity.this;
		//imported all webview knowledge from my other project: http://github.com/programminghoch10/weblauncher
		
		url = context.getString(R.string.url);
		backupUrl = context.getString(R.string.backupUrl);
		
		webViewUrl = url;
		//webview setup
		WebView webView = findViewById(R.id.webview);
		WebSettings webSettings = webView.getSettings();
		webSettings.setJavaScriptEnabled(true);
		webView.setWebViewClient(new WebViewClient() {
			@Override
			public boolean shouldOverrideUrlLoading(WebView view, String newurl) {
				//Log.d("TTT", "shouldOverrideUrlLoading: URL is " + newurl);
				if (newurl != null && newurl.startsWith(url)) {
					return false;
				} else {
					view.getContext().startActivity(
							new Intent(Intent.ACTION_VIEW, Uri.parse(newurl))
					);
					return true;
				}
			}
			
			@Override
			public void onPageFinished(WebView webView, String url) {
				setTitle(webView.getTitle());
				Objects.requireNonNull(getSupportActionBar()).setTitle(webView.getTitle());
			}
		});
		webSettings.setAppCacheEnabled(true);
		webSettings.setCacheMode(isNetworkConnected() ? WebSettings.LOAD_DEFAULT : WebSettings.LOAD_CACHE_ELSE_NETWORK);
		webSettings.setUserAgentString("ttts-webapp"); //useragent string is used on the website to know that its accessed over the app
		webView.setOnLongClickListener(new View.OnLongClickListener() {
			@Override
			public boolean onLongClick(View v) {
				return true;
			}
		});
		webView.setLongClickable(false);
		webView.setHapticFeedbackEnabled(true);
		int nightModeFlags = getResources().getConfiguration().uiMode & Configuration.UI_MODE_NIGHT_MASK;
		if (nightModeFlags == Configuration.UI_MODE_NIGHT_YES) {
			if (WebViewFeature.isFeatureSupported(WebViewFeature.FORCE_DARK)) {
				WebSettingsCompat.setForceDark(webView.getSettings(), WebSettingsCompat.FORCE_DARK_ON);
			}
			if (WebViewFeature.isFeatureSupported(WebViewFeature.FORCE_DARK_STRATEGY)) {
				WebSettingsCompat.setForceDarkStrategy(webView.getSettings(), WebSettingsCompat.DARK_STRATEGY_WEB_THEME_DARKENING_ONLY);
			}
		}
		
		//cookie setup
		CookieManager cookieManager = CookieManager.getInstance();
		cookieManager.setAcceptCookie(true);
		cookieManager.setCookie(url, "cookies-accepted=1");
		
		handleIntent(getIntent());
		
		webView.loadUrl(webViewUrl);
		
		//Log.d("TTT", "isNetworkConnected: " + isNetworkConnected());
		//Log.d("TTT", "onCreate: Currently saved cookies: " + CookieManager.getInstance().getCookie(MainActivity.this.getString(R.string.url)));
		Schedule.schedulePeriodic(context);
	}
	
	@Override
	protected void onStop() {
		super.onStop();
		if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
			CookieManager.getInstance().flush();
		}
		Schedule.scheduleAfterClose(MainActivity.this);
	}
	
	@Override
	public boolean onKeyDown(int keyCode, KeyEvent event) {
		WebView webView = findViewById(R.id.webview);
		if (keyCode == KeyEvent.KEYCODE_BACK) {
			if (webView.canGoBack()) {
				webView.goBack();
			} else {
				if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
					finishAndRemoveTask();
				}
				finishAffinity();
				finish();
				//System.exit(0);
			}
			return true;
		}
		return false;
	}
	
	protected boolean isNetworkConnected() {
		ConnectivityManager cm = (ConnectivityManager) getSystemService(Context.CONNECTIVITY_SERVICE);
		NetworkInfo networkInfo = cm.getActiveNetworkInfo();
		return networkInfo != null && networkInfo.isConnected();
	}
	
	@Override
	protected void onNewIntent(Intent intent) {
		super.onNewIntent(intent);
		handleIntent(intent);
	}
	
	protected void handleIntent(Intent intent) {
		String previousUrl = webViewUrl;
		//TODO: handle intent website url -> display in webview (only if needed)
		Uri appLinkData = intent.getData();
		//Log.d("TTT", "onCreate: Intent data is " + appLinkData);
		if (appLinkData != null) {
			if (appLinkData.getQueryParameter("token") != null && Objects.equals(appLinkData.getEncodedPath(), "/inputname.html")) {
				//TODO: add confirm question to not make users lose their account without knowledge
				
				// we do not need to set the cookie manually, inputname.html will do that when queried with token
				//cookieManager.setCookie(url, "secret=" + Base64.encodeToString(Objects.requireNonNull(appLinkData.getQueryParameter("token")).getBytes(), Base64.NO_WRAP);
				webViewUrl = appLinkData.toString();
			}
			if (Objects.equals(appLinkData.getEncodedPath(), "/multiplayer.html")) {
				webViewUrl = appLinkData.toString();
			}
			if (appLinkData.getQueryParameter("lobbyToken") != null && Objects.equals(appLinkData.getEncodedPath(), "/multiplayergame.html")) {
				webViewUrl = appLinkData.toString();
			}
		}
		if (!previousUrl.equals(webViewUrl))
			((WebView) findViewById(R.id.webview)).loadUrl(webViewUrl);
	}
}
