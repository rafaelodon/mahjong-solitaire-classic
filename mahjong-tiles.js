/* 
 * Mahjong Solitaire Classic
 *
 * By Rafael Odon (2022)
 * odon.rafael@gmail.com
 * 
 * Credits:
 * - Dot, Bamboo, Character, Wind and Dragon SVGs from: 
 *   https://github.com/FluffyStuff/riichi-mahjong-tiles
 * - Season and Flowers SVGs modified from Jerry Crimson Mann originals at Wikimedia
 *   https://en.wikipedia.org/wiki/Mahjong_tiles
 * 
 * Nodes:
 * - A tile type is identified by it's key, but matches are checked by the group
 */

var TILES_TYPES = {
    "dot1": { count:4, group:"dot1" },
    "dot2": { count:4, group:"dot2" },
    "dot3": { count:4, group:"dot3" },
    "dot4": { count:4, group:"dot4" },
    "dot5": { count:4, group:"dot5" },
    "dot6": { count:4, group:"dot6" },
    "dot7": { count:4, group:"dot7" },
    "dot8": { count:4, group:"dot8" },
    "dot9": { count:4, group:"dot9" },
    "bamboo1": { count:4, group:"bamboo1" },
    "bamboo2": { count:4, group:"bamboo2" },
    "bamboo3": { count:4, group:"bamboo3" },
    "bamboo4": { count:4, group:"bamboo4" },
    "bamboo5": { count:4, group:"bamboo5" },
    "bamboo6": { count:4, group:"bamboo6" },
    "bamboo7": { count:4, group:"bamboo7" },
    "bamboo8": { count:4, group:"bamboo8" },
    "bamboo9": { count:4, group:"bamboo9" },
    "char1": { count:4, group:"char1" },
    "char2": { count:4, group:"char2" },
    "char3": { count:4, group:"char3" },
    "char4": { count:4, group:"char4" },
    "char5": { count:4, group:"char5" },
    "char6": { count:4, group:"char6" },
    "char7": { count:4, group:"char7" },
    "char8": { count:4, group:"char8" },
    "char9": { count:4, group:"char9" },    
    "east": { count:4, group:"east" },
    "south": { count:4, group:"south" },
    "west": { count:4, group:"west" },
    "north": { count:4, group:"north" },
    "red": { count:4, group:"red" },
    "green": { count:4, group:"green" },
    "white": { count:4, group:"white" },
    "spring": { count:1, group:"season" },
    "summer": { count:1, group:"season" },
    "autumn": { count:1, group:"season" },
    "winter": { count:1, group:"season" },
    "plum": { count:1, group:"flower" },
    "orchid": { count:1, group:"flower" },
    "chrysanthemum": { count:1, group:"flower" },
    "bamboo": { count:1, group:"flower" }
};

// Load each tile type image
Object.keys(TILES_TYPES).forEach((key) => {    
    var tileType = TILES_TYPES[key];
    tileType.image = new Image();
    tileType.image.onload = function () {
        console.log("Image",this.src,"loaded");
        tileType.loaded = true;        
    };
    tileType.image.src = "img/tiles/"+key+".svg";
});

function generateTilesMap() {
    
    // Generates a symbol sequence based on the listed tiles and theirs counts
    var tiles = {};
    Object.keys(TILES_TYPES).forEach((key) => {        
        for(var j=0; j<TILES_TYPES[key].count; j++){
            var id = key+"_"+j; 
            // the tile initial state
            tiles[id] = {
                id: id,
                tileType: key,
                group: TILES_TYPES[key].group,
                x: undefined,
                y: undefined,
                z: undefined,
                removed: false,
                alpha: 1,                
            };
        }
    });

    return tiles;
}
