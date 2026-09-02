package com.melhore.app;

import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageInfo;
import android.graphics.Color;
import android.graphics.Typeface;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.Gravity;
import android.view.View;
import android.webkit.CookieManager;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.TextView;

public class MainActivity extends Activity {
    private static final String APP_URL = "https://melhore-seven.vercel.app/admin";
    private static final String WEB_ORIGIN = "https://melhore-seven.vercel.app";
    private static final long CHECK_DELAY_MS = 2500L;
    private static final long CHECK_INTERVAL_MS = 4L * 60L * 60L * 1000L;

    private WebView webView;
    private TextView updateBar;
    private AppUpdater updater;
    private final Handler handler = new Handler(Looper.getMainLooper());
    private final Runnable periodicCheck = new Runnable() {
        @Override
        public void run() {
            if (updater != null) updater.checkNow();
            handler.postDelayed(this, CHECK_INTERVAL_MS);
        }
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(Color.parseColor("#0c0a09"));

        webView = new WebView(this);
        webView.setBackgroundColor(Color.parseColor("#0c0a09"));
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setLoadWithOverviewMode(true);
        settings.setUseWideViewPort(true);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE);
        settings.setUserAgentString(settings.getUserAgentString() + " MelhoreAndroid/1.0.3");

        CookieManager cookies = CookieManager.getInstance();
        cookies.setAcceptCookie(true);
        cookies.setAcceptThirdPartyCookies(webView, true);

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return openNativeAuthInBrowser(request.getUrl().toString());
            }

            @Override
            @SuppressWarnings("deprecation")
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                return openNativeAuthInBrowser(url);
            }
        });
        webView.setWebChromeClient(new WebChromeClient());
        String callbackUrl = authCallbackUrl(getIntent());
        webView.loadUrl(callbackUrl != null ? callbackUrl : APP_URL);

        updateBar = new TextView(this);
        updateBar.setTextColor(Color.WHITE);
        updateBar.setTextSize(13);
        updateBar.setTypeface(Typeface.DEFAULT_BOLD);
        updateBar.setGravity(Gravity.CENTER);
        updateBar.setPadding(16, 18, 16, 18);
        updateBar.setBackgroundColor(Color.parseColor("#7c3aed"));
        updateBar.setVisibility(View.GONE);

        root.addView(webView, new FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT
        ));
        root.addView(updateBar, new FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.WRAP_CONTENT,
                Gravity.TOP
        ));
        setContentView(root);

        updater = new AppUpdater(this, currentVersionName(), new AppUpdater.Listener() {
            @Override
            public void onStatus(String message) {
                updateBar.setText(message);
                updateBar.setVisibility(View.VISIBLE);
            }

            @Override
            public void onIdle() {
                updateBar.setVisibility(View.GONE);
            }
        });

        handler.postDelayed(periodicCheck, CHECK_DELAY_MS);
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (updater != null) {
            updater.installPendingIfReady();
        }
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        String callbackUrl = authCallbackUrl(intent);
        if (callbackUrl != null && webView != null) {
            webView.loadUrl(callbackUrl);
        }
    }

    @Override
    protected void onDestroy() {
        handler.removeCallbacks(periodicCheck);
        super.onDestroy();
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }

    private String currentVersionName() {
        try {
            PackageInfo info = getPackageManager().getPackageInfo(getPackageName(), 0);
            return info.versionName != null ? info.versionName : "0";
        } catch (Exception e) {
            return "0";
        }
    }

    private boolean openNativeAuthInBrowser(String url) {
        if (url == null || !url.startsWith(WEB_ORIGIN + "/auth/native#")) return false;

        try {
            startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(url)));
            return true;
        } catch (Exception ignored) {
            return false;
        }
    }

    private String authCallbackUrl(Intent intent) {
        if (intent == null || intent.getData() == null) return null;

        Uri uri = intent.getData();
        if (!"melhore".equals(uri.getScheme())
                || !"auth".equals(uri.getHost())
                || !"/callback".equals(uri.getPath())) {
            return null;
        }

        String fragment = uri.getEncodedFragment();
        if (fragment == null || fragment.isEmpty()) return null;
        return WEB_ORIGIN + "/auth/native/callback#" + fragment;
    }
}
