/**
 * Video work. The live list comes from the @lukagengashvili YouTube channel; the
 * entries below are the fallback the old Selected Works showed when the API was
 * unreachable.
 */

export interface Work {
  title: string;
  youtubeId: string;
  tags: string[];
}

export const youtube = {
  // read-only browser key, the same one the old site shipped in its bundle
  apiKey: 'AIzaSyCI44mJOZSCZhWmXzbjIdZIo2AQyxYXV-c',
  // "UU…" = the channel's uploads playlist
  uploadsPlaylistId: 'UUiymhMkwi-AaW3XxfrhdWHg',
  /** videos tagged with this are the Selected Works */
  featuredTag: 'top',
};

export const fallbackWorks: Work[] = [
  {
    title: 'Americans 6th visit',
    youtubeId: 'rHFLAPJpMDM',
    tags: ['Premiere Pro', 'Drone', 'Camera', 'Audio Design', 'Video Storytelling', 'Cinematography'],
  },
  { title: 'Car poster album', youtubeId: 'ZR6KxR_Xw9c', tags: ['Photoshop', 'Car', 'Poster', 'Design'] },
  { title: 'My portfolio Site', youtubeId: 'WazNMRIBdnE', tags: ['Angular', 'C#', 'Web Development', 'Design'] },
];

export const thumbnail = (id: string) => `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
