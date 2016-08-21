# RoA-DungeonsLogger
The basic idea of this script is, that it will try and log your movement around the dungeons
and create a map of the rooms you've visited alongside with some helpfull info.

[![](http://i.imgur.com/NjU8JYl.png "Click to install ^^")](https://github.com/edvordo/RoA-DungeonsLogger/raw/master/RoADungeons.user.js)

## Preview
This is a preview of the script in working.
At the point of screenshot I made it to dungeon level 2 and have visited these rooms

![DungLogger ingame](http://i.imgur.com/XNAv1sH.png "This is what DL will look like in your game")

 * Red do indicates places there are mobs to fight
 * Yellow dot is a room you have not yet searched
 * White dot is, obviously, you :o)

I have successfully tested the script on level 1 dungeon with no problems.

If you run into any, please let me know and I'll try to look into it.

The only thing I'm kinda unable to fix if it happes is the case that two rooms generate the same hash from its textual representation found on the right side of game while in dungeons.

While I don't believe it would happen, there is sadly nothing I can do to prevent this.

<hr>

This script does not make any request to the server and will not walk the dungeons for you and will not revisit roms you've visited so far. It bases it's date from your actual movement around the dungeons, so you'll have to revisit the rooms you were in if you them show on th map :)

## Important note
When you finish with a level, please run this command from your console once you descend to a lower level 

```js
localStorage.removeItem("dungeon");
```

and refresh the game. Otherwise the generated map will get confused with new data.

Enjoy ^^

## Installation
As per usual with user scripts, install Tampermonkey for chrome or Greasemonkey for firefox and then install the script. :)