import crypto from "crypto";

export interface SocialPlatformConfig {
  id: string;
  name: string;
  category: "publisher" | "audio" | "embed_only";
  authType: "oauth2" | "api_key" | "embed_link";
  authUrl?: string;
  scopes: string[];
  autoPublish: boolean;
  description: string;
  docsUrl: string;
}

export const SOCIAL_PLATFORMS: Record<string, SocialPlatformConfig> = {
  instagram: {
    id: "instagram",
    name: "Instagram Graph API",
    category: "publisher",
    authType: "oauth2",
    authUrl: "https://api.instagram.com/oauth/authorize",
    scopes: ["instagram_basic", "instagram_content_publish", "pages_show_list"],
    autoPublish: true,
    description: "Automated publishing of photo, carousel, and video reels to Instagram Business accounts via Meta Graph API v21.0.",
    docsUrl: "https://developers.facebook.com/docs/instagram-api",
  },
  facebook: {
    id: "facebook",
    name: "Facebook Pages API",
    category: "publisher",
    authType: "oauth2",
    authUrl: "https://www.facebook.com/v21.0/dialog/oauth",
    scopes: ["pages_manage_posts", "pages_read_engagement"],
    autoPublish: true,
    description: "Automated publishing of text, tour dates, and media links to Facebook Pages.",
    docsUrl: "https://developers.facebook.com/docs/pages",
  },
  tiktok: {
    id: "tiktok",
    name: "TikTok Content Posting API",
    category: "publisher",
    authType: "oauth2",
    authUrl: "https://www.tiktok.com/v2/auth/authorize/",
    scopes: ["video.upload", "video.publish", "user.info.basic"],
    autoPublish: true,
    description: "Direct video publishing and draft sync to TikTok creator accounts via Content Posting API.",
    docsUrl: "https://developers.tiktok.com/doc/content-posting-api-overview",
  },
  youtube: {
    id: "youtube",
    name: "YouTube Data API v3",
    category: "publisher",
    authType: "oauth2",
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    scopes: ["https://www.googleapis.com/auth/youtube.upload", "https://www.googleapis.com/auth/youtube.readonly"],
    autoPublish: true,
    description: "Direct video uploads, livestream management, and shorts publishing via YouTube Data API v3.",
    docsUrl: "https://developers.google.com/youtube/v3",
  },
  x: {
    id: "x",
    name: "X (Twitter) API v2",
    category: "publisher",
    authType: "oauth2",
    authUrl: "https://twitter.com/i/oauth2/authorize",
    scopes: ["tweet.read", "tweet.write", "users.read", "offline.access"],
    autoPublish: true,
    description: "Automated status updates, track release announcements, and tour date broadcasts via X API v2 (OAuth 2.0 PKCE).",
    docsUrl: "https://developer.x.com/en/docs/x-api",
  },
  soundcloud: {
    id: "soundcloud",
    name: "SoundCloud API & Embeds",
    category: "audio",
    authType: "oauth2",
    authUrl: "https://soundcloud.com/connect",
    scopes: ["non-expiring", "read", "write"],
    autoPublish: true,
    description: "Direct track uploads, waveform fetching, playlist management, and high-fidelity embedded audio players.",
    docsUrl: "https://developers.soundcloud.com/docs/api/guide",
  },
  mixcloud: {
    id: "mixcloud",
    name: "Mixcloud API & Widgets",
    category: "audio",
    authType: "oauth2",
    authUrl: "https://www.mixcloud.com/oauth/authorize",
    scopes: ["basic"],
    autoPublish: true,
    description: "Cloud DJ mix hosting, tracklist syncing, and rich interactive audio widget embeds.",
    docsUrl: "https://www.mixcloud.com/developers/",
  },
  spotify: {
    id: "spotify",
    name: "Spotify Web API & Embeds",
    category: "audio",
    authType: "oauth2",
    authUrl: "https://accounts.spotify.com/authorize",
    scopes: ["user-read-private", "playlist-read-private", "playlist-modify-public"],
    autoPublish: false,
    description: "Playlist curation, artist profile integration, and responsive Spotify player embeds.",
    docsUrl: "https://developer.spotify.com/documentation/web-api",
  },
};

export interface SocialAdapter {
  platform: string;
  getAuthUrl(state: string, redirectUri: string): string;
  exchangeCode(code: string, redirectUri: string): Promise<{ accessToken: string; refreshToken?: string; expiresIn: number; externalAccountId: string; accountName: string }>;
  publishPost(accessToken: string, post: { caption: string; mediaUrls?: string[] }): Promise<{ externalPostId: string }>;
  verifyToken(accessToken: string): Promise<boolean>;
}

// Stub adapters implementing the capability registry interface safely
export const socialAdapters: Record<string, SocialAdapter> = {
  instagram: {
    platform: "instagram",
    getAuthUrl(state, redirectUri) {
      const config = SOCIAL_PLATFORMS.instagram;
      return `${config.authUrl}?client_id=${process.env.INSTAGRAM_CLIENT_ID || "demo_client_id"}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${config.scopes.join(",")}&response_type=code&state=${state}`;
    },
    async exchangeCode(code, redirectUri) {
      // In production, exchanges code with https://graph.facebook.com/v21.0/oauth/access_token
      return { accessToken: `IG_TOKEN_${crypto.randomBytes(16).toString("hex")}`, expiresIn: 5184000, externalAccountId: `ig_${crypto.randomBytes(4).toString("hex")}`, accountName: "@djchrisfix" };
    },
    async publishPost(accessToken, post) {
      if (!accessToken) throw new Error("Missing Instagram access token");
      return { externalPostId: `ig_post_${crypto.randomBytes(6).toString("hex")}` };
    },
    async verifyToken(accessToken) {
      return accessToken.startsWith("IG_TOKEN_") || accessToken.startsWith("EAAG");
    },
  },
  facebook: {
    platform: "facebook",
    getAuthUrl(state, redirectUri) {
      const config = SOCIAL_PLATFORMS.facebook;
      return `${config.authUrl}?client_id=${process.env.FACEBOOK_CLIENT_ID || "demo_client_id"}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${config.scopes.join(",")}&response_type=code&state=${state}`;
    },
    async exchangeCode(code, redirectUri) {
      return { accessToken: `FB_TOKEN_${crypto.randomBytes(16).toString("hex")}`, expiresIn: 5184000, externalAccountId: `fb_${crypto.randomBytes(4).toString("hex")}`, accountName: "DJ ChrisFix Official" };
    },
    async publishPost(accessToken, post) {
      return { externalPostId: `fb_post_${crypto.randomBytes(6).toString("hex")}` };
    },
    async verifyToken(accessToken) {
      return accessToken.startsWith("FB_TOKEN_") || accessToken.startsWith("EAAG");
    },
  },
  tiktok: {
    platform: "tiktok",
    getAuthUrl(state, redirectUri) {
      const config = SOCIAL_PLATFORMS.tiktok;
      return `${config.authUrl}?client_key=${process.env.TIKTOK_CLIENT_KEY || "demo_client_key"}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${config.scopes.join(",")}&response_type=code&state=${state}`;
    },
    async exchangeCode(code, redirectUri) {
      return { accessToken: `TT_TOKEN_${crypto.randomBytes(16).toString("hex")}`, refreshToken: `TT_REF_${crypto.randomBytes(16).toString("hex")}`, expiresIn: 86400, externalAccountId: `tt_${crypto.randomBytes(4).toString("hex")}`, accountName: "@djchrisfix" };
    },
    async publishPost(accessToken, post) {
      return { externalPostId: `tt_post_${crypto.randomBytes(6).toString("hex")}` };
    },
    async verifyToken(accessToken) {
      return accessToken.startsWith("TT_TOKEN_");
    },
  },
  youtube: {
    platform: "youtube",
    getAuthUrl(state, redirectUri) {
      const config = SOCIAL_PLATFORMS.youtube;
      return `${config.authUrl}?client_id=${process.env.YOUTUBE_CLIENT_ID || "demo_client_id"}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(config.scopes.join(" "))}&response_type=code&access_type=offline&prompt=consent&state=${state}`;
    },
    async exchangeCode(code, redirectUri) {
      return { accessToken: `YT_TOKEN_${crypto.randomBytes(16).toString("hex")}`, refreshToken: `YT_REF_${crypto.randomBytes(16).toString("hex")}`, expiresIn: 3600, externalAccountId: `yt_${crypto.randomBytes(4).toString("hex")}`, accountName: "DJ ChrisFix" };
    },
    async publishPost(accessToken, post) {
      return { externalPostId: `yt_video_${crypto.randomBytes(6).toString("hex")}` };
    },
    async verifyToken(accessToken) {
      return accessToken.startsWith("YT_TOKEN_");
    },
  },
  x: {
    platform: "x",
    getAuthUrl(state, redirectUri) {
      const config = SOCIAL_PLATFORMS.x;
      return `${config.authUrl}?response_type=code&client_id=${process.env.X_CLIENT_ID || "demo_client_id"}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(config.scopes.join(" "))}&state=${state}&code_challenge=challenge&code_challenge_method=plain`;
    },
    async exchangeCode(code, redirectUri) {
      return { accessToken: `X_TOKEN_${crypto.randomBytes(16).toString("hex")}`, refreshToken: `X_REF_${crypto.randomBytes(16).toString("hex")}`, expiresIn: 7200, externalAccountId: `x_${crypto.randomBytes(4).toString("hex")}`, accountName: "@djchrisfix" };
    },
    async publishPost(accessToken, post) {
      return { externalPostId: `x_tweet_${crypto.randomBytes(6).toString("hex")}` };
    },
    async verifyToken(accessToken) {
      return accessToken.startsWith("X_TOKEN_");
    },
  },
  soundcloud: {
    platform: "soundcloud",
    getAuthUrl(state, redirectUri) {
      return `${SOCIAL_PLATFORMS.soundcloud.authUrl}?client_id=${process.env.SOUNDCLOUD_CLIENT_ID || "demo_client_id"}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&state=${state}`;
    },
    async exchangeCode(code, redirectUri) {
      return { accessToken: `SC_TOKEN_${crypto.randomBytes(16).toString("hex")}`, expiresIn: 2592000, externalAccountId: `sc_${crypto.randomBytes(4).toString("hex")}`, accountName: "chrisfix-official" };
    },
    async publishPost(accessToken, post) {
      return { externalPostId: `sc_track_${crypto.randomBytes(6).toString("hex")}` };
    },
    async verifyToken(accessToken) {
      return accessToken.startsWith("SC_TOKEN_");
    },
  },
  mixcloud: {
    platform: "mixcloud",
    getAuthUrl(state, redirectUri) {
      return `${SOCIAL_PLATFORMS.mixcloud.authUrl}?client_id=${process.env.MIXCLOUD_CLIENT_ID || "demo_client_id"}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&state=${state}`;
    },
    async exchangeCode(code, redirectUri) {
      return { accessToken: `MC_TOKEN_${crypto.randomBytes(16).toString("hex")}`, expiresIn: 2592000, externalAccountId: `mc_${crypto.randomBytes(4).toString("hex")}`, accountName: "chrisfix" };
    },
    async publishPost(accessToken, post) {
      return { externalPostId: `mc_cloud_${crypto.randomBytes(6).toString("hex")}` };
    },
    async verifyToken(accessToken) {
      return accessToken.startsWith("MC_TOKEN_");
    },
  },
  spotify: {
    platform: "spotify",
    getAuthUrl(state, redirectUri) {
      return `${SOCIAL_PLATFORMS.spotify.authUrl}?client_id=${process.env.SPOTIFY_CLIENT_ID || "demo_client_id"}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(SOCIAL_PLATFORMS.spotify.scopes.join(" "))}&state=${state}`;
    },
    async exchangeCode(code, redirectUri) {
      return { accessToken: `SPOTIFY_TOKEN_${crypto.randomBytes(16).toString("hex")}`, expiresIn: 3600, externalAccountId: `sp_${crypto.randomBytes(4).toString("hex")}`, accountName: "DJ ChrisFix Artist" };
    },
    async publishPost(accessToken, post) {
      return { externalPostId: `spotify_embed_${crypto.randomBytes(6).toString("hex")}` };
    },
    async verifyToken(accessToken) {
      return accessToken.startsWith("SPOTIFY_TOKEN_");
    },
  },
};
