"use server";

import { authOptions } from "@/lib/authOptions";
import { aggregateTopArtists } from "@/lib/spotify";
import { AuthSession } from "@/types/types";
import { SpotifyApi } from "@spotify/web-api-ts-sdk";
import { getServerSession } from "next-auth/next";

export const getSpotifyApi = (session: AuthSession | null) => {
  if (!session) {
    return null;
  }
  const clientId = process.env.SPOTIFY_CLIENT_ID || "";
  const spotifyApi = SpotifyApi.withAccessToken(clientId, {
    access_token: session.user.accessToken,
    expires_in: session.user.expires_at,
    token_type: "Bearer",
    refresh_token: session.user.refreshToken,
  });
  return spotifyApi;
};

export const customGet = async (url: string, session: AuthSession | null) => {
  if (!session) {
    return null;
  }
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${session.user.accessToken}`,
    },
  }).then((res) => {
    if (res.status === 429) {
      console.log("Rate limited, waiting 5 seconds");
      return;
    }
    return res.json();
  });

  return res;
};

export const customPost = async (
  url: string,
  session: AuthSession | null,
  body: any
) => {
  if (!session) {
    return null;
  }
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.user.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  }).then((res) => res.json());

  return res;
};

export const getAuthSession = async () => {
  const session = (await getServerSession(authOptions)) as AuthSession;
  if (!session) {
    return null;
  }

  const currentTimestamp = Math.floor(Date.now());
  if (currentTimestamp >= session.user.expires_at * 1000) {
    return null;
  }

  const spotifyApi = getSpotifyApi(session);

  return { session, spotifyApi };
};
