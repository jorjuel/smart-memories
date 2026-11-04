-- Run in Smart Memories Supabase SQL Editor before using Upload Your Own Design.
-- Keeps print artwork separate from the photograph on the NFC memory page.
alter table public.card_personalisations
  add column if not exists artwork_url text;
