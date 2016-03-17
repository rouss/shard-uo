# ShardUO
A modern Ultima Online shard emulator.

## Features
1. Written in JavaScript, the language of the Web (and many other things).
2. Highly performant, built on top of Node.js and Google's V8 JavaScript engine.
3. Standards compliant, uses only industry standards when possible, and well
   supported open source products where no standard yet exists.
4. No save lag! The world state is constantly saving in the background with no
   interruption to the gameplay.
5. Reload configuration values, scripts, and even packet handlers on the fly
   without the need for a server restart! Develop new system, fix bugs, and even
   apply updates while the server is running, without the inconveniance of a
   restart.
6. Easy to develop for. With a tiny network core handling the gory details and
   all other logic handled through a global event system, changing existing and
   adding new functionality is a breeze.
7. Features for shard owners. With a centralized account management and login
   server, the ability to see all game servers in your network from the same
   login server, the ability to take account-wide actions from a single
   server, and a nice web interface for administration.

Please note that the installation, use, scripting, and development of ShardUO
assumes competency with current industry standard command-line development
tools. This document will provide enough information to accomplish certain basic
tasks, however the reader is encouraged to study these tools further.

# Installation
1. Download and install [Node.js](https://nodejs.org) version 5.8.0 or later.
2. Download and install [Git](https://git-scm.com/) version 2.7.3 or later.
3. Open a terminal window
  1. For Windows users, navigate to the location in your file system where you
     would like to install ShardUO, right-click in the white area, and select
     "Git Bash Here".
4. Execute the command "git clone https://github.com/qbradq/shard-uo.git" . This
   downloads all of the source code for ShardUO into a directory called
   shard-uo.
5. cd into shard-uo .
6. Execute the command "npm install" . This will download all of the libraries
   that ShardUO depends upon. This will take a while.
7. Execute the command "npm install -g bower". This will install additional
   tools required to install and configure the application.
8. Execute the command "bower install". This will download all of the
   dependecies for the web interface. This will take a while.
9. Execute the command "./generateKeys.sh" and follow the prompts. This will
   generate new certificates and API keys for all of the configured servers.
   This may take a few minutes per configuration depending on the speed and
   features of your CPU. Please note that each time you add a new shard
   configuration to the ./config directory this command should be ran again
   and a reload executed on any currently running shards and web servers.

# Usage
Shard servers are configured through configuration files found in the ./config
directory. example.js is the example configuration file. Generally when setting
up a new game server a copy of example.js is created and modified. Please do not
put spaces or special characters in the file name. master.js is the
configuration file for the account master and login server and should usually
not be altered.

To start a particular shard, from the root directory of ShardUO, execute the
command "node start [name]" where [name] is the name of the configuration file
minus the extension. This executes the start.js script, which then loads the
named configuration file, sets up the execution environment, and starts the
shard process.

