-- Add parent_message_id to messages table
ALTER TABLE public.messages
ADD COLUMN parent_message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE;

-- Create an index for parent_message_id for faster lookups
CREATE INDEX messages_parent_message_id_idx ON public.messages (parent_message_id);