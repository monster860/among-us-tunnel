## What is this?
If you've tried playing Among Us with your friends, you probably know how frustrating it is - everyone in your group is spamming the "Create Game" button, and it's just not working, and when you finally do get a room, no one can connect, they just keep typing in the code over and over and over again and it doesn't want to work...

In addition, once you've created a game, you can't change the number of impostors or the map you're on, restarting the exact same frustrations as before. Argh!

This solves this by allowing you to use the Local game functionality, which is intended to be used for playing the game over a LAN, over the internet! This actually allows you to change the map you're on and the number of impostors, which solves the second problem.

This tool works both if you are playing on your PC or on your phone.

## How do I use this?

### A note about running on your phone.

There are two ways to use this tool while running this game on your phone. You can either use an app like [this one](https://play.google.com/store/apps/details?id=io.tempage.dorynode&hl=en_US) (android only) to run the tool directly on your phone, or you can run the script on your PC instead. It will work as long as your PC and phone are on the same LAN. This goes for both hosting the game and connecting to someone else's game.

### Running the tool.

If you are running on windows, you can use the release found [here](), simply extract it somewhere and run the `tunnel.bat` file. Otherwise, you can download and install `node.js` and download the source code found [here](https://raw.githubusercontent.com/monster860/among-us-tunnel/master/among_us_tunnel.js), and run `node among_us_tunnel.js` in the same folder.

### Hosting a game.

Hosting a game is very simple. First of all, you will need to have a port of your choice forwarded on your router. Then, you will want to make sure that if you do have Among Us open, that you are not currently in the Local menu. You must be either on the main menu or already hosting a local game.

Then, you will want to run the script. It will ask you if you want to host or connect. Type in `h` and press enter. Then you will enter the port number you have chosen. Afterwards, if you haven't already done so, go to Local in Among Us and hit Create Game. Note that it may say, `Couldn't start local network listener. You may need to restart Among Us`. This is normal, ignore it. Simply hit Create Game. Then, in the script it will say something like `Binding to 192.168.40.129` followed by a bunch of `Broadcast from 192.168.40.129:  UwU~Open~1~`

Note that this script will "attach" to the first game that it sees. After that, it will ignore any games hosted on other IP addresses in your LAN.

At this point, you should be able to distribute your IP address, as well as the port number, to the people you are playing with, and they can use this same script to connect.

### Connecting to a game.

To connect to a game, you will need the IP and port number. You will want to make sure that you are not currently hosting a game in Among Us.

What you need to do is run the script. It will ask you if you want to host or connect. Type in `c` and press enter. Then you will want to type in the IP and port number of the server you are connecting to, with a colon, like so: `12.34.56.78:11111`. 

After you press enter, if you typed in the IP correctly, you should be able to go to the Local menu and see the game in the list. Click on it and you should be able to connect.

**Note that there is** ***no*** **error message if you type in the IP wrong**. If it keeps saying `Sending subscription keepalive` over and over and nothing else, then you may have typed it in wrong.

You may have multiple devices connecting to a game using the same instance of this script.
