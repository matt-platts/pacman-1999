/* 
 * File: pacman.js
 * Meta: game logic
 * Note: development very much in progress - rewrite imminent.
*/


// NOTES: 
// Look for the text HACK2016 in the code - this means I changed something without fully understanding the implications (it's old code)
// Specifically - checking that possG[wg] exists before trying to read a charAt. I *think* it is because the maze data isn't populated with zeros and the ghost path information isn't in the maze data, so this hack should be removed when the data set is completed.


// pacman.js
// by Matt Platts, 1999-2000. Updated for Netscape 6, June 2001. Tweaks for Google Chrome and Firefox around 2006. Updated 2016. 


// initial settings. these should be increased at around 10000 points?
var powerPillLifetime=200; // how many iterations the powerpill lasts for - hard is 120
var ghostBlinkLifetime=25; // how long the ghosts blink for within the power pill. Hard is 15.
var fruitLifetime=95; // how many iterations a piece of fruit stays on screen - hard is 80
var messageLifetime=1500; // millisecons for the duration of a message (life lost, get ready etc)
var basicVision = sessionStorage.basicVision; 

var pacTimer;
var ghostsTimer;
var scatterTime=300; // how long ghosts remain in scatter mode

// set main variables / images
var mazecount=0
var mazeNo=0
ghimg0 = new Image
ghimg0.src = 'graphics/ghost_red.gif'
ghimg1 = new Image
ghimg1.src = 'graphics/ghost_pink.gif'
ghimg2 = new Image
ghimg2.src = 'graphics/ghost_blue.gif'
ghimg3 = new Image
ghimg3.src = 'graphics/ghost_orange.gif'
ghimg5 = new Image
ghimg5.src = 'graphics/ghost5.gif'
ghimg6 = new Image
ghimg6.src = 'graphics/ghost6.gif'
eyes = new Image
eyes.src = 'graphics/eyes.gif'
blank = new Image
blank.src = 'graphics/blank.gif'
berry0 = new Image
berry0.src = 'graphics/cherry.gif'
berry1 = new Image
berry1.src = 'graphics/strawberry.gif'
var won = false // true if won the game
var keycount=0 // number of keys currently depressed
var newdatabit = 0 
var onPause = 0
var ifpil = 0
var pilcount = 0 // number of pills eaten
var ppTimer = "0" //counts down from 80 back to 0 when a powerpill is eaten
var powerpilon = false // set to true when powerpill is eaten, back to false when it wears off
var lives = parseInt(sessionStorage.lives)
var score = parseInt(sessionStorage.score)
var moving = false
var newkey = "R" // key just pressed
var lastkey = "D" // key previously pressed
var movekey = "D" // active key
var engage2 = false
var fruitOn=false
var fruitTimer=0
var speed=sessionStorage.speed;
var movespeed=speed;
var ghostspeed=speed; 
var gameTime=sessionStorage.gameTime;
var level = sessionStorage.level;
var resetModeTime=gameTime;

// start positions for levels 1,3,4,5
var pacStartTop=265
var pacStartLeft=305
var ghostStartTop=195
var ghostStartLeft=305

if (sessionStorage && sessionStorage.level==2) {
	pacStartTop=265
	pacStartLeft=305
	ghostStartTop=195
	ghostStartLeft=305
}
var ghostscore=50
var nextfruitscore=score+600
var thisfruit=0
var fruitArray = new Array(true,true)
if (sessionStorage){
	if (sessionStorage.level==1) offScreen=1
	if (sessionStorage.level==2 || sessionStorage.level==5) offScreen=2
	if (sessionStorage.level==3 || sessionStorage.level==4) offScreen=3
} else {
	offScreen=1;
}
/* Function: init
 * Meta: init() was originally called from the body onLoad, now it is called after the dynamically loaded javascript maze for the first level. 
 *       init() sets up cross-browser pointer variables, defines several arrays for later use, then calls start function to kick off the level itself. 
 *       This is only required for the first level of the game.
*/
function init(){

	ns=(navigator.appName.indexOf('Netscape')>=0)? true:false
	n6=(document.getElementById && !document.all)? true:false
	if (n6) {ns=false; document.all=document.getElementsByTagName}

	if (n6){
		divPacman  =  (ns)? document.pacman:document.getElementById('pacman').style
		divGhost0  =  (ns)? document.ghost0:document.getElementById('ghost0').style
		divGhost1  =  (ns)? document.ghost1:document.getElementById('ghost1').style
		divGhost2  =  (ns)? document.ghost2:document.getElementById('ghost2').style
		divGhost3  =  (ns)? document.ghost3:document.getElementById('ghost3').style
		divFruit   =  (ns)? document.fruit:document.getElementById('fruit').style
		divMessage =  (ns)? document.message:document.getElementById('message').style
		divStart   =  (ns)? document.start:document.getElementById('start').style
		divMessEnd =  (ns)? document.messageEnd:document.getElementById('messageEnd').style
	} else {
		divPacman   =  (ns)? document.pacman:document.all.pacman.style
		divGhost0   =  (ns)? document.ghost0:document.all.ghost0.style
		divGhost1   =  (ns)? document.ghost1:document.all.ghost1.style
		divGhost2   =  (ns)? document.ghost2:document.all.ghost2.style
		divGhost3   =  (ns)? document.ghost3:document.all.ghost3.style
		divFruit    =  (ns)? document.fruit:document.all.fruit.style
		divMessage  =  (ns)? document.message:document.getElementById('message').style
		divStart    =  (ns)? document.message:document.all.start.style
		divMessEnd  =  (ns)? document.messageEnd:document.all.messageEnd.style
	}

	ghost0src = (ns)? divGhost0.document.images[0]:document.images.gst0
	ghost1src = (ns)? divGhost1.document.images[0]:document.images.gst1
	ghost2src = (ns)? divGhost2.document.images[0]:document.images.gst2
	ghost3src = (ns)? divGhost3.document.images[0]:document.images.gst3
	fruitsrc = (ns)? divFruit.document.images[0]:document.images.berry

	scoreform  = (ns)? document.score.document:document
	lifeform   = (ns)? document.score.document:document
	timeform   = (ns)? document.score.document:document
	pilsrc     = (ns)? document:document

	if (ns) {
		document.captureEvents(Event.KEYDOWN|Event.KEYUP);
		document.onkeydown=kdns
		document.onkeyup=ku
	}

	ghostData = new Array (6,7,9,10) // used later to test for if opposite directions are present
	leftG = new Array; topG = new Array; possG = new Array; engGhost = new Array
	preGtop = new Array; preGleft = new Array
	vulnerable = new Array (true, true, true, true)
	onPath = new Array (false, false, false, false)

	if (sessionStorage){
		if (sessionStorage.level>1){
			scoreform.forms[0].elements[0].value = sessionStorage.score
			lifeform.forms[0].elements[1].value = sessionStorage.lives
		}
	}

	ghostDir = new Array
	pacLeft = parseInt(divPacman.left)
	pacTop = parseInt(divPacman.top)
	for(i=0;i<4;i++){
		leftG[i] = eval ("divGhost" + i +".left")
		leftG[i] = parseInt(leftG[i])
		topG[i] = eval ("divGhost" + i +".top")
		topG[i] = parseInt(topG[i])
		ghostDir[i] = "U"
	}
	start();
}

/* 
 * Function: ghosts
 * Meta: Deals with the ghosts movements on a recurring timer as one of the main game loops. 
 *       Collision detection is also a part of this loop and not a part of move.
 * 
*/
function ghosts(){

	// The movement functions are run four times in a loop - once for each ghost
	for (wg=0;wg<4;wg++){
		// 1. Load the possible moves from the mazedata array into the possG array. 
		//   All the data for all the ghosts is used later (collision detection) hence the array. 
		possG[wg] = mazedata[topG[wg]][parseInt(leftG[wg])];

		// 2. Check possibile moves. The ghostData array contains info on which moves are possible. 
		//    If more than 2 directions are present, or only 1 (ie backwards, so dead end) - a new direction must be generated...
		totalDirections=0 // counters for each ghost
		for (n=0;n<4;n++){
		ghostData[n]=0
		if (possG[wg] && possG[wg].charAt(n) != "X") { // HACK2016
			ghostData[n] = "8" // the 8 is a random otherwise unused character, just need something for checking in section 4 below
			totalDirections++;
		} else {
			ghostData[n] = n}
		}

		// 3. Call function to get ghost direction where there are 1 or more than two directions
		if (totalDirections>2 || totalDirections==1) generateGhostDir(wg,totalDirections,possG[wg])

		// 4. if there's 2 directions only, need to ascertain if they are 180 or 90 degrees. 
		// The '8' added above is used to ascertain if they are opposite directions (eg Left & Right) or not. 
		// If they're opposite, obviously the previous direction will apply.
		// If they're at right angles (No cases of 2 8's next to each other) a new direction must be generated.
		firstPair = false; secPair = false
		if (totalDirections==2) {
			if (ghostData[0] == ghostData[1]) firstPair = true
			if (ghostData[2] == ghostData[3]) secPair = true
			if (!firstPair && !secPair) { generateGhostDir(wg,totalDirections,possG[wg]);}  // don't have any pairs so it's right angles
		}

		// if basicVision is set, and ghost is not onPath to home, compare ghost positions to your position & if it can see you, adjust direction.
		if (!onPath[wg] && basicVision === true) { checkBasicVision(wg) }

		// For each ghost, if ghostDir (current direction) is in the possG array (the move is possible) then a flag to engage the ghost (engGhost) is set to true. 
		// Otherwise (move not possible) engGhost (engage ghost) is set to false. Thus, the ghost is only engaged if it can make the move. 
		// NB: Ghost is also engaged if onPath is true, as it knows where it's going (onPath means the ghost has been eaten and is on a path to the base.. - this path is coded into the mazedata array)

		//status = (wg + "--" + possG[wg]) //status bar for error checking
		if (!possG[wg]){ possG[wg]="0";} // HACK2016
		if (ghostDir[wg] == possG[wg].charAt(0) || ghostDir[wg] == possG[wg].charAt(1) || ghostDir[wg] == possG[wg].charAt(2) || ghostDir[wg] == possG[wg].charAt(3) || onPath[wg]) {
			engGhost[wg] = true;
		} else {
			engGhost[wg] = false
		}

		// if onPath is true for the particular ghost, and there's a path direction present in the array, change the ghost's direction to follow the path home...
		// 2016 - think this is defunct now as path is calculated as part of getting the ghosts movement.
		/*
		if (onPath[wg] && possG[wg].length=='6') {
			ghostDir[wg] = possG[wg].charAt(5)
			//alert("Ghost" + i + " told to go " + ghostDir[i])
		} else if (onPath[wg]){
			//console.log("ON A PATH");
		
		}
		*/

		//status bar stuff for checking variables..
		//status = possG[0] + ":" + possG[1] + ":" + possG[2] + ":" + possG[3] + "-- " + ghostDir[0] + " " + ghostDir[1] + " " + ghostDir[2] + " " + ghostDir[3] + "**** " + secondGhost[1] + "^^" + engGhost[0] + engGhost[1] + engGhost[2] + engGhost[3]

		// We store ghost positions so can be compared to positions next time round. If same, generate new direction. 
		// This is to over-ride when they stick if they're following you and you move out of the way, as there's nothing else to tell them to generate a new direction.
		// update 2016 - this is NONSENSE! Need to generate a proper direction now I have the speed sorted!
		if (preGtop[wg] == topG[wg] && preGleft[wg] == leftG[wg]) generateGhostDir(wg,totalDirections,possG[wg])
		preGtop[wg] = topG[wg]
		preGleft[wg] = leftG[wg]
		

		//if the ghost is engaged, update position variable, and then position
		if (engGhost[wg] || onPath[wg]) {
			if (ghostDir[wg] == "U") {topG[wg] = (topG[wg]-10); eval ("divGhost" + wg + ".top = topG[wg]")}
			if (ghostDir[wg] == "D") {topG[wg] = (topG[wg]+10); eval ("divGhost" + wg + ".top = topG[wg]")}
			if (ghostDir[wg] == "L") {leftG[wg] = (leftG[wg]-10); eval ("divGhost" + wg + ".left = leftG[wg]")}
			if (ghostDir[wg] == "R") {leftG[wg] = (leftG[wg]+10); eval ("divGhost" + wg + ".left = leftG[wg]")}
		}

		// For the path stuff... if it goes off the maze (er.. this means there is an error somehow int the mazedata array!), then immediately return to home.
		if (onPath[wg]){
			if (topG[wg]>=446 || topG[wg] <=35 || leftG[wg]<=25 || leftG[wg] >=591) {
				eval ("divGhost" + wg + ".left = ghostStartLeft")
				eval ("divGhost" + wg + ".top = ghostStartTop")
				leftG[wg] = eval ("parseInt(divGhost" + wg + ".left)")
				topG[wg] = eval ("parseInt(divGhost" + wg + ".top)")
				onPath[wg] = false
				ghostDir[wg] = "U"
				eval ("ghost" + wg + "src.src=ghimg" + wg + ".src")
			}
			// and if it's home, reset it to not vulnerable and back to correct image
			if (leftG[wg] == ghostHomeBase[0] && topG[wg] == ghostHomeBase[1]){
				if (!won){ onPath[wg] = false; }
				vulnerable[wg] = false;
				eval ("ghost" + wg + "src.src=ghimg" + wg + ".src")
				ghostDir[wg] = "U"
			}
		}

		// Collision detectoin
		// If so, either send the ghost home, or lose a life, depending whether a powerpill is currently active. 
		if (pacLeft > leftG[wg]-20 && pacLeft < leftG[wg]+20 && pacTop > topG[wg]-20 && pacTop< topG[wg]+20){

			//if no Powerpill and game not won and ghost not on path, you've lost a life
			//or pill is on but ghost is not vulnerable then same
			if ((ppTimer=="0" && !won && !onPath[wg]) || (ppTimer>="1" && !vulnerable[wg] && !onPath[wg])) {
				lives = (lives-1)
				score -= 50
				scoreform.forms[0].elements[0].value = score
				lifeform.forms[0].elements[1].value -= 1
				resetModeTime = timeform.forms[0].elements[2].value;
				divMessage.visibility='visible'
				onPause=1;
				setTimeout('divMessage.visibility=\'hidden\'; onPause=0; pacTimer = setTimeout("move()",movespeed); ghostsTimer = setTimeout("ghosts()",ghostspeed)',messageLifetime);
					
				 if (lives==0) {
					 divMessEnd.visibility='visible'
					 onPause=1;
					 divMessage.display="none";
					locStr = "intropage.html?score=" + score;
					 setTimeout('won=true; sessionStorage.score=score; location=locStr;',messageLifetime);
				} else {
					reset()
				} 
			//if powerpill is on and ghost is vulnerable, turns ghost to eyes, sets first possible direction, and makes path true
			} else if (ppTimer>="1" && vulnerable[wg]) {
				eval ("ghost" + wg + "src.src = eyes.src")
				vulnerable[wg] = false;
				onPath[wg] = true
				score += ghostscore
				ghostscore+=50
				scoreform.forms[0].elements[0].value = score
		      } 
		}
	}

	// Decrement the power pill timer, and change source of ghost images if powerpill nearly over.
	if (ppTimer >="1") {
		ppTimer=(ppTimer-1);
	}

	if (ppTimer == ghostBlinkLifetime) {
		for(i=0;i<4;i++){
			if (!onPath[i]) {
				if (vulnerable[i]) eval ("ghost" + i + "src.src = ghimg6.src")
			}
		}
	}

	// Return ghost to normal when powerpill wears off.
	if (ppTimer == "0" && powerpilon) {
		powerpilon=false
		ghostspeed=speed;
		movespeed=speed;
		for(i=0;i<4;i++){
			if (!onPath[i]) {
				eval ("ghost" + i + "src.src = ghimg" + i + ".src")
				onPath[i]=false
				vulnerable[i] = true
				ghostscore=50
			}
		}
	}

	// Check to see if a ghost has gone through the channel to the other side of the screen
	for (i=0;i<4;i++){
		ghostPos = mazedata[topG[i]][parseInt(leftG[i])];
		if (ghostPos && (ghostPos.charAt(2)=="O" || ghostPos.charAt(3)=="O")){
			if (leftG[i] <= 35 && ghostDir[i] =="L") {leftG[i] = 555; }
			if (leftG[i] >= 565 && ghostDir[i] =="R") {leftG[i] = 35; }
		}
	}

	//checkBasicVision()
	// Game timer on the screen.. 
	timeform.forms[0].elements[2].value--
	if (timeform.forms[0].elements[2].value==0){
		lives = (lives-1)
		score -= 50
		scoreform.forms[0].elements[0].value = score
		lifeform.forms[0].elements[1].value -= 1
		gameTime=5000
		timeform.forms[0].elements[2].value=gameTime
		alert ("OUT OF TIME! One life lost.")
		if (lives==0) {
			locStr = "intropage.html?score=" + score;
			alert ("All lives lost - Game Over!! Your score was " + score + " points"); sessionStorage.score = score; location=locStr; } else {
			reset()
		} 

	}

	// And finally, call the function again if the game isn't paused
	if (!onPause){ ghostsTimer = setTimeout("ghosts()",ghostspeed);}
}

/* Function: kd
 * Meta: keydown = invoked if key pressed. 
 *       if the game is paused and P has been pressed again to unpause, the unpause happens here by kicking off the game timers.
 *       for any other key logic is more complex and it is passed to keyLogic
*/
function kd(e){

	if (onPause){
		//onPause=0;
		if (pacTimer){ clearTimeout(pacTimer);}
		if (ghostsTimer){ clearTimeout(ghostsTimer);}
		if (gameTimer){ clearTimeout(gameTimer);}

		if (document.all && !document.getElementById){key = window.event.keyCode}
		if (document.getElementById){ key = e.keyCode}
		if (key == "80" || key == "112"){
			onPause=0;
			move(); ghosts();
		}

	} else {
		if (keycount>=2) {keycount=0; movekey="Q"; if (!moving) move()}
		if (document.all && !document.getElementById){key = window.event.keyCode}
		if (document.getElementById){ key = e.keyCode}
		keyLogic(key);
	}
}

// netscape version of above.
function kdns(evt){
	if (keycount>=2) {keycount=0; movekey="Q"; if (!moving) move()}
	key = evt.which
	//status = key
	keyLogic(key);
}
	
/*
 * Function: keyLogic
 * Meta: First works out which key it is, and translates it to a direction (or performs the pause or reset action). 
 *       Four flags are present here - key, newkey, lastkey & movekey.
 *		key - this contains the key that has just been pressed resulting in this funciton being called, which 
 * 		is immediately translated to upper case ASCII via it's ord value
 * 		movekey - this is the key which generated the current movement. The movement has the same upper case ASCII
 *  			  char value as the key pressed so it is easily compared.
 * 		newkey - If the key which has been pressed is a movement key but NOT the same direction as pacman is 
 * 			 currently heading, newkey is set to the incoming key, and keycount is incremented. This new key
 * 			 *will be* the next direction that pacman takes assuming the move is possible - it is stored for 
 * 			 if that occasion arises. 
 * 			 No action is taken if it is the same key as the current movement - ther eis no need.
 * 		lastkey - this is the last key to be used which changed the direction of pacman, and consequently indicates 
 *			  the direction in which he is currently traelling (which possibly makes this var redundant!
 *
 * 	 All of this data is picked up by the continually looping move function which contains inline explanations of what
 *	 is going on.
 *
 * 	 Some kind of explanation at deciphering my 17 year old logic follows:
 *       If the key that is pressed (key) is not the same as the previously pressed key (newkey - it *was* last time round!), 
 *       then that previously pressed key is stored in lastkey. This signifies that a new movement is waiting to happen when it can.
 * 	 Movekey is the current movement, and if it's not the same as the key just pressed (key) the value is stored in newkey, 
 * 	 and the move function is called if a flag 'moving' is false. move() itself is on a timer, but we don't wna to wait. 
 * 	 The keycount variable is also incremented. 
 * 	 Hmm no that didn't really help either did it..
*/
function keyLogic(key){

	// movement kreys (aznm or cursor keys)
	if (key=="65" || key=="97" || key == "38") {key="U"}
	if (key=="90" || key=="122" || key == "40") {key="D"}
	if (key=="78" || key=="110" || key == "37") {key="L"}
	if (key=="77" || key=="109" || key == "39") {key="R"}

	// game reset key (r)
	if (key=="82" || key=="114"){ top.location.reload();} // r = reset
	
	// game pause key (p)
	if (key=="80" || key=="112"){
			onPause=1; 
			if (pacTimer){ clearTimeout(pacTimer);}
			if (ghostsTimer){ clearTimeout(ghostsTimer);}
			if (gameTimer){ clearTimeout(gameTimer);}
		
	} else {
		if (movekey != key) {newkey = key; if (!moving) move(); keycount++}
	}

}

/* 
 * Function : ku
 * Meta: decreases keycount by one as a key goes up
*/
function ku(e){
	keycount--;
}

/*
 * Function: move
 * Meta: This is one of the two continually looping functions which make up the two game loops. 
 *       It accesses the newkey, lastkey and movekey variables from the keyLogic function, which it compares to 
 * 	 data of possible moves from the mazedata array where pacman currently resides.
*/
function move(){

	// 1. Look up the possible moves from the current position
	possibilities = mazedata[pacTop][pacLeft];
	u = possibilities.charAt(0)
	d = possibilities.charAt(1)
	l = possibilities.charAt(2)
	r = possibilities.charAt(3)

	// 2. If the latest key press has generated a character in the possible moves array, set 'engage', set the movekey var to this key, and also the lastkey var
	if (newkey==u || newkey==d || newkey ==l || newkey == r) {

		engage=true; movekey = newkey; lastkey = newkey // lastkey set to stop constant repetition of last 2 moves without the user touching anything.. see later on.

	} else {

		// 2.1 If previously pressed key generated a character that exists in the possible moves array then we can use that to continue in that direction
		if (lastkey==u || lastkey==d || lastkey==l || lastkey==r) {
			engage = true
			movekey = lastkey

		// 2.2 The latest and last key presses do not match a possible direction - therefore pacman stops. 'engage' and 'moving' set to false
		} else {
			engage = false
			moving = false
		}
	}

	// 3. Engage is now set if a move can be made. This is either off the new key the previously pressed key, it doesn't matter as we make that move.
	if (engage) {

		if (movekey==newkey) { // 4. This means the latest key press and not the previous one generated this move, so we update the icon to point the right way
			newClass = "pacman_" + newkey;
			document.getElementById("pacman").classList.remove("pacman_U");
			document.getElementById("pacman").classList.remove("pacman_D");
			document.getElementById("pacman").classList.remove("pacman_L");
			document.getElementById("pacman").classList.remove("pacman_R");
			document.getElementById("pacman").classList.add(newClass);
		}

		// 5. Move the sprite on screen to correspond to the direction
		if (movekey==u) {divPacman.top=(pacTop-10); pacTop=pacTop-10}
		if (movekey==d) {divPacman.top=(pacTop+10); pacTop=pacTop+10}
		if (movekey==l) {divPacman.left=(pacLeft-10);pacLeft=pacLeft-10}
		if (movekey==r) {divPacman.left=(pacLeft+10); pacLeft=pacLeft+10}


		//newleftamt = "left" + pacLeft
		//console.log("Top: " + pacTop + " Left: " + pacLeft);
		//console.log(mazedata);
		//console.log(mazedata[pacTop][pacLeft]);

		// 6. The var newLocationData is the data for the cell we've just moved into. We may need to process a pill being eaten..
		newLocationData = mazedata[pacTop][pacLeft];
		if (newLocationData.length>=5) { ifpil = newLocationData.charAt(4)} else {ifpil = 0}
		if (ifpil=="1" || ifpil=="2") {
			pb0 = newLocationData.charAt(0)
			pb1 = newLocationData.charAt(1)
			pb2 = newLocationData.charAt(2)
			pb3 = newLocationData.charAt(3)
			pb4 = "0"
			if (newLocationData.length==6) {
				pb5=newLocationData.charAt(5)
				putback = eval ("pb0+pb1+pb2+pb3+pb4+pb5")
				} else {
				putback = eval ("pb0+pb1+pb2+pb3+pb4")
				}
			//eval ("mazedata[pacTop]." + newleftamt + "= putback")
			mazedata[pacTop][pacLeft] = putback
			newLocationData = putback;
			if (ns) pilsrc = eval("document.p" + pacLeft + pacTop + ".document")
			eval("pilsrc.images.pil_" + pacLeft + pacTop + ".src = blank.src")

			if (ifpil==2){
				ppTimer = powerPillLifetime 
				ghostscore=50
				movespeed = speed-10;
				powerpilon = true
				for(i=0;i<4;i++){
					eval ("ghost" + i + "src.src=ghimg5.src")
					vulnerable[i]=true
				}
			}

			ifpil=0;
			pilcount++
			score += 10;
			scoreform.forms[0].elements[0].value = score
			if (pilcount>=pillNumber) {
				won = true
				onPath[0]=true; onPath[1]=true; onPath[2]=true;onPath[3]=true;
				document.getElementById("pacman").style.display="none";
				levelEnd();

			}
		}

		// Give extra lives at 5000 and 1000 points. As points may increment considerably on a single cell (although rare) 1000 points leeway for checking is left. 
		if (score>=5000 && score <6000 && sessionStorage.exlife1) {
			lives++; sessionStorage.lives = lives; scoreform.forms[0].elements[1].value = lives;
			sessionStorage.exlife1 = false;
		}
		if (score>=10000 && score <10500 && sessionStorage.exlife2) {
			lives++; sessionStorage.lives++; scoreform.forms[0].elements[1].value = lives;
			sessionStorage.exlife2=false
		} 

		// show a piece of fruit at certain times - based on incrementing score with a length in a decrementing var called fruitTimer
		if (score >= nextfruitscore && score <=nextfruitscore+300 && fruitArray[thisfruit]) {showFruit()}
		if (fruitTimer>0) fruitTimer--
		if (fruitTimer==1) {
			divFruit.visibility='hidden'; fruitOn=false
		}
		//status= parseInt(divFruit.left) + "-" + pacLeft + "--" + parseInt(divFruit.top) + "-" + pacTop

		if (pacLeft==parseInt(divFruit.left) && pacTop == parseInt(divFruit.top) && fruitOn) {
			score=score+250; scoreform.forms[0].elements[0].value=score
			fruitOn=false
			divFruit.visibility='hidden'
		}

		// For the tunnels off the side of the mazes, many need to update location of pacman 
		if (newLocationData.charAt(2)=="O" || newLocationData.charAt(3)=="O"){
			if (pacLeft==35){ pacLeft=555; divPacman.left=pacLeft; }
			if (pacLeft==575){ pacLeft=55; divPacman.left=pacLeft; }
		}

		moving = true
		if (!won && !onPause){
			pacTimer = setTimeout("move()",movespeed)
		}
	}
}

/*
 * Function: showFruit
 * Meta: displays a piece of fruit to the screen, sets fruitOn flag and sets up the criterea for the next one appearing
*/
function showFruit() {
	nextfruitscore+=600
	thisfruit++
	fruitArray[thisfruit]=true
	whichFruit = Math.round(Math.random() *1)
	fruitTimer=fruitLifetime
	if (!fruitOn) eval ("fruitsrc.src=berry" + whichFruit + ".src")
	fruitOn=true
	divFruit.visibility='visible'
}


/*
 * Function: generateGhostDir
 * Meta: Generates a new direction for a particular ghost 
*/
function generateGhostDir(who,howMany,possibilities){

		if (powerpilon){
			mode="random";
		} else if (onPath[who]){
			mode="homing";
		} else {
			currentTime = timeform.forms[0].elements[2].value;
			if (currentTime < resetModeTime-scatterTime){ 
				mode="chase";
			} else {
				mode="scatter";
			}
		}

		dice=Math.round(Math.random() * 6);

		if (mode=="scatter" && dice < 7){

			if (!onPath[who]){
				     if (who==0){ headLeft = 535; headUp=435;} // red
				else if (who==1){ headLeft = 35; headUp=35;} // blue
				else if (who==2){ headLeft = 535; headUp=35;} // pink
				else if (who==3){ headLeft = 35; headUp=435;} // orange
				ghostDir[who] = headFor(who,Array(headLeft,headUp));
			}

		} else if (mode=="chase" && dice < 7){

			if (!onPath[who]){
				headLeft = parseInt(divPacman.left);
				headUp= parseInt(divPacman.top);
				ghostDir[who] = headFor(who,Array(headLeft,headUp));
			}

		} else if (mode=="homing"){

			ghostDir[who] = headFor(who,ghostHomeBase);

		} else { // random

				possibilities=possibilities.replace(/X/g,"");
				if (mazedata[topG[who]][leftG[who]] == "3" && !onPath(who)){// ghosts can only re-enter the home base when on a path to regenerate 
					possibilities=possibilities.replace(/5/g,"");
				}
				if (howMany>2){
					possibilities=excludeOppositeDirection(who,possibilities);
					howMany--;
				}
				if (!onPath[who]) {
					direction = eval("Math.round(Math.random() *" + howMany + ")");
					ghostDir[who] = possibilities.charAt(direction);
				} else {
					ghostDir[who] = headFor(who,ghostHomeBase);
				}

		}
}

/* Function excludeOppositeDirection
 * Meta: Removes the opposite direction from the list of possible moves - no point in going back where we've just come fron - keeps them moving around 
*/
function excludeOppositeDirection(who,possibilities){
	if (ghostDir[who]=="R"){
		possibilities=possibilities.replace(/L/,"");
	}
	if (ghostDir[who]=="L"){
		possibilities=possibilities.replace(/R/,"");
	}
	if (ghostDir[who]=="D"){
		possibilities=possibilities.replace(/U/,"");
	}
	if (ghostDir[who]=="U"){
		possibilities=possibilities.replace(/D/,"");
	}
	return possibilities;
}

/* DEPRECATED - use headFOR instead with the home co-ordinates as the second param */
function getPathToHome(who){
	currentCell = mazedata[parseInt([topG[who]])][parseInt(leftG[who])]
	console.log(currentCell);
	home=null;

	if (leftG[who] > ghostHomeBase[0] && currentCell.charAt(2)=="L" && ghostDir[who] != "R" && ghostDir[who] != null){
		home = "L";
		console.log("Going" + home);	
	} else if (leftG[who] <= ghostHomeBase[0] && currentCell.charAt(3)=="R" && ghostDir[who] != "L" && ghostDir[who] != null){
		home = "R";
		console.log("Going" + home);	
	}

	if (topG[who] > ghostHomeBase[1] && currentCell.charAt(0)=="U" && ghostDir[who] != "D" && ghostDir[who] != null){
		home="U";
		console.log("Going" + home);	
	} else if (topG[who] <= ghostHomeBase[1] && currentCell.charAt(1)=="D" && ghostDir[who] != "U" && ghostDir[who] != null){
		home="D";
		console.log("Going" + home);	
	}

	console.log(ghostDir[who],topG[who],leftG[who],ghostHomeBase[0],ghostHomeBase[1],currentCell.charAt[0],currentCell.charAt[1],currentCell.charAt[2],currentCell.charAt[3],home);
	if (!home) { home = ghostDir[who];}
	return home;
}

/* 
 * Function: headFor
 * Param who (string) - index of which ghost we are sending somewhere
 * Param where (array) - 2 item aray of L and R co-ordinates of the cell we are sending the ghost toi
 * Return home (string) - the direction that can be direcly set for that ghost
*/
function headFor(who,where){
	currentCell = mazedata[parseInt([topG[who]])][parseInt(leftG[who])]
	if (!currentCell){
		alert ("NO CURRENT CELL!");
	}
	//console.log(currentCell);
	home=null;

	if (leftG[who] > where[0] && currentCell.charAt(2)=="L" && ghostDir[who] != "R" && ghostDir[who] != null){
		home = "L";
		//console.log("Going" + home);	
	} else if (leftG[who] <= where[0] && currentCell.charAt(3)=="R" && ghostDir[who] != "L" && ghostDir[who] != null){
		home = "R";
		//console.log("Going" + home);	
	}

	if (topG[who] > where[1] && currentCell.charAt(0)=="U" && ghostDir[who] != "D" && ghostDir[who] != null){
		home="U";
		//console.log("Going" + home);	
	} else if (topG[who] <= where[1] && currentCell.charAt(1)=="D" && ghostDir[who] != "U" && ghostDir[who] != null){
		home="D";
		//console.log("Going" + home);	
	}
	if (currentCell.charAt(4)=="3"){ home="U";} // for when ghosts are in the pound
	

	//console.log(ghostDir[who],topG[who],leftG[who],ghostHomeBase[0],ghostHomeBase[1],currentCell.charAt[0],currentCell.charAt[1],currentCell.charAt[2],currentCell.charAt[3],home);
	if (!home) { 
		
		possibilities=currentCell.substr(0,4).replace(/X/g,"");

		if (possibilities.length==2){
			if (ghostDir[who]=="R" || ghostDir[who]=="L"){
			console.log("LEFT OR RIGHT",currentCell);
				if (currentCell.charAt(0)=="U"){ 
					home = "U";
				 } else if (currentCell.charAt(1)=="D"){
					home = "D";
				} else if (currentCell.charAt(2)=="L"){
					home = "L";
				} else {
					home = "R";
				}
			} else  if (ghostDir[who]=="D" || ghostDir[who]=="U"){
				console.log("UP POR DOWN");
				if (currentCell.charAt(2)=="L"){ 
					home = "L";
				 } else if (currentCell.charAt(3)=="R"){
					home = "R";
				 } else if (currentCell.charAt(0)=="U"){
					home = "U";
				} else {
					home="D";
				}
			} 
		}
	}

	if (!home) {
			istr = "nowhere to go for " + who + " heading " + ghostDir[who] + " in mode of " + mode;
			istr = istr + " to " + where[0] + "," + where[1];
			istr = istr + " from " 
			istr = istr + leftG[who] + "," + topG[who] + ""; 
			console.log(istr);
			home = ghostDir[who];
	}
	return home;
}



/*
 * Function: getBasicVisionDir
 * Meta: Get a direction based on the basic vision feature, used in the checkBasicVision function
 * NB: The lack of checking whether or not the direction can be made is actually what slows down the ghosts when a pill is on and they are in your line of sight
 * Although not programatically brilliant, it worked for the game in an 'off label' kind of way, so it got left. 
*/
function getBasicVisionDir(who,not){
	ghostDir[wg] = Math.round(Math.random() *3)
	if (ghostDir[wg] == "0") {ghostDir[wg] = "U"}
	if (ghostDir[wg] == "1") {ghostDir[wg] = "D"}
	if (ghostDir[wg] == "2") {ghostDir[wg] = "L"}
	if (ghostDir[wg] == "3") {ghostDir[wg] = "R"}
	if (ghostDir[wg] == not) {getBasicVisionDir(wg,not)}
}

/*
 * Function: reset
 * Meta: Resets all positions, image sources and directions if a life is lost
*/
function reset(){

	if (pacTimer){ clearTimeout(pacTimer);}
	if (ghostsTimer){ clearTimeout(ghostsTimer);}
	if (gameTimer){ clearTimeout(gameTimer);}

	divPacman.top=pacStartTop
	divPacman.left=pacStartLeft

	document.getElementById("pacman").style.display="block";
	document.getElementById("pacman").classList.remove("pacman_U");
	document.getElementById("pacman").classList.remove("pacman_D");
	document.getElementById("pacman").classList.remove("pacman_L");
	document.getElementById("pacman").classList.add("pacman_R");

	won=false;
	pacLeft = parseInt(divPacman.left)
	pacTop = parseInt(divPacman.top)

	for (i=0;i<4;i++){
		eval ("divGhost" + i + ".top=ghostStartTop")
		eval ("divGhost" + i + ".left=ghostStartLeft")
		leftG[i] = eval ("parseInt(divGhost" + i + ".left)")
		topG[i] = eval ("parseInt(divGhost" + i + ".top)")
		vulnerable[i] = true
		eval ("ghost" + i + "src.src=ghimg" + i + ".src")
		ghostDir[i]="U"
	}
	newkey = "R"
	ppTimer="0"
	ghostscore=50
}

/* 
 * Function : checkBasicVision (previously called 'intelligence') 
 * Meta: Gives the ghosts a bit of thinking power. If there's a clear line between them and you, 
 *      this function will change their direction to move towards you, unless a powerpill is 
 *      active on them, in which case they go in any direction that is not towards you.  
*/
function checkBasicVision(g){
	//status=(wg + "-" + wg + "--" + pacTop)
	if (leftG[wg] == pacLeft) {// if left is equal
		if (topG[wg] < pacTop) {// ghost < pac
			changedir=true
			for (v=topG[wg];v<pacTop;v=(v+10)){
				//newdatabit = eval ("mazedata[" + v + "].left" + pacLeft)
				newdatabit = mazedata[v][pacLeft];
				//console.log(v,pacLeft);
				//console.log(mazedata[v][pacLeft]);
				//console.log(newdatabit);
				//console.log(mazedata);
				if (!newdatabit || newdatabit.charAt(1) != "D") changedir=false
			}//for j
			if (changedir && ppTimer =="0"){ ghostDir[wg] = "D"} else if (changedir && ppTimer >="1" && vulnerable[wg]) {getBasicVisionDir(wg,"D")} else if (changedir && ppTimer >="1" && !vulnerable[wg]) { ghostDir[wg] = "D"}
		} else {
			if (topG[wg] > pacTop) {// ghost > pac
				changedir=true
				for (v=pacTop;v<topG[wg];v=(v+10)){
				//newdatabit = eval ("mazedata[" + v + "].left" + pacLeft)
				newdatabit = mazedata[v][pacLeft]
				if (newdatabit && newdatabit.charAt(0) != "U") changedir=false
				}//for j
				if (changedir && ppTimer == "0"){ ghostDir[wg] = "U"} else if (changedir && ppTimer >="1" && vulnerable[wg]) {getBasicVisionDir(wg,"U")} else if (changedir && ppTimer >="1" && !vulnerable[wg]) { ghostDir[wg] = "U"}
			}//if topG gtr than pacTop
		}//if topG less than pacTop
	}// if eq left

	if (topG[wg] == pacTop) {// if vertical is equal
		if (leftG[wg] < pacLeft) {// if ghost < pac
			changedir=true
			for (v=leftG[wg];v<pacLeft;v=(v+10)){
				//newdatabit = eval ("mazedata[pacTop].left" + v)
				newdatabit = mazedata[pacTop][v]
				if (newdatabit && newdatabit.charAt(3) != "R") changedir=false
			}//for j
			if (changedir && ppTimer == "0"){ ghostDir[wg] = "R" } else if (changedir && ppTimer >="1" && vulnerable[wg]) {getBasicVisionDir(wg,"R")} else if (changedir && ppTimer >="1" && !vulnerable[wg]) { ghostDir[wg] = "R"; }
		} else {
			if (leftG[wg] > pacLeft) {// if ghost > pac
			changedir=true
			for (v=pacLeft;v<leftG[wg];v=(v+10)){
				//newdatabit = eval ("mazedata[pacTop].left" + v)
				newdatabit = mazedata[pacTop][v];
				if (newdatabit && newdatabit.charAt(2) != "L") changedir=false
			}//for j
			if (changedir && ppTimer == "0"){ ghostDir[wg] = "L" } else if (changedir && ppTimer >="1" && vulnerable[wg]) {getBasicVisionDir(wg,"L")} else if (changedir && ppTimer >="1" && !vulnerable[wg]) { ghostDir[wg] = "L" }
			}

		}// if eq top
	}// for i

	//status bar for de-buging
	//status = pacLeft + "-" + pacTop + ":" + ifpil + "~~~" + pilcount + "^^^^" + topG[0] + "-" + topG[1] + "-" + topG[2] + "-" + topG[3] + ":::" + newdatabit.length + "****" + keycount
}

/*
 * Function: levelEnd
 * Meta: Flash maze at end of level, and call the loadLevel function to load up the next level.
*/
function levelEnd(){

	pilcount=0;

	if (mazeNo==2) mazeNo=0
	mazeCells = document.getElementsByClassName("wallCell");
	wallCells = document.getElementsByClassName("mazeCell");
	if (mazeNo==0){
		for(var i = 0; i < mazeCells.length; i++) {
		    mazeCells[i].style.borderColor = 'white';
		    wallCells[i].style.borderColor = 'white';
		}
		document.getElementById("mazeinner").style.borderColor="white";
	} else {
		for(var i = 0; i < mazeCells.length; i++) {
		    mazeCells[i].style.borderColor = 'blue';
		    wallCells[i].style.borderColor = 'blue';
		}
		document.getElementById("mazeinner").style.borderColor="blue";
	}
	mazeNo++
	mazecount++
	if (mazecount<12) {
		mazeFlashTimer=setTimeout ("levelEnd()",300)
	} else {
		sessionStorage.score=score
		sessionStorage.lives = lives
		sessionStorage.level++
		mazecount=0;
		if (sessionStorage.level==10){
			sessionStorage.level=1
			if (sessionStorage.speed>=5){sessionStorage.speed=sessionStorage.speed-5;}
		}
		loadLevel(sessionStorage.level);
	}
}

/* 
 * Function: dynLoader
 * Meta: for dynamically loading another javascript and following up with a callback
*/
function dynLoader(url, callback){
    // Adding the script tag to the head
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;

    // Then bind the event to the callback function.
    // There are several events for cross browser compatibility.
    script.onreadystatechange = callback;
    script.onload = callback;

    // Fire the loading
    head.appendChild(script);
}

/* 
 * Lambda function: startNewLevel
 * Called as: Callback
 * Meta: Renders the new maze, resets the timer, resets the sprite positions and calls start (to show the next level message and kick off the timers) 
*/
var startNewLevel = function (){
	mazedata = renderGrid();
	onPause=1;
	timeform.forms[0].elements[2].value=gameTime
	reset();
	start();
}

/* Lambda function: renderNewData
 * Called as: Callback
 * Meta: Loads maze.js after the mazedata file has been loaded, and issues a callback to startNewLevel 
*/
var renderNewData = function() {
	dynLoader("js/maze.js",startNewLevel);
}

/*
 * Function: loadLevel
 * Param: level (int) - the number of the level being loaded
 * Meta: Loads the mazedata file from the server, and calls renderNewData as a callback
*/
function loadLevel(level){
	//eval ("location='pacman_" + sessionStorage.level + ".html'")
	moving = false;
	dataFile = "js/data/mazedata" + level + ".js";
	dynLoader(dataFile,renderNewData);
}

/*
 * Function: start
 * Meta: At the start of each level, display the message and kick off the game timers
*/
function start(){
	onPause=0;
	document.getElementById("levelIndicator").innerHTML = "Level " + sessionStorage.level;
	divStart.visibility="visible";
	gameTimer = setTimeout('divStart.visibility=\'hidden\'; move(); ghosts();',messageLifetime) 
}

/* Below is simply thiknking about proper OO version and not currently used*/

var ghosts_names = new Array("Blinky","Pinky","Inky","Clyde");
var all_ghosts = new Array();
var total_ghosts;

// pacman object constructor
var make_pacman = function(){
	this.left=305;
	this.top=265;
	this.direction = "R";
	this.lives = sessionStorage.lives;
	this.speed = sessionStorage.speed;
}

// ghost constructor
var ghost = function(name){
	this.name = name;
	// src - the source image can be named after the name
	this.left=305;
	this.top = 195;
	this.alive=1; // gets rid of the onPath global
	this.mode="scatter"; // mode (chase, scatter, frightened)
	this.leftBase=0;
	this.direction = "U";
	this.speed = sessionStorage.speed;
	console.log(this.name);
}

// make four ghosts to start
function makeGhosts(){
	for (i=0;i<ghosts_names.length;i++){
		all_ghosts[i] = new ghost(ghosts_names[i]);	
	}
	total_ghosts = ghosts_names.length;
}

function oo_start(){
	var pacman = new make_pacman();
	make_ghosts();
}

