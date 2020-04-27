# TTTs Database Documentation

This file describes the database layout of the SQL Server.

## Tables

### Users

Name | Type | Description | Particularities | SQL specific
---- | ---- | ----------- | --------------- | ------------
id | int | makes table entry unique | assigned on creation, never gets changed | NOT NULL AUTO_INCREMENT PRIMARY KEY
token | text | system internal token for this user | unique for this user, never gets changed after creation | NOT NULL
name | text | name of this user | assigned by user, can be changed | NOT NULL
creationtime | bigint | unix timestamp of user creation | assigned on creation, never gets changed |  NOT NULL
lastacttime | bigint | unix timestamp of last user interaction | gets updated everytime the user interacts with the system | NOT NULL
timeout | bigint | unix timestamp when the lobby will time out and should be deleted | gets updated everytime a user interacts with the lobby | NOT NULL
lobbytokens | text | comma seperated list of joined lobbies | | NOT NULL
lobbyinvitetokens | text | comma seperated list of invited lobbies | | NOT NULL

MySQL create table:  
`CREATE TABLE users(id INT NOT NULL AUTO_INCREMENT, token TEXT NOT NULL, name TEXT NOT NULL, creationtime BIGINT NOT NULL, lastacttime BIGINT NOT NULL, timeout BIGINT NOT NULL, lobbytokens TEXT NOT NULL, lobbyinvitetokens TEXT NOT NULL, PRIMARY KEY (id))`

### Lobbies

Name | Type | Description | Particularities | SQL specific
---- | ---- | ----------- | --------------- | ------------
id | int | makes table entry unique | assigned on creation, never gets changed | NOT NULL AUTO_INCREMENT PRIMARY KEY
token | text | system internal token for this lobby | unique for this lobby, never gets changed after creation | NOT NULL
game | text | game instance of this lobby | | NOT NULL
name | text | name of this lobby | assigned by user, can be changed | NOT NULL
description | text | description of this lobby | assigned by user, can be changed | 
password | text | `sha256` hashed password of this lobby, only used for open lobbies | assigned by user, can be changed | 
privacy | text | whether the lobby is `open`, `closed` or `invisible`. read more about the lobby privacy flag below | assigned on creation, not intended to be changed after creation, but it is possible to do so | NOT NULL
creationtime | bigint | unix timestamp of lobby creation | assigned on creation, never gets changed |  NOT NULL
lastacttime | bigint | unix timestamp of last interaction with this lobby | gets updated everytime a user interacts with the lobby | NOT NULL
timeout | bigint | unix timestamp when the lobby will time out and should be deleted | gets updated everytime a user interacts with the lobby | NOT NULL
usertokens | text | comma seperated list of joined users | | NOT NULL
userinvitetokens | text | comma seperated list of users invited to this lobby | | NOT NULL

MySQL create table:  
`CREATE TABLE lobbies(id INT NOT NULL AUTO_INCREMENT, token TEXT NOT NULL, name TEXT NOT NULL, description TEXT, password TEXT, privacy TEXT NOT NULL, creationtime BIGINT NOT NULL, lastacttime BIGINT NOT NULL, timeout BIGINT NOT NULL, usertokens TEXT NOT NULL, userinvitetokens TEXT NOT NULL, PRIMARY KEY (id))`

#### Lobby Privacy Flag

Flag | Description
---- | -----------
open | can be joined by anyone, can have a password, will appear in "`open lobbies`" list, can be created by user
closed | can only be joined using an invitation, no password, can be created by a user, only creatable when also inviting players
invisible | only used in quickstart option, generated automatically by the server, will not appear in any lists, no manual invites by users