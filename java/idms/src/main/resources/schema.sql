CREATE TABLE IF NOT EXISTS "user" (
  id SERIAL PRIMARY KEY,
  username VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(128) NOT NULL,
  first_name VARCHAR(150) NOT NULL DEFAULT '',
  last_name VARCHAR(150) NOT NULL DEFAULT '',
  last_login TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS "oauth2_registered_client" (
  id VARCHAR PRIMARY KEY,
  client_id VARCHAR(100) NOT NULL UNIQUE,
  client_id_issued_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  client_secret VARCHAR(255) NOT NULL,
  client_secret_expires_at TIMESTAMP,
  client_name VARCHAR(150) NOT NULL,
  client_authentication_methods VARCHAR NOT NULL,
  authorization_grant_types VARCHAR NOT NULL,
  redirect_uris VARCHAR NOT NULL,
  post_logout_redirect_uris VARCHAR NOT NULL,
  scopes VARCHAR NOT NULL,
  client_settings VARCHAR NOT NULL,
  token_settings VARCHAR NOT NULL
);

CREATE TABLE IF NOT EXISTS "user_oauth2_registered_client_map" (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  client_id VARCHAR NOT NULL,

  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE NO ACTION,
  CONSTRAINT fk_client FOREIGN KEY (client_id) REFERENCES oauth2_registered_client(id) ON DELETE NO ACTION
);

CREATE TABLE IF NOT EXISTS "session" (
  primary_id CHAR(36) NOT NULL,
  session_id CHAR(36) NOT NULL,
  creation_time BIGINT NOT NULL,
  last_access_time BIGINT NOT NULL,
  max_inactive_interval INT NOT NULL,
  expiry_time BIGINT NOT NULL,
  principal_name VARCHAR(100),

  CONSTRAINT session_pk PRIMARY KEY (primary_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS session_ix1 on "session"(session_id);
CREATE INDEX IF NOT EXISTS session_ix2 ON "session"(expiry_time);
CREATE INDEX IF NOT EXISTS session_ix3 ON "session"(principal_name);

CREATE TABLE IF NOT EXISTS "session_attributes" (
  session_primary_id CHAR(36) NOT NULL,
  attribute_name VARCHAR(200) NOT NULL,
  attribute_bytes BYTEA NOT NULL,

  CONSTRAINT session_attributes_pk PRIMARY KEY (session_primary_id, attribute_name),
  CONSTRAINT session_attributes_fk FOREIGN KEY (session_primary_id) REFERENCES "session"(primary_id) ON DELETE CASCADE
);
