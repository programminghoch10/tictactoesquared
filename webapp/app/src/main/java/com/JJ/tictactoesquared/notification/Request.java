package com.JJ.tictactoesquared.notification;

import android.content.Context;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.work.Worker;
import androidx.work.WorkerParameters;

import com.android.volley.RequestQueue;
import com.android.volley.toolbox.JsonObjectRequest;
import com.android.volley.toolbox.Volley;

import org.json.JSONObject;

public class Request extends Worker {
	private static final String TAG = "NotificationRequest";
	private static final String url = "https://ttts.ji-games.com/api/notification";
	
	public Request(@NonNull Context context, @NonNull WorkerParameters workerParams) {
		super(context, workerParams);
	}
	
	@NonNull
	@Override
	public Result doWork() {
		Log.d(TAG, "doWork: notification request");
		
		RequestQueue requestQueue = Volley.newRequestQueue(getApplicationContext());
		
		JSONObject jsonObject = new JSONObject();
		try {
			jsonObject.put("secret", Secret.getSecret(getApplicationContext()));
		} catch (Exception e) {
			Log.d(TAG, "doWork: an error occured whilst collecting secret");
			return Result.failure();
		}
		
		JsonObjectRequest jsonObjectRequest = new JsonObjectRequest(
				com.android.volley.Request.Method.POST, url, jsonObject, response -> {
			Log.d(TAG, "doWork: got notification response " + response);
			//TODO: post notification
		}, error -> {
			Log.d(TAG, "doWork: could not check notifications " + error);
		});
		
		// Add the request to the RequestQueue.
		requestQueue.add(jsonObjectRequest);
		
		return Result.success();
	}
}
