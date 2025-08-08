create sequence "oauth2_client_registration_id_seq" increment by 50 minvalue 1 start with 1;

create table "oauth2_client_registration" (
  id bigint primary key default nextval('oauth2_client_registration_id_seq'),
  registration_id varchar(255) not null unique,
  client_id varchar(255) not null,
  client_secret varchar(255) not null,
  enabled boolean not null default true
);
