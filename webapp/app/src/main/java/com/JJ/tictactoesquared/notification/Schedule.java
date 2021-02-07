package com.JJ.tictactoesquared.notification;

import android.content.Context;

import androidx.work.BackoffPolicy;
import androidx.work.Constraints;
import androidx.work.NetworkType;
import androidx.work.OneTimeWorkRequest;
import androidx.work.PeriodicWorkRequest;
import androidx.work.WorkManager;
import androidx.work.WorkRequest;

import java.util.concurrent.TimeUnit;

public class Schedule {
	static final String requestTag = "notificationRequest";
	static final String requestOnceTag = "notificationRequestOnce";
	
	public static void schedule(Context context) {
		Constraints constraints = new Constraints.Builder()
				.setRequiredNetworkType(NetworkType.CONNECTED)
				.setRequiresBatteryNotLow(true)
				.build();
		WorkRequest request = new PeriodicWorkRequest.Builder(
				Request.class,
				2, TimeUnit.HOURS,
				1, TimeUnit.HOURS
		).setConstraints(constraints)
				.setBackoffCriteria(BackoffPolicy.EXPONENTIAL, 15, TimeUnit.MINUTES)
				.addTag(requestTag)
				.build();
		WorkManager.getInstance(context).enqueue(request);
	}
	
	public static void scheduleOnce(Context context) {
		Constraints constraints = new Constraints.Builder()
				.setRequiredNetworkType(NetworkType.CONNECTED)
				.setRequiresBatteryNotLow(true)
				.build();
		WorkRequest request = new OneTimeWorkRequest.Builder(Request.class)
				.setConstraints(constraints)
				.addTag(requestOnceTag)
				.build();
		WorkManager.getInstance(context).enqueue(request);
	}
}
