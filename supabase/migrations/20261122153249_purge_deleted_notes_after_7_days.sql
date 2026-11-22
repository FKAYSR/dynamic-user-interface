create or replace function public.purge_expired_notes()
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  purged_count bigint;
begin
  delete from public.note_labels as note_label
  using public.notes as note
  where note_label.note_id = note.id
    and note.deleted_at is not null
    and note.deleted_at <= now() - interval '7 days';

  delete from public.notes
  where deleted_at is not null
    and deleted_at <= now() - interval '7 days';

  get diagnostics purged_count = row_count;
  return purged_count;
end;
$$;
