package com.JJ.tictactoesquared.notification;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Build;

import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;

import com.JJ.tictactoesquared.MainActivity;
import com.JJ.tictactoesquared.R;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class Notify {
	
	private static final String CHANNEL_ID_INVITE = "invite";
	private static final String CHANNEL_ID_UNPLAYED = "unplayed";
	private static final int NOTIFICATION_ID_INVITE = 1;
	private static final int NOTIFICATION_ID_UNPLAYED = 2;
	
	public static void notify(Context context, JSONObject data) {
		createNotificationChannels(context);
		//TODO: check previous notify
		try {
			if (data.getBoolean("hasUnplayedLobbies")) {
				notifyUnplayed(context, data.getJSONArray("unplayedLobbies"));
			}
		} catch (JSONException ignored) {
		}
		try {
			if (data.getBoolean("hasInvitedLobbies")) {
				notifyInvited(context, data.getJSONArray("invitedLobbies"));
			}
		} catch (JSONException ignored) {
		}
	}
	
	private static void notifyUnplayed(Context context, JSONArray unplayedLobbies) {
		int count = unplayedLobbies.length();
		String title = "";
		String description = "";
		if (count == 0) return;
		if (count == 1) {
			try {
				title = String.format(context.getString(R.string.notificationChannelUnplayedNotificationTitleSingle), unplayedLobbies.getJSONObject(0).get("opponentname"));
			} catch (JSONException e) {
				title = context.getString(R.string.notificationChannelUnplayedNotificationTitleSingleCatch);
			}
			description = context.getString(R.string.notificationChannelUnplayedNotificationDescriptionSingle);
		} else {
			title = String.format(context.getString(R.string.notificationChannelUnplayedNotificationTitleMultiple), unplayedLobbies.length());
			description = context.getString(R.string.notificationChannelUnplayedNotificationDescriptionMultiple);
		}
		PendingIntent intent;
		try {
			intent = count == 1 ? buildLobbyIntent(context, unplayedLobbies.getJSONObject(0)) : buildAppIntent(context);
		} catch (JSONException e) {
			intent = buildAppIntent(context);
		}
		pushNotification(context, CHANNEL_ID_UNPLAYED, title, description, NOTIFICATION_ID_UNPLAYED, intent);
	}
	
	private static void notifyInvited(Context context, JSONArray invitedLobbies) {
		int count = invitedLobbies.length();
		String title = "";
		String description = "";
		if (count == 0) return;
		if (count == 1) {
			try {
				title = String.format(context.getString(R.string.notificationChannelInviteNotificationTitleSingle), invitedLobbies.getJSONObject(0).get("opponentname"));
			} catch (JSONException e) {
				title = context.getString(R.string.notificationChannelInviteNotificationTitleSingleCatch);
			}
			description = context.getString(R.string.notificationChannelInviteNotificationDescriptionSingle);
		} else {
			title = String.format(context.getString(R.string.notificationChannelInviteNotificationTitleMultiple), invitedLobbies.length());
			description = context.getString(R.string.notificationChannelInviteNotificationDescriptionMultiple);
		}
		PendingIntent intent;
		try {
			intent = count == 1 ? buildLobbyIntent(context, invitedLobbies.getJSONObject(0)) : buildAppIntent(context);
		} catch (JSONException e) {
			intent = buildAppIntent(context);
		}
		pushNotification(context, CHANNEL_ID_INVITE, title, description, NOTIFICATION_ID_INVITE, intent);
	}
	
	//TODO: post notification
	//TODO: make notification open corresponding window
	private static void pushNotification(Context context, String channel, String title, String description, int notificationId, PendingIntent intent) {
		NotificationCompat.Builder builder = new NotificationCompat.Builder(context, channel)
				.setSmallIcon(R.drawable.tttslogo_foreground)
				.setContentTitle(title)
				.setContentText(description)
				.setContentIntent(intent)
				.setAutoCancel(true);
		NotificationManagerCompat notificationManager = NotificationManagerCompat.from(context);
		notificationManager.notify(notificationId, builder.build());
	}
	
	private static PendingIntent buildAppIntent(Context context) {
		Intent intent = new Intent(context, MainActivity.class);
		return PendingIntent.getActivity(context, 0, intent, 0);
	}
	
	private static PendingIntent buildMultiplayerIntent(Context context) {
		//TODO: implement link to multiplayer page
		return buildAppIntent(context);
	}
	
	private static PendingIntent buildLobbyIntent(Context context, JSONObject lobby) {
		//TODO: implement link to lobby
		return buildAppIntent(context);
		//Intent intent = new Intent(context, MainActivity.class);
		//return PendingIntent.getActivity(context, 0, intent, 0);
	}
	
	private static void createNotificationChannels(Context context) {
		// Create the NotificationChannel, but only on API 26+ because
		// the NotificationChannel class is new and not in the support library
		if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
			String[][] channels = {{
					context.getString(R.string.notificationChannelInviteName),
					context.getString(R.string.notificationChannelInviteDescription),
					CHANNEL_ID_INVITE
			}, {
					context.getString(R.string.notificationChannelUnplayedName),
					context.getString(R.string.notificationChannelUnplayedDescription),
					CHANNEL_ID_UNPLAYED
			}};
			
			for (String[] channelinfo : channels) {
				CharSequence name = channelinfo[0];
				String description = channelinfo[1];
				int importance = NotificationManager.IMPORTANCE_DEFAULT;
				NotificationChannel channel = new NotificationChannel(channelinfo[2], name, importance);
				channel.setDescription(description);
				// Register the channel with the system; you can't change the importance
				// or other notification behaviors after this
				NotificationManager notificationManager = context.getSystemService(NotificationManager.class);
				notificationManager.createNotificationChannel(channel);
			}
		}
	}
}
