const fs = require('fs');
const rl = require('readline-sync');
const pth = require('path')

let regionPath = {
    eur: []
}

let findPath = function () {
    let drives = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    for (let i = 0; i < drives.length; i++) {
        if (fs.existsSync(`${drives[i]}:/MemoryCards`)) {
            return `${drives[i]}:/MemoryCards`;
        }
    }
}

let findRegion = function(file){
    let code = file[3];
    if('EN'.indexOf(code) !== -1) return 'USA';
    if( 'J'.indexOf(code) !== -1) return 'JAP';
    return 'EUR'

}

let iniContents = function(path){
    return `
[Core]
SlotA = 1
MemcardAPath = ${path}`
}

let copyRawFiles = async function (saveDir) {
    let path = findPath(); //Change to mount point path if not Windows system
    let dirList = fs.readdirSync(path);
    let fileList = [];
    for (let i = 0; i < dirList.length; i++) {
        let thisDirList = fs.readdirSync(pth.join(path,dirList[i]));
        for(let e = 0; e < thisDirList.length; e++){
            if(thisDirList[e].indexOf('-1.raw') !== -1) fileList.push(pth.join(path, dirList[i], thisDirList[e]));
        }
    }

    let create = [];
    let overwrite = [];
    for(let i = 0; i < fileList.length; i++){
        let region = findRegion(pth.basename(fileList[i]));
        let newFile = pth.join(saveDir, pth.basename(fileList[i]).replace('.raw', `.${region}.raw`));
        (fs.existsSync(newFile) ? overwrite:create).push({oldFile:fileList[i], newFile})
    }
    
    rl.keyInYN(`Copying ${create.length+overwrite.length} files. Continue? `);
    for(let i = 0; i < create.length; i++){
        fs.copyFileSync(create[i].oldFile, create[i].newFile);
    }
    for(let i = 0; i < overwrite.length; i++){
        if(rl.keyInYN('Overwrite? '+overwrite[i].newFile)) fs.copyFileSync(overwrite[i].oldFile, overwrite[i].newFile);
    }
    console.log('Finished Copying!');
    return true;
}

let main = async function () {
    let saveDataDir;
    let dolphinDir;
    let copyFunction = (rl.keyInYN('Optional: Would you like to copy save files from a MemCardPro GC?'))
    do {
        let dir = rl.question(`What is the ${copyFunction?'destination':'existing'} path to the save files? `);
        fs.existsSync(dir) && fs.lstatSync(dir).isDirectory() ? saveDataDir = dir : console.log('That path does not exists or is not a directory.\n');
    } while (!saveDataDir);
    if (copyFunction) copyRawFiles(saveDataDir);

    do {
        let dir = rl.question(`What is the path to the 'Dolphin Emulator' config folder? `);
        fs.existsSync(dir) && fs.lstatSync(dir).isDirectory() && fs.existsSync(pth.join(dir,'Config')) ? dolphinDir = dir : console.log('That path does not exists or is not the Dolphin directory.\n');
    } while (!dolphinDir);

    let settingsDir = pth.join(dolphinDir, 'GameSettings')
    if(!fs.existsSync(settingsDir)) fs.mkdirSync(settingsDir);

    let saves = fs.readdirSync(saveDataDir).filter(function(x){return x.indexOf('.raw') !== -1});
    let createList = [];
    let overwriteInt = 0;
    for(let i = 0; i < saves.length; i++){
        let gameId = saves[i].slice(0,6);
        let iniFile = pth.join(settingsDir, gameId+'.ini');
        if(fs.existsSync(iniFile))console.log(`WARNING: Overwriting ${iniFile}`);
        createList.push({iniFile, save:pth.join(saveDataDir,saves[i])});
    }
    console.log(`Continue to create ${saves.length} Game INI files for Dolphin ${overwriteInt>0?`(${overwriteInt} of these are to be overwritten completely)`:''}`);
    if(!rl.keyInYN('Continue?')) return;

    for(let i = 0; i < createList.length; i++){
        if(fs.existsSync(createList[i].iniFile))fs.copyFileSync(createList[i].iniFile, createList[i].iniFile+'.bak');
        let iniString = iniContents(createList[i].save);
        fs.writeFileSync(createList[i].iniFile, iniString);
    }
    console.log('Completed')
    rl.question('Press enter to exit...')
    return true;
}

console.log('\nDolphin Memory Card INI Generator')
console.log(`\nThis script will generate INI files for Dolphin, to allow specific memory card files for specific games.
This script assumes the files are stored as their GameID names. A INI file will be generated off of this informaiton.

Example:
GWLP6L00-1.EUR.raw -> GWLP6L.ini      -- what we want
MemoryCardFile.raw -> Memory.ini      -- will be generated but is pointless

The script will look through one directory full of .raw files. It will not look for nested files.

I have added a function to copy files from MemCardPro GC and squash to one directory. It will look for the first version
of the game indexed (files ending in '-1.raw'). As a side affect of Dolphin's memory card system, a region indicator needs
to be added to the file name. So 'GXSP8P00-1.raw' -> 'GXSP8P00-1.EUR.raw'. So when copying back to the MemCardPro GC, the 
file will need to be renamed again.

As we are working with save files there are opportunities where there may be data loss so I encourage anyone using this
script to backup their data before proceeding. I have outlined where I can, when there will be overwrites so please
check these warnings accordingly. I'm not responsible for any data loss that may occur here.

NOTE: This script will create new .ini files in Dolphin Emulator/GameSettings/, so please back these up beforehand and
merge the files accordingly if you have any previous configurations. 

`)
main();