export type PublicMemory = {
  code: string;
  recipient: string;
  message: string | null;
  sender: string | null;
  created_at?: string | null;
  photoUrl?: string | null;
  audioUrl?: string | null;
  videoUrl?: string | null;
};

export type MemoryImage = {
  src: string;
  alt: string;
  caption?: string;
};