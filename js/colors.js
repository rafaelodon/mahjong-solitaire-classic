/* 
 * Color Tools
 *
 * By Rafael Odon (2022)
 * odon.rafael@gmail.com
 * 
 */
var ColorTools = {

    changeRGBShade : (factor, red, green, blue, alpha) => {    
        var newR = red + ((255-red) * factor);
        var newG = green + ((255-green) * factor);
        var newB = blue + ((255-blue) * factor);
        return "rgb("+Math.round(newR > 0 ? newR : 0)+","+Math.round(newG > 0 ? newG : 0)+","+Math.round(newB > 0 ? newB : 0)+","+alpha+")";
    },

    changeRGBStringShade : (factor, color) => {
        var colors = color.toLowerCase().replace("rgb(","").replace(")","").split(",").map(c=>c.trim());    
        return ColorTools.changeRGBShade(factor, parseInt(colors[0],10), parseInt(colors[1],10), parseInt(colors[2],10), parseFloat(colors[3]));
    },

    changeHexStringShade : (factor, color) => {
        color = color.replace("#","");
        color = color.length == 6 ? color :
            ""+color[0]+color[0]+color[1]+color[1]+color[2]+color[2];
        var red = parseInt(""+color[0]+color[1],16);
        var green = parseInt(""+color[2]+color[3],16);
        var blue = parseInt(""+color[4]+color[5],16);
        return ColorTools.changeRGBShade(factor, red, green, blue, 1);
    },

    changeColorShade : (factor, color) => {
        return color.startsWith("rgb") ?
            ColorTools.changeRGBStringShade(factor, color) :
            ColorTools.changeHexStringShade(factor, color);
    }
}