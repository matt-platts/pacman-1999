/* 
 * File: maze.js
 * Meta: functions for creating the maze visual and an array to describe all of the maze cells in terms of possible moves, where pills are etc. 
*/

var pillNumber=0; // count the pills as we add them. This var is used to check if the screen has been completed in the game. 

/* 
 * Function: convert
 * Meta: Convert the original maze data which is a 1d array to a 2d array of rows and columns
 *       This 2d array is stored in the var interim_maze, which is later looped in order to build a bigger array containing every possible move available from each cell.
 */
function convert(maze){
	maze = maze.join("");
	var interim_maze = Array();
	x=0;
	y=0;
	//console.log(maze);
	for (i=0;i<maze.length;i++){
		character = maze.charAt(i);
		if (i==19 || x==19){
			x = 0;
			//console.log("x is now " + x + " at " + i);
			y++;
		}
		if (x==19) {
			y++;
			//console.log("y is now " + y + " - xz is " + x);
			x=0;
		}
		if (typeof (interim_maze[y]) != "object"){
			interim_maze[y]=Array();
		}
		interim_maze[y][x]=character;
		//console.log(typeof(interim_maze[y]) + " Y: " + interim_maze[y] + " == " + "x is " + x + " and y is " + y + " ======" + interim_maze[y][x]);
		x++;
	}
	return interim_maze;
}

/* 
 * Function : renderGrid
 * Meta: takes the 2d grid and builds a larger 2d array of possible moves from each position and other information. Each cell contains data up to 6 bytes long:
 *      Byte 1 - set to U if can go up, X if not
 *	Byte 2 - set to D if can go down, X if not
 *	Byte 3 - set to L if can go left, X if not
 *	Byte 4 - set to R if can go right, X if not
 *	Byte 5 - set to 1 if a pill is in the cell, 2 if a powerpill, 3 if it is the ghosts home, 4 if the cell goes to an offscreen tunnel, 5 indicates the top of the ghosts home.  
 *               which should only allow movement in one direction (out of the ghosts home) and not in unless the ghost has been eaten
 * 	Byte 6 - In the original version this contained one direction character (U, D, L or R) to tell the ghosts how to get back home. This still needs to be calculated. 
 *
 * 	This function also takes care of screen rendering including pills.
*/
function renderGrid(){
	var interim_maze = convert(maze);
	var mazedata = Array()
	var x=0;
	v_offset=25; // start 25px down
	innerStr="";
	for (i=0;i<interim_maze.length;i++){
		var lineMoves = Array();
		h_offset=35; // start a new line 35px in
		mazedata[v_offset] = Array();
		for (x=0;x<19;x++){
		
			bit = interim_maze[i][x];
			var movestring=""; // empty var to take the possible directions
			// populate movestring by scanning the binary array left, right, up and down for more 1's
			if (interim_maze[i-1] && interim_maze[i-1][x] != "0"){
				 movestring="U" } else { movestring="X";}

			if (interim_maze[i+1] && interim_maze[i+1][x] != "0"){
				 movestring += "D" } else { movestring += "X";}

			if (interim_maze[i][x-1] && interim_maze[i][x-1] != "0"){
				 movestring += "L" } else { movestring += "X";}

			if (interim_maze[i][x+1] && interim_maze[i][x+1] != "0"){
				 movestring += "R" } else { movestring += "X";}

			movestring += bit;
			lineMoves.push(movestring); // ADD to an array of the whole line

			// This section draws the inner wall of the outer double wall (where x and y are the perimiters).
			// The CSS for the mazecells is no longer used, but anticipating I may again in the future, I'm manually altering it here.
			if (i==0 || x==0 || i==14 || x==18 ){

				styles=movestring.substring(0,4); // we add the 4 move positions to a css class in order to draw the correct borders for the maze

				if (i==0){ 
					if (x != 0 && x!=18){
						 styles = styles.replace("XXL","XDL");	
						 styles = styles.replace("XXX","XDL");	
						 styles = styles.replace("XDX","XDL");	
						 styles = styles.replace("XDLX","XDLR");	
					}
				}
				if (i==14){
					styles = styles.replace("XXXR","UXXR");
					styles = styles.replace("XXLR","UXLR");
				}
				if (x==0){
					styles = styles.replace("DXX","DXR");
					styles = styles.replace("XXLR","XDLR");
				}
				if (x==18){
					styles = styles.replace("UDX","UDL");
					styles = styles.replace("XDX","UDL");
					styles = styles.replace("UXL","UDL");
				}

				styles = styles.replace("XXLR","");
				if (bit==4 && i!=0){
						styles = "UDLR";
				}
				if (bit==4 && i==0){
					styles=styles.replace("XXLX","XDLR");
					styles=styles.replace("XXXR","XDLR");
				}
				if (x==18 && i == 14){
					styles = "UXLX";
				}
			
			} else {
				styles="";
			}

			wallStyles = movestring.substring(0,4);

			// 4 is the off side tunnel
			if (bit==4){
				if (x==0){
					styles = styles.replace("XXXR","XXLR"); 
					movestring = movestring.replace("XXXR","XXOR"); 
				} else {
					styles = styles.replace("XXLX","XXLR"); 
					movestring = movestring.replace("XXLX","XXLO"); 
				}
				styles += " " + movestring;
				cellInnerHTML = "";

			// 5 is the red barrier at the top of the ghosts home base
			} else if (bit==5){
				styles += " ghostbarrier";
				cellInnerHTML = "";
				ghostHomeBase=Array(h_offset,v_offset); // set the return to base position for the game

			// print the pill if it's a cell with 1 in the binary maze
			} else if (bit==1){
				cellInnerHTML="<img src='graphics/pil.gif' name='pil_" + h_offset + v_offset + "'>";
				pillNumber++;

			// 2 is a powerpill
			} else if (bit==2){
				cellInnerHTML="<div id='p" + v_offset + h_offset + "' ><img src='graphics/powerpil.gif' name='pil_" + h_offset + v_offset + "'></div>";
				pillNumber++;

			// 0 is a cell within a wall
			} else {
				cellInnerHTML="<div id='p" + v_offset + h_offset + "' ></div>";
			}

			// add further css for creating the left and right walls on the next row down using css before and after selectors. This takes care of the double walls.
			if (y<14){
				if (movestring.charAt(3)=="R"){
					styles +=" blockLowerRight";
				}
				if (movestring.charAt(2)=="L"){
					styles += " blockLowerLeft";
				}
			}

			// Create the lookup array, which contains data about your possible moves, and print the pills whilst looping.. 
			// The lookup array maps to pixels on the screen so you can look up moves from the top and left properties of the sprites.
			// if it's not a zero in the original maze array, add the html to a string, and add this to innerStr. innerStr is built up and used as innerHTML to the maze div.
			if (bit != "0"){
				str='<div id="cell-' + h_offset + '-' + v_offset + '" style="position:absolute; top:' + v_offset + 'px; left:' + h_offset + 'px;" class="mazeCell ' + styles + '">' + cellInnerHTML + '</div>';
				innerStr += str;
				mazedata[v_offset][h_offset] = movestring; 

				// Cells and sprites are 30x30px and pacman moves in 10px increments. 
				// If you can go right from this cell, populate the next two elements in the lookup array (these are on screen positions) with left and right options. 
				// These are spaces pacman takes up between the main cells. 
				if (movestring.charAt(3)=="R"){ // can move right from here
					mazedata[v_offset][h_offset+10] = "XXLR";
					mazedata[v_offset][h_offset+20] = "XXLR";
				}
				if (movestring.charAt(1)=="D"){ // and the same for down. Not we may need to initialise the arrays when going down.
					if (typeof(mazedata[v_offset+10]) != "object"){
						mazedata[v_offset+10] = Array();
					}
					if (typeof(mazedata[v_offset+20]) != "object"){
						mazedata[v_offset+20] = Array();
					}
					mazedata[v_offset+10][h_offset] = "UDXX";
					mazedata[v_offset+20][h_offset] = "UDXX";
				}

			// add zeros (technically this should not be necessary but it saves checking for undefined and seems nicer
			} else {
				mazedata[v_offset][h_offset] = "0"; 
				mazedata[v_offset][h_offset+10] = "0";
				mazedata[v_offset][h_offset+20] = "0";

				str='<div id="cell-' + h_offset + '-' + v_offset + '" style="position:absolute; top:' + v_offset + 'px; left:' + h_offset + 'px;" class="wallCell w_' + wallStyles + '">' + cellInnerHTML + '</div>';
				innerStr += str;
			}

			h_offset = h_offset + 30;

		}
		//console.log("Linemoves: " + lineMoves);
		v_offset = v_offset + 30; 
	}
	//console.log(innerStr);
	//console.log(mazedata);
	document.getElementById('mazeinner').innerHTML=innerStr;
	return mazedata;
}
