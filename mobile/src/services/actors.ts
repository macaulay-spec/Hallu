import type { Result } from './core';
import { notConfigured } from './core';

export interface ActorSummary {
  id: string;
  name: string;
  portraitUrl: string | null;
  verified: boolean;
}

export interface Actor extends ActorSummary {
  bio: string;
  followerCount: number;
  viewerFollowing: boolean;
}

export interface CastMember {
  actorId: string;
  name: string;
  portraitUrl: string | null;
  role: string | null;
}

export interface FilmographyEntry {
  dramaId: string;
  title: string;
  posterUrl: string | null;
  role: string | null;
  year: number | null;
}

export async function getActor(actorId: string): Promise<Result<Actor>> {
  void actorId;
  return notConfigured<Actor>('Actor');
}

export async function listDramaCast(dramaId: string): Promise<Result<CastMember[]>> {
  void dramaId;
  return notConfigured<CastMember[]>('Cast');
}

export async function listActorFilmography(actorId: string): Promise<Result<FilmographyEntry[]>> {
  void actorId;
  return notConfigured<FilmographyEntry[]>('Filmography');
}

export async function followActor(actorId: string): Promise<Result<{ following: boolean }>> {
  void actorId;
  return notConfigured<{ following: boolean }>('Follow actor');
}

export async function unfollowActor(actorId: string): Promise<Result<{ following: boolean }>> {
  void actorId;
  return notConfigured<{ following: boolean }>('Unfollow actor');
}
