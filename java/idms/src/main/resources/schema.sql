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
