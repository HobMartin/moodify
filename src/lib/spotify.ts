import { AuthSession } from "@/types/types";
import { SpotifyApi } from "@spotify/web-api-ts-sdk";
import {
  addTracksToPlaylist,
  availableGenre,
  createUserPlaylist,
  getArtistTopTracks,
  getAudioFeatures,
  getCurrentUser,
  getFollowedArtists,
  getRecommendationsByMood,
  getTopItems,
} from "./actions";
import _, { min } from "lodash";
import { RedisClient } from "./redis";

export const aggregateTopArtists = async (session: AuthSession) => {
  const ranges = ["short_term", "medium_term", "long_term"] as const;

  const topArtistsFromCache = (await RedisClient.get(
    "top_artists"
  )) as string[];

  if (topArtistsFromCache) {
    return topArtistsFromCache;
  }

  const top_artists_uri: string[] = [];
  const top_artists_name: string[] = [];

  ranges.forEach(async (r) => {
    console.log("...get top artists for range", r);
    const top_artists_all_data = await getTopItems({
      session,
      timeRange: r,
      limit: 50,
      type: "artists",
    });

    const top_artists_data = top_artists_all_data?.items;
    top_artists_data?.forEach((artist: any) => {
      if (!top_artists_name.includes(artist.name)) {
        top_artists_uri.push(artist.uri);
        top_artists_name.push(artist.name);
      }
    });
  });
  const followed_artists_all_data = await getFollowedArtists({
    session,
    limit: 50,
  });

  const followed_artists_data = followed_artists_all_data?.artists.items;
  followed_artists_data?.forEach((artist: any) => {
    if (!top_artists_name.includes(artist.name)) {
      const uri = artist.uri.split(":")[2];
      top_artists_uri.push(uri);
      top_artists_name.push(artist.name);
    }
  });

  await RedisClient.set("top_artists", JSON.stringify(top_artists_uri));

  return top_artists_uri;
};

export const aggregateTopTracks = async (
  session: AuthSession,
  top_artists_uri: string[]
) => {
  console.log("...get top tracks for artist");

  const topTracksFromCache = (await RedisClient.get("top_tracks")) as string[];

  if (topTracksFromCache) {
    return topTracksFromCache;
  }

  const top_tracks: string[] = [];

  for (const artist of top_artists_uri) {
    const top_tracks_all_data = await getArtistTopTracks({
      session,
      artistId: artist,
      market: "UA",
    });

    const top_tracks_data = top_tracks_all_data.tracks;

    top_tracks_data.forEach((track: any) => {
      top_tracks.push(track.id);
    });
  }

  await RedisClient.set("top_tracks", JSON.stringify(top_tracks));

  return top_tracks;
};

export const createPlaylist = async (
  session: AuthSession,
  tracksIds: string[],
  mood: number
) => {
  const user = await getCurrentUser(session);

  console.log("...user", user.id);

  const playlistAllData = await createUserPlaylist({
    session,
    userId: user.id,
    name: `Moodify ${getMoodLabel(mood)} playlist`,
  });

  const randomTracks = _.shuffle(tracksIds);
  const playlistId = playlistAllData.id;

  const chunks = _.chunk(randomTracks, 30);

  await addTracksToPlaylist({
    session,
    playlistId,
    trackIds: chunks[0],
  });
  return playlistId;
};

export const generatePlaylist = async (session: AuthSession, mood: number) => {
  if (!mood) return null;

  const playlistIdFromCache = (await RedisClient.get(
    mood.toString()
  )) as string;

  if (playlistIdFromCache) {
    return playlistIdFromCache;
  }

  const recommendedTracks = await getRecommendationTracks(session, mood);
  console.log("...recommendedTracks", recommendedTracks);

  if (!recommendedTracks || !recommendedTracks.length) {
    return null;
  }
  const recommendedTracksIds = recommendedTracks.map((track: any) => track.id);
  console.log("...recommendedTracksIds", recommendedTracksIds);

  const playlistId = await createPlaylist(session, recommendedTracksIds, mood);

  await RedisClient.set(mood.toString(), playlistId);

  return playlistId;
};

const getMoodLabel = (mood: number) => {
  if (mood < 0.1) {
    return "Sad";
  } else if (mood >= 0.1 && mood < 0.25) {
    return "Melancholic";
  } else if (mood >= 0.25 && mood < 0.5) {
    return "Neutral";
  } else if (mood >= 0.5 && mood < 0.75) {
    return "Happy";
  } else if (mood >= 0.75 && mood < 0.9) {
    return "Energetic";
  } else {
    return "Ecstatic";
  }
};

const getMoodRecommendations = (mood: number) => {
  if (mood < 0.1) {
    return {
      valence: [0, 0.1],
      danceability: [0, 0.8],
      energy: [0, 0.8],
    };
  } else if (mood >= 0.1 && mood < 0.25) {
    return {
      valence: [mood - 0.075, mood + 0.075],
      danceability: [mood * 4, mood * 5],
      energy: [mood * 5, mood * 6],
    };
  } else if (mood >= 0.25 && mood < 0.5) {
    return {
      valence: [mood - 0.05, mood + 0.05],
      danceability: [mood * 1.75, mood * 2],
      energy: [mood * 1.75, mood * 2],
    };
  } else if (mood >= 0.5 && mood < 0.75) {
    return {
      valence: [mood - 0.075, mood + 0.075],
      danceability: [mood / 2.5, mood / 2],
      energy: [mood / 2, mood / 1.75],
    };
  } else if (mood >= 0.75 && mood < 0.9) {
    return {
      valence: [mood - 0.075, mood + 0.075],
      danceability: [mood / 2, mood / 1.75],
      energy: [mood / 1.75, mood / 1.5],
    };
  } else {
    return {
      valence: [mood - 0.15, 1],
      danceability: [mood / 1.75, mood / 1.5],
      energy: [mood / 1.5, mood / 1.25],
    };
  }
};

const getRecommendationQuery = async (session: AuthSession, mood: number) => {
  const recommendations = getMoodRecommendations(mood);
  const top_artists = await aggregateTopArtists(session);
  const top_tracks = await aggregateTopTracks(session, top_artists);
  const genres = await availableGenre(session);

  const seed_artists = _.sampleSize(top_artists, 1).join(",");
  const seed_tracks = _.sampleSize(top_tracks, 1).join(",");
  const seed_genres = _.sampleSize(genres.genres, 3).join(",");

  return {
    seed_artists,
    seed_tracks,
    seed_genres,
    target_valence: _.random(
      recommendations.valence[0],
      recommendations.valence[1],
      true
    ),
    target_danceability: _.random(
      recommendations.danceability[0],
      recommendations.danceability[1],
      true
    ),
    target_energy: _.random(
      recommendations.energy[0],
      recommendations.energy[1],
      true
    ),
  };
};

const getRecommendationTracks = async (session: AuthSession, mood: number) => {
  const query = await getRecommendationQuery(session, mood);
  const recommendations = await getRecommendationsByMood({ session, query });
  console.log("...recommendations", recommendations);

  return recommendations.tracks;
};
