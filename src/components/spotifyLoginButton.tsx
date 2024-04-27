"use client";
import { SpotifyApi } from "@spotify/web-api-ts-sdk";

export const SpotifyLoginButton = () => {
  const spotifyLogin = async () => {
    const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || "";
    const clientSecret = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET;
    const redirectUri = "http://localhost:3000/api/callback/";

    SpotifyApi.performUserAuthorization(clientId, redirectUri, [], "/");
  };
  return (
    <button
      className="bg-blue-500 text-white px-6 py-3 rounded-lg"
      onClick={spotifyLogin}
    >
      Login with Spotify
    </button>
  );
};
