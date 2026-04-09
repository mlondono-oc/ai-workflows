-- Manual validation for ImageLink schema.
-- Run: docker exec -i supabase_db_image-link psql -U postgres -d postgres -v ON_ERROR_STOP=1 -f - < supabase/tests/schema_validation.sql

begin;

do $$
begin
  -- Test users (minimal auth.users row for FK targets)
  insert into auth.users (id)
  values
    ('11111111-1111-1111-1111-111111111111'),
    ('22222222-2222-2222-2222-222222222222');

  -- Project + image + tags (same project)
  insert into public.projects (id, owner_id, name)
  values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'P1');

  insert into public.images (id, project_id, storage_path, original_filename)
  values (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'bucket/p1/a.png',
    'a.png'
  );

  insert into public.tags (id, project_id, name, created_by)
  values (
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Perro',
    '11111111-1111-1111-1111-111111111111'
  );

  insert into public.image_tags (id, image_id, tag_id, assigned_by)
  values (
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    '11111111-1111-1111-1111-111111111111'
  );

  -- GREEN: duplicate tag (normalized) in same project must raise unique_violation
  begin
    insert into public.tags (id, project_id, name, created_by)
    values (
      'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
      'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      '  perro ',
      '11111111-1111-1111-1111-111111111111'
    );
    raise exception 'expected duplicate tag insert to fail';
  exception
    when unique_violation then
      null;
  end;

  -- Second project + image + tag (different project)
  insert into public.projects (id, owner_id, name)
  values ('ffffffff-ffff-ffff-ffff-ffffffffffff', '22222222-2222-2222-2222-222222222222', 'P2');

  insert into public.images (id, project_id, storage_path, original_filename)
  values (
    '99999999-9999-9999-9999-999999999999',
    'ffffffff-ffff-ffff-ffff-ffffffffffff',
    'bucket/p2/b.png',
    'b.png'
  );

  insert into public.tags (id, project_id, name, created_by)
  values (
    '10101010-1010-1010-1010-101010101010',
    'ffffffff-ffff-ffff-ffff-ffffffffffff',
    'Gato',
    '22222222-2222-2222-2222-222222222222'
  );

  -- RED: tag from P2 on image from P1 must fail (trigger)
  begin
    insert into public.image_tags (id, image_id, tag_id, assigned_by)
    values (
      'abababab-abab-abab-abab-abababababab',
      'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
      '10101010-1010-1010-1010-101010101010',
      '11111111-1111-1111-1111-111111111111'
    );
    raise exception 'expected cross-project image_tags insert to fail';
  exception
    when others then
      if sqlerrm like '%Image and tag must belong to the same project%' then
        null;
      else
        raise;
      end if;
  end;

  raise notice 'schema_validation: ok';
end;
$$;

rollback;
