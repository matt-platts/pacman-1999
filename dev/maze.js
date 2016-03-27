// convert 1d array to a 2d array
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
			styles=movestring.substring(0,4); // we add the 4 move positions to a css class in order to draw the correct borders for the maze
			if (bit==4){
				if (x==0){
					styles = styles.replace("XXXR","XXLR"); 
					movestring = movestring.replace("XXXR","XXOR"); 
				} else {
					styles = styles.replace("XXLX","XXLR"); 
					movestring = movestring.replace("XXLX","XXLO"); 
				}
				styles += " " + movestring;
			}

			// print the pill if it's a cell with 1 in the binary maze
			if (bit==1){
				cellInnerHTML="<img src='graphics/pil.gif' name='pil_" + h_offset + v_offset + "'>";
			} else if (bit==2){
				cellInnerHTML="<div id='p" + v_offset + h_offset + "' ><img src='graphics/powerpil.gif' name='pil_" + h_offset + v_offset + "'></div>";
			} else {
				cellInnerHTML="<div id='p" + v_offset + h_offset + "' ></div>";
			}

			// add further css for creating the left and right walls on the next row down using css before and after selectors
			if (y<14){
				if (movestring.charAt(3)=="R"){
					styles +=" blockLowerRight";
				}
				if (movestring.charAt(2)=="L"){
					styles += " blockLowerLeft";
				}
			}

			// if it's a 1 in the binary array, add the html to a string
			if (bit != "0"){
				str='<div id="cell-' + h_offset + '-' + v_offset + '" style="position:absolute; top:' + v_offset + 'px; left:' + h_offset + 'px;" class="mazeCell ' + styles + '">' + cellInnerHTML + '</div>';
				innerStr += str;
				mazedata[v_offset][h_offset] = movestring; 

				// if you can go right , populate the next two elements in the full array with left and right options. These are spaces pacman takes up between the main cells. Cells are 30x30 and pacman moves in 10px increments.
				if (movestring.charAt(3)=="R"){
					mazedata[v_offset][h_offset+10] = "XXLR";
					mazedata[v_offset][h_offset+20] = "XXLR";
				}
				// and the same for down
				if (movestring.charAt(1)=="D"){
					if (typeof(mazedata[v_offset+10]) != "object"){
						mazedata[v_offset+10] = Array();
					}
					if (typeof(mazedata[v_offset+20]) != "object"){
						mazedata[v_offset+20] = Array();
					}
					
					mazedata[v_offset+10][h_offset] = "UDXX";
					mazedata[v_offset+20][h_offset] = "UDXX";
					
				}

			} else {
				mazedata[v_offset][h_offset] = "0"; 
				mazedata[v_offset][h_offset+10] = "0";
				mazedata[v_offset][h_offset+20] = "0";
			}


			h_offset = h_offset + 30;

		}
		// have all the innards in lineMoves
		//mazedata[v_offset] = new set(lineMoves.join(","))
		//console.log("Linemoves: " + lineMoves);
		v_offset = v_offset + 30; 
	}
	//console.log(innerStr);
	//console.log(mazedata);
	document.getElementById('mazeinner').innerHTML=innerStr;
	return mazedata;
}
