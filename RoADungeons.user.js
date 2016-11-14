// ==UserScript==
// @name         RoA - dungeon logger
// @namespace    Reltorakii_is_awesome
// @version      0.2.1
// @description  Tracks your movement around dungeon and generates a map for visited rooms
// @author       Reltorakii
// @downloadURL  https://github.com/edvordo/RoA-DungeonsLogger/raw/master/RoADungeons.user.js
// @updateURL    https://github.com/edvordo/RoA-DungeonsLogger/raw/master/RoADungeons.user.js
// @match        https://*.avabur.com/game.php
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    var MY_WALL_COLOR = "#ff0000";

    /**********************************************************/
    /*              NO NEEDD TO EDIT FURTHER                  */
    /*  ABOVE SETTING WILL NOT BE CARIED OVER SCRIPT UPDATES  */
    /**********************************************************/

    var WALL_COLOR = MY_WALL_COLOR;

    var dungeon         = localStorage.getItem("dungeon");
        dungeon         = dungeon === null ? {r:{},cf:0,ct:null} : JSON.parse(dungeon);
    function x(e, res, req, jsonres) {
        if (jsonres.hasOwnProperty("data") && jsonres.data.hasOwnProperty("map")) {
            if (dungeon.cf !== jsonres.data.floor) {
                dungeon.r = {};
                dungeon.cf = jsonres.data.floor;
            }
            var jrd = jsonres.data;
            var data = {};
            var token = $(jrd.map).text().replace("↓", "v"); // map
                token = btoa(JSON.stringify(token)); // token
            if (dungeon.r.hasOwnProperty(token)) {
                data = JSON.parse(JSON.stringify(dungeon.r[token]));
            } else {
                data.pe = "";
                data.ps = "";
                data.pn = "";
                data.pw = "";
                data.t  = token;
            }
            if (dungeon.ct === null) {
                dungeon.ct = token;
            }

            data.e = jrd.e?1:0; // east
            data.s = jrd.s?1:0; // south
            data.n = jrd.n?1:0; // north
            data.w = jrd.w?1:0; // west
            data.r = !!jrd.search; // raided
            data.b = jrd.enemies.length; // battles available

            dungeon.r[data.t] = data;

            var walk = jsonres.hasOwnProperty("m") && jsonres.m.match(/You walked (east|south|north|west)/);
                walk = walk ? jsonres.m.match(/You walked (east|south|north|west)/) : false;
            if (walk !== false) {
                walk = walk[1].match(/^./)[0];
                if (dungeon.ct !== data.t) {
                    if (typeof dungeon.r[dungeon.ct] !== "undefined") {
                        dungeon.r[dungeon.ct]["p"+walk] = data.t;
                        var sm = {
                            "s": "n",
                            "n": "s",
                            "e": "w",
                            "w": "e"
                        };
                        dungeon.r[data.t]["p"+sm[walk]] = dungeon.ct;
                    }
                    dungeon.ct = data.t;
                }
            }
            localStorage.setItem("dungeon", JSON.stringify(dungeon));
            updateDungeonMap(false);
        } else {
            updateDungeonMap(req.url.indexOf("dungeon_") === -1);
        }
    }

    var dmc, dmctx, dmv;
    function updateDungeonMap(hide) {
        var d = JSON.parse(JSON.stringify(dungeon));
        if ($("#dungeonMapCanvas").length === 0) {
            var h = $("<div>")
                .attr("id", "dMCW")
                .css({position:"absolute",top:0,left:0})
                .addClass("border2 ui-component")
                .appendTo("body");
            $("<canvas>").attr({
                id: "dungeonMapCanvas",
                width: "325",
                height: "325"
            }).appendTo("#dMCW");
            h.draggable({handle:"#dungeonMapCanvas"}).resizable({stop:function(e,d){$("#dungeonMapCanvas").attr({width:d.size.width,height:d.size.height});updateDungeonMap(false);}});
            dmc = document.getElementById("dungeonMapCanvas");
            dmctx = dmc.getContext("2d");
        }
        if (hide === false) {
            $("#dMCW").show();
            dmv = [];
            dmctx.clearRect(0,0,dmc.width,dmc.height);
            drawTile(d.ct, Math.floor(dmc.width/2), Math.floor(dmc.height/2), 1);
        } else {
            $("#dMCW").hide();
        }
    }

    function drawTile(id, x, y, player) {
        if (typeof player === "undefined") {
            player = 0;
        }

        if (dmv.indexOf(id) !== -1) {
            return;
        }
        var tile = dungeon.r[id];
        dmv.push(id);

        // console.log(id,x,y);
        // console.log(JSON.stringify(tile, null, "\t"));
        
        dmctx.fillStyle = "#333";
        dmctx.fillRect(x-4, y-4, 10, 10);

        drawTileWall(x,y,"top", !tile.n);
        drawTileWall(x,y,"left", !tile.w);
        drawTileWall(x,y,"right", !tile.e);
        drawTileWall(x,y,"bot", !tile.s);

        if (tile.r) {
            dmctx.fillStyle     = "#ffd700";
            dmctx.strokeStyle   = "#ffd700";
            dmctx.arc(x,y,2, 0, 2*Math.PI);
            dmctx.fill();
        }

        if (tile.b > 0) {
            dmctx.fillStyle     = "#ff0000";
            dmctx.strokeStyle   = "#ff0000";
            dmctx.arc(x,y,2, 0, 2*Math.PI);
            dmctx.fill();
        }

        if (player === 1) {
            dmctx.fillStyle     = "#ffffff";
            dmctx.strokeStyle   = "#ffffff";
            dmctx.arc(x,y,2, 0, 2*Math.PI);
            dmctx.fill();
        }

        if (tile.n === 1 && tile.pn !== "") {
            // console.log(tile.pn);
            drawTile(tile.pn, x, y-10);
        }
        if (tile.w === 1 && tile.pw !== "") {
            // console.log(tile.pw);
            drawTile(tile.pw, x-10, y);
        }
        if (tile.e === 1 && tile.pe !== "") {
            // console.log(tile.pe);
            drawTile(tile.pe, x+10, y);
        }
        if (tile.s === 1 && tile.ps !== "") {
            // console.log(tile.ps);
            drawTile(tile.ps, x, y+10);
        }
    }

    function drawTileWall(x,y,which, blocked) {
        if (blocked) {
            dmctx.strokeStyle = WALL_COLOR;
            dmctx.fillStyle   = "#ffffff";
        } else {
            dmctx.strokeStyle = "#333";
            return;
        }
        dmctx.beginPath();
        if (which === "top") {
            dmctx.moveTo(x-5, y-5);
            dmctx.lineTo(x+5, y-5);
        } else if (which === "left") {
            dmctx.moveTo(x-5, y-5);
            dmctx.lineTo(x-5, y+5);
        } else if (which === "right") {
            dmctx.moveTo(x+5, y+5);
            dmctx.lineTo(x+5, y-5);
        } else if (which === "bot") {
            dmctx.moveTo(x-5, y+5);
            dmctx.lineTo(x+5, y+5);
        }
        dmctx.stroke();
        dmctx.closePath();
    }
    $(document).on("ajaxSuccess", x);
})();