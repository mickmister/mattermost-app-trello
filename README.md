# Mattermost/Trello Integration

* [Feature summary](#feature-summary)
* [Set up](#set-up)
  * [Installation](#installation)
  * [Configuration](#configuration)
* [Admin guide](#admin-guide)
  * [Slash commands](#slash-commands)
* [End user guide](#end-user-guide)
  * [Get started](#get-started)
  * [Using /trello commands](#use-trello-commands)
* [Development](#development)
  * [Manual installation](#manual-installation)
  * [Run the local development environment](#run-the-local-development-environment)
  * [Run the local development environment with Docker](#run-the-local-development-environment-with-docker)

This application allows you to integrate Trello with your Mattermost instance. letting you know when a new card is created, as well as getting notified about card updates. Also, allows the user to create new cards without moving from the Mattermost window.

# Feature summary

**Trello to Mattermost notifications:** Link your Mattermost channels with the Trello boards you want to see, so you and your team can get notifications about the creation and position update of each card.

**Manage card creation on Mattermost:** Create new cards from Mattermost (via modal or command), assigning the board and the list to which you want to add the card.

# Set up

## Installation

This plugin requires that your Mattermost workspace has the ``/apps install`` command enabled.

To install, as a super admin user, run the command ``/apps install http TRELLO_API_URL`` in any channel. The ``/trello`` command should be available after the configuration has been successfully installed.

The ``TRELLO_API_URL`` should be replaced with the URL where the Trello API instance is running. Example: ``/apps install http https://mattermost-trello-dev.ancient.mx/manifest.json``

## Configuration

1. First, install the app in your current Mattermost instance (refer to [Installation](#installation)) so that the ``/trello`` command is available.
2. Next, configure your Trello workspace. As a super admin user, run the ``/trello configure`` command.
3. In the confirmation modal, enter your workspace, API key and API token which you can find at https://trello.com/app-key.
4. When you've completed the configuration, the ``/trello account`` command will be enabled. 
5. Next, for access to all the commands, log in to a Trello account using the command ``/trello account login``.
6. Follow the link provided and eter the generated token where required.

# Admin guide

## Slash commands

- ``/trello configure``: This command will enable all the other commands; it asks the administrator for an API key (which will be used to execute calls to Trello’s API) and a token.

# End user guide

## Get started

## Use ``/trello`` commands

- ``/trello help``: This command will show all current commands available for this application.
- ``/trello connect``: Will display a new modal were a user token will be needed. It is required before any other action.
- ``/trello disconnect``: Will erase current user oauth token.
- ``/trello card create``: Allow any user to create a new card in any board they want (boards are listed as they have access to them from Trello). Both, command and modal options are available.
- ``/trello subscription add``: Creates a new subscription for notifications: choose a board and a channel and get notified of the updates in that board. You can subscribe to more than one board per channel.
- ``/trello subscription list``: Show the list of all subscriptions made in all of your channels.
- ``/trello subscription remove``: Will allow you to remove a subscription. No more notifications from that board will be received.

# Development

## Manual installation

*  Download the latest repository release.

### Run the local development environment

* You need to have installed at least node version 12 and maximum version 18. You can download the latest lts version of node for the required operating system here https://nodejs.org/es/download/

*  Install libraries: ``cd`` to the project directory and execute ``npm install`` to download all dependency libraries.

```
$ npm install
```

*  Update the environment configuration file. The ``.env`` file must be modified or added to set the environment variables, it must be in the root of the repository.

```
file: .env

PROJECT=mattermost-trello-app
PORT=4002
HOST=https://mattermost-trello-dev.ancient.mx
```

Variable definition

- PROJECT: In case of executing the project with Docker using the ``.build.sh`` file, this variable will be used for the name of the container
- PORT: Port number on which the Trello integration is listening
- HOST: Trello API usage URL

* Finally, the project must be executed.

```
$ npm run dev
```

### Run the local development environment with Docker

* You need to have Docker installed. You can find the necessary steps to install Docker for the following operating systems:

[Ubuntu](https://docs.docker.com/engine/install/ubuntu/)
[Mac](https://docs.docker.com/desktop/mac/install/)
[Windows](https://docs.docker.com/desktop/windows/install/)

* Once you have Docker installed, the next step would be to run the ``./build.sh`` file to create the API container and expose it locally or on the server, depending on the case required.

```
$ ./build
```

When the container is created correctly, the API will be running at the url http://127.0.0.1:4002 in such a way that the installation can be carried out in Mattermost.
