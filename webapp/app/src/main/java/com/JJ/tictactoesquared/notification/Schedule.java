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
	static final String requestPeriodicTag = "notificationRequest";
	static final String requestOnceTag = "notificationRequestOnce";
	static final int[] scheduleOnceChecks = {1, 2, 5, 10, 15, 30};
	
	public static void schedulePeriodic(Context context) {
		WorkManager workManager = WorkManager.getInstance(context);
		workManager.cancelAllWorkByTag(requestPeriodicTag);
		Constraints constraints = new Constraints.Builder()
				.setRequiredNetworkType(NetworkType.CONNECTED)
				.setRequiresBatteryNotLow(true)
				.build();
		WorkRequest request = new PeriodicWorkRequest.Builder(
				Request.class,
				1, TimeUnit.HOURS,
				30, TimeUnit.MINUTES
		).setConstraints(constraints)
				.setBackoffCriteria(BackoffPolicy.EXPONENTIAL, 15, TimeUnit.MINUTES)
				.addTag(requestPeriodicTag)
				.build();
		workManager.enqueue(request);
	}
	
	public static void scheduleAfterClose(Context context) {
		WorkManager.getInstance(context).cancelAllWorkByTag(requestOnceTag);
		for (int delay : scheduleOnceChecks) {
			scheduleOnce(context, delay);
		}
	}
	
	private static void scheduleOnce(Context context, int delay) {
		Constraints constraints = new Constraints.Builder()
				.setRequiredNetworkType(NetworkType.CONNECTED)
				.setRequiresBatteryNotLow(true)
				.build();
		WorkRequest request = new OneTimeWorkRequest.Builder(Request.class)
				.setConstraints(constraints)
				.setInitialDelay(delay, TimeUnit.MINUTES)
				.addTag(requestOnceTag)
				.build();
		WorkManager.getInstance(context).enqueue(request);
	}
}
