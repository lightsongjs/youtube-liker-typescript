// Database types for YouTube Liker
export interface Video {
  video_id: string;
  title: string;
  channel_id: string | null;
  channel_title: string | null;
  url: string;
  duration_seconds: number | null;
  is_short: boolean;
  captions: string | null;
  saved_at: string;
  liked_status: string;
  is_music: boolean;
  is_theological: boolean;
  is_interesting: boolean;
  needs_caption: boolean;
}

export interface Tag {
  id: number;
  name: string;
  keystroke: string;
  color: string;
}

export interface VideoTag {
  video_id: string;
  tag_id: number;
}

export interface VideoWithTags extends Video {
  tags?: Tag[];
}

export interface CreateTagRequest {
  name: string;
  keystroke: string;
  color?: string;
}

export interface ToggleTagRequest {
  video_id: string;
  tag_id: number;
}
