package com.JJ.tictactoesquared;

import android.annotation.SuppressLint;
import android.content.Context;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.webkit.CookieManager;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {
	
	@SuppressLint("SetJavaScriptEnabled")
	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.activity_main);
		Context context = MainActivity.this;
		//imported all webview knowledge from my other project: http://github.com/programminghoch10/weblauncher
		
		String url = context.getString(R.string.url);
		WebView webView = findViewById(R.id.webview);
		
		//webview setup
		WebSettings webSettings = webView.getSettings();
		webSettings.setJavaScriptEnabled(true);
		webView.setWebViewClient(new WebViewClient());
		webSettings.setAppCacheEnabled(true);
		webSettings.setCacheMode(isNetworkConnected() ? WebSettings.LOAD_DEFAULT : WebSettings.LOAD_CACHE_ELSE_NETWORK);
		webView.setOnLongClickListener(new View.OnLongClickListener() {
			@Override
			public boolean onLongClick(View v) {
				return true;
			}
		});
		webView.setLongClickable(false);
		webView.setHapticFeedbackEnabled(true);
		webView.loadUrl(url);
		
		//cookie setup
		CookieManager cookieManager = CookieManager.getInstance();
		cookieManager.acceptCookie();
		cookieManager.setCookie(url, "cookies-accepted=1");
		
		//Log.i("TTT", "isNetworkConnected: " + isNetworkConnected());
		//Log.d("TTT", "onCreate: Currently saved cookies: " + CookieManager.getInstance().getCookie(MainActivity.this.getString(R.string.url)));
	}
	
	@Override
	protected void onPause() {
		super.onPause();
		if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
			CookieManager.getInstance().flush();
		}
	}
	
	protected boolean isNetworkConnected() {
		ConnectivityManager cm = (ConnectivityManager) getSystemService(Context.CONNECTIVITY_SERVICE);
		NetworkInfo networkInfo = cm.getActiveNetworkInfo();
		return networkInfo != null && networkInfo.isConnected();
	}
}
