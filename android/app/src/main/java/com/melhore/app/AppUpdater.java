package com.melhore.app;

import android.app.Activity;
import android.app.PendingIntent;
import android.content.Intent;
import android.content.pm.PackageInstaller;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;
import android.util.Log;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;

final class AppUpdater {
    private static final String TAG = "MelhoreUpdate";
    private static final String RELEASES_URL =
            "https://api.github.com/repos/ItaloProject/melhore/releases/latest";
    static final String ACTION_INSTALL = "com.melhore.app.INSTALL_UPDATE";

    interface Listener {
        void onStatus(String message);
        void onIdle();
    }

    private final Activity activity;
    private final Listener listener;
    private final String currentVersion;
    private volatile boolean checking;

    AppUpdater(Activity activity, String currentVersion, Listener listener) {
        this.activity = activity;
        this.currentVersion = currentVersion;
        this.listener = listener;
    }

    void checkNow() {
        if (checking) return;
        checking = true;
        new Thread(() -> {
            try {
                JSONObject release = fetchLatest();
                String tag = release.optString("tag_name", "");
                String remote = tag.startsWith("v") ? tag.substring(1) : tag;
                if (remote.isEmpty() || compareVersions(remote, currentVersion) <= 0) {
                    activity.runOnUiThread(listener::onIdle);
                    return;
                }

                String apkUrl = findApkUrl(release);
                if (apkUrl == null) {
                    activity.runOnUiThread(listener::onIdle);
                    return;
                }

                activity.runOnUiThread(() -> listener.onStatus("Baixando atualização " + remote + "…"));
                File apk = downloadApk(apkUrl);
                activity.runOnUiThread(() -> {
                    listener.onStatus("Instalando atualização…");
                    installApk(apk);
                });
            } catch (Exception e) {
                Log.e(TAG, "update failed", e);
                activity.runOnUiThread(listener::onIdle);
            } finally {
                checking = false;
            }
        }, "melhore-updater").start();
    }

    void installPendingIfReady() {
        File apk = new File(activity.getCacheDir(), "melhore-update.apk");
        if (apk.exists() && apk.length() > 0 && canInstall()) {
            listener.onStatus("Instalando atualização…");
            installApk(apk);
        }
    }

    private JSONObject fetchLatest() throws Exception {
        HttpURLConnection conn = open(RELEASES_URL);
        try (InputStream in = conn.getInputStream()) {
            return new JSONObject(readAll(in));
        } finally {
            conn.disconnect();
        }
    }

    private String findApkUrl(JSONObject release) {
        JSONArray assets = release.optJSONArray("assets");
        if (assets == null) return null;
        for (int i = 0; i < assets.length(); i++) {
            JSONObject asset = assets.optJSONObject(i);
            if (asset == null) continue;
            String name = asset.optString("name", "");
            if (name.toLowerCase().endsWith(".apk")) {
                return asset.optString("browser_download_url", null);
            }
        }
        return null;
    }

    private File downloadApk(String apkUrl) throws Exception {
        File out = new File(activity.getCacheDir(), "melhore-update.apk");
        HttpURLConnection conn = open(apkUrl);
        try (InputStream in = conn.getInputStream();
             FileOutputStream fos = new FileOutputStream(out)) {
            byte[] buf = new byte[8192];
            int n;
            while ((n = in.read(buf)) >= 0) {
                fos.write(buf, 0, n);
            }
        } finally {
            conn.disconnect();
        }
        return out;
    }

    private HttpURLConnection open(String url) throws Exception {
        HttpURLConnection conn = (HttpURLConnection) new URL(url).openConnection();
        conn.setInstanceFollowRedirects(true);
        conn.setConnectTimeout(20000);
        conn.setReadTimeout(60000);
        conn.setRequestProperty("User-Agent", "Melhore-Android");
        conn.setRequestProperty("Accept", "application/vnd.github+json");
        int code = conn.getResponseCode();
        if (code >= 300 && code < 400) {
            String loc = conn.getHeaderField("Location");
            conn.disconnect();
            return open(loc);
        }
        if (code >= 400) {
            throw new IllegalStateException("HTTP " + code);
        }
        return conn;
    }

    private boolean canInstall() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return true;
        return activity.getPackageManager().canRequestPackageInstalls();
    }

    private void requestInstallPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            Intent intent = new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES);
            intent.setData(Uri.parse("package:" + activity.getPackageName()));
            activity.startActivity(intent);
        }
    }

    private void installApk(File apk) {
        if (!canInstall()) {
            requestInstallPermission();
            return;
        }
        try {
            PackageInstaller installer = activity.getPackageManager().getPackageInstaller();
            PackageInstaller.SessionParams params =
                    new PackageInstaller.SessionParams(PackageInstaller.SessionParams.MODE_FULL_INSTALL);
            int sessionId = installer.createSession(params);
            PackageInstaller.Session session = installer.openSession(sessionId);
            try (FileInputStream in = new FileInputStream(apk);
                 OutputStream out = session.openWrite("melhore.apk", 0, apk.length())) {
                byte[] buf = new byte[8192];
                int n;
                while ((n = in.read(buf)) >= 0) {
                    out.write(buf, 0, n);
                }
                session.fsync(out);
            }

            Intent callback = new Intent(activity, MainActivity.class);
            callback.setAction(ACTION_INSTALL);
            int flags = PendingIntent.FLAG_UPDATE_CURRENT;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                flags |= PendingIntent.FLAG_MUTABLE;
            }
            PendingIntent pending = PendingIntent.getActivity(activity, sessionId, callback, flags);
            session.commit(pending.getIntentSender());
            session.close();
        } catch (Exception e) {
            Log.e(TAG, "install failed", e);
            listener.onIdle();
        }
    }

    static int compareVersions(String a, String b) {
        String[] as = a.split("\\.");
        String[] bs = b.split("\\.");
        int len = Math.max(as.length, bs.length);
        for (int i = 0; i < len; i++) {
            int av = i < as.length ? parsePart(as[i]) : 0;
            int bv = i < bs.length ? parsePart(bs[i]) : 0;
            if (av != bv) return Integer.compare(av, bv);
        }
        return 0;
    }

    private static int parsePart(String part) {
        String digits = part.replaceAll("[^0-9].*$", "");
        if (digits.isEmpty()) return 0;
        try {
            return Integer.parseInt(digits);
        } catch (NumberFormatException e) {
            return 0;
        }
    }

    private static String readAll(InputStream in) throws Exception {
        byte[] buf = new byte[4096];
        StringBuilder sb = new StringBuilder();
        int n;
        while ((n = in.read(buf)) >= 0) {
            sb.append(new String(buf, 0, n, StandardCharsets.UTF_8));
        }
        return sb.toString();
    }
}
