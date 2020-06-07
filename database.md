# TTTs Database Documentation

This file describes the database layout of the SQL Server.

## Tables

### Users

Name | Type | Description | Particularities | SQL specific
---- | ---- | ----------- | --------------- | ------------
id | bigint | makes table entry unique | assigned on creation, never gets changed | NOT NULL AUTO_INCREMENT PRIMARY KEY
token | text | system internal token for this user | unique for this user, never gets changed after creation | NOT NULL
secret | text | system internal secret token for this user, sent to the user on creation and used to authorize users actions | unique for this user, never gets changed after craetion | NOT NULL
name | text | name of this user | assigned by user, can be changed | NOT NULL
creationtime | bigint | unix timestamp of user creation | assigned on creation, never gets changed |  NOT NULL
lastacttime | bigint | unix timestamp of last user interaction | gets updated everytime the user interacts with the system | NOT NULL
timeout | bigint | unix timestamp when the lobby will time out and should be deleted | gets updated everytime a user interacts with the lobby | NOT NULL

MySQL create table query:
`CREATE TABLE users(id BIGINT NOT NULL AUTO_INCREMENT, token TEXT NOT NULL, secret TEXT NOT NULL, name TEXT NOT NULL, creationtime BIGINT NOT NULL, lastacttime BIGINT NOT NULL, timeout BIGINT NOT NULL, PRIMARY KEY (id))`

### Lobbies

Name | Type | Description | Particularities | SQL specific
---- | ---- | ----------- | --------------- | ------------
id | bigint | makes table entry unique | assigned on creation, never gets changed | NOT NULL AUTO_INCREMENT PRIMARY KEY
token | text | system internal token for this lobby | unique for this lobby, never gets changed after creation | NOT NULL
game | text | game instance of this lobby | | NOT NULL
flags | text | lobby / game specific flags | |
name | text | name of this lobby | assigned by user, can be changed | NOT NULL
description | text | description of this lobby | assigned by user, can be changed |
password | text | `sha256` hashed password of this lobby, only used for open lobbies | assigned by user, can be changed |
privacy | text | whether the lobby is `open`, `closed` or `invisible`. read more about the lobby privacy flag below | assigned on creation, not intended to be changed after creation, but it is possible to do so | NOT NULL
creationtime | bigint | unix timestamp of lobby creation | assigned on creation, never gets changed |  NOT NULL
lastacttime | bigint | unix timestamp of last interaction with this lobby | gets updated everytime a user interacts with the lobby | NOT NULL
timeout | bigint | unix timestamp when the lobby will time out and should be deleted | gets updated everytime a user interacts with the lobby | NOT NULL

MySQL create table query:
`CREATE TABLE lobbies(id BIGINT NOT NULL AUTO_INCREMENT, token TEXT NOT NULL, game TEXT NOT NULL, flags TEXT, name TEXT NOT NULL, description TEXT, password TEXT, privacy TEXT NOT NULL, creationtime BIGINT NOT NULL, lastacttime BIGINT NOT NULL, timeout BIGINT NOT NULL, PRIMARY KEY (id))`

#### Lobby Privacy

Privacy | Description
------- | -----------
open | can be joined by anyone, can have a password, will appear in "`open lobbies`" list, can be created by user
closed | can only be joined using an invitation, no password, can be created by a user, only creatable when also inviting players
invisible | only used in quickstart option, generated automatically by the server, will not appear in any lists, no manual invites by users

#### Lobby Flags

Flag | Description
invite | Whether this lobby is an invite only lobby
left | Whether a user already left this lobby
playerinverse | Whether in this lobby the second player starts rather than the first
quickgame | Whether this is a quick game lobby
rematchX | Whether user requested a rematch, X is player index

### Correlations

Name | Type | Description | Particularities | SQL specific
---- | ---- | ----------- | --------------- | ------------
id | bigint | makes table entry unique | assigned on creation, never gets changed | NOT NULL AUTO_INCREMENT PRIMARY KEY
usertoken | text | token of the user | assigned on creation, never gets changed | NOT NULL
lobbytoken | text | token of the lobby | assigned on creation, never gets changed | NOT NULL
invite | boolean | whether this is a pending invite | gets changed when invite accepted | NOT NULL

MySQL create table query:
`CREATE TABLE correlations(id BIGINT NOT NULL AUTO_INCREMENT, usertoken TEXT NOT NULL, lobbytoken TEXT NOT NULL, invite BOOLEAN NOT NULL, PRIMARY KEY (id))`
