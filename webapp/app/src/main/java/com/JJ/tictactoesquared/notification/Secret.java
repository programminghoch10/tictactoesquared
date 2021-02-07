package com.JJ.tictactoesquared.notification;

import android.content.Context;
import android.util.Base64;
import android.util.Log;
import android.webkit.CookieManager;

import com.JJ.tictactoesquared.R;

public class Secret {
	private static final String TAG = "Secret";
	private static final String cookieSearchName = "secret";
	
	public static String getSecret(Context context) throws CookieNotFoundException {
		
		CookieManager cookieManager = CookieManager.getInstance();
		String cookieString = cookieManager.getCookie(context.getString(R.string.url));
		String[] cookiesRaw = cookieString.split("; ");
		for (String cookie : cookiesRaw) {
			String cookieName = cookie.split("=")[0];
			String cookieValue = cookie.split("=")[1];
			if (cookieSearchName.equals(cookieName))
				return new String(Base64.decode(cookieValue, Base64.DEFAULT));
		}
		Log.d(TAG, "getSecret: could not acquire secret!");
		throw new CookieNotFoundException();
	}
}

class CookieNotFoundException extends Exception {
	public CookieNotFoundException(String errormessage) {
		super(errormessage);
	}
	
	public CookieNotFoundException() {
		super();
	}
}