## Dolphin Game-Specific Memory Card Config Generator

This script will generate INI files for Dolphin, to allow specific memory card files for specific games.
This script assumes the files are stored as their GameID names. A INI file will be generated off of this informaiton.

Example:

`GWLP6L00-1.EUR.raw` -> `GWLP6L.ini`      -- what we want

`MemoryCardFile.raw` -> `Memory.ini`      -- will be generated but is pointless

The script will look through one directory full of .raw files. It will not look for nested files.

I have added a function to copy files from MemCardPro GC and squash to one directory. It will look for the first version of the game indexed (files ending in '`-1.raw`'). As a side affect of Dolphin's memory card system, a region indicator needs to be added to the file name. So '`GXSP8P00-1.raw`' -> '`GXSP8P00-1.EUR.raw`'. So when copying back to the MemCardPro GC, the  file will need to be renamed again.

As we are working with save files there are opportunities where there may be data loss so I encourage anyone using this script to backup their data before proceeding. I have outlined where I can, when there will be overwrites so please check these warnings accordingly. I'm not responsible for any data loss that may occur here.

NOTE: This script will create new .ini files in `Dolphin Emulator/GameSettings/`, so please back these up beforehand and merge the files accordingly if you have any previous configurations. 

### Prerequisites

- NodeJS + NPM installed (tested on `v16.15.1`)
- Windows Machine (edit line 34 if not Windows)
- A directory with all .raw files inside (not in subdirectories), named with their GameID and region (Eg. `GZLP0100-1.EUR.raw`). -This step will be done for you if using the 'Copy from MemCardPro GC' feature. 


### Usage

1. Clone this git repository
2. Inside this git respository, install library dependancies with `npm install` from console.
3. Run script with `node main.js` from console and follow instructions.