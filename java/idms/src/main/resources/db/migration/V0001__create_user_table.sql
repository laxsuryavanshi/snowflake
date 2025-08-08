create sequence "user_id_seq" increment by 50 minvalue 1 start with 1;

create table "user" (
  id bigint primary key default nextval('user_id_seq'),
  username varchar(255) not null unique,
  password varchar(255) not null,
  first_name varchar(255) not null default '',
  last_name varchar(255) not null default '',
  last_login timestamptz not null default 'epoch'::timestamptz
);
