// Look for the text HACK2016 in the code - this means I changed something without fully understanding the implications (it's old code)
// Specifically - checking that possG[wg] exists before trying to read a charAt. I *think* it is because the maze data isn't populated with zeros and the ghost path information isn't in the maze data, so this hack should be removed when the data set is completed.


// pacman.js
// by Matt Platts, 1999-2000. Updated for Netscape 6, June 2001. Tweaks for Google Chrome and Firefox around 2006. Updated 2016. 


// initial settings. these should be increased at around 10000 points?
var powerPillLifetime=340; // how many iterations the powerpill lasts for - hard is 120
var ghostBlinkLifetime=25; // how long the ghosts blink for within the power pill. Hard is 15.
var fruitLifetime=95; // how many iterations a piece of fruit stays on screen - hard is 80
var messageLifetime=1500; // millisecons for the duration of a message (life lost, get ready etc)

var pacTimer;
var ghostsTimer;

if (!top.score){ 
	top.score = new Object;
	top.score.level=1;
	top.score.mode="css";
	top.score.speed=40;
	top.score.lives=3;
	top.score.gameTime=2000;
	top.score.exlife1 = true;
	top.score.exlife2 = true;
	var offScreen="1";
	var speed=25;
 } 


if (document.all){top.main.document.focus();}

// set main variables / images
var mazecount=0
var mazeNo=0
ghimg0 = new Image
ghimg0.src = 'graphics/ghost1.gif'
ghimg1 = new Image
ghimg1.src = 'graphics/ghost2.gif'
ghimg2 = new Image
ghimg2.src = 'graphics/ghost3.gif'
ghimg3 = new Image
ghimg3.src = 'graphics/ghost4.gif'
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
var lives = top.score.lives
var score = top.score.score
var moving = false
var newkey = "R" // key just pressed
var lastkey = "D" // key previously pressed
var movekey = "D" // active key
var engage2 = false
var fruitOn=false
var fruitTimer=0
if (top.score){ var speed=top.score.speed } else { var speed=40;}
if (top.score){ var gameTime=top.score.gameTime; } else { gameTime=5000;}
if (top.score){ var level = top.score.level; } else { level=1;}

// start positions for levels 1,3,4,5
var pacStartTop=265
var pacStartLeft=305
var ghostStartTop=195
var ghostStartLeft=305

if (top.score && top.score.level==2) {
	pacStartTop=265
	pacStartLeft=305
	ghostStartTop=195
	ghostStartLeft=305
}
var ghostscore=50
var nextfruitscore=score+600
var thisfruit=0
var fruitArray = new Array(true,true)
if (top.score){
	if (top.score.level==1) offScreen=1
	if (top.score.level==2 || top.score.level==5) offScreen=2
	if (top.score.level==3 || top.score.level==4) offScreen=3
} else {
	offScreen=1;
}
/* Function: init
 * Meta: init() is called from onload, init() defines arrays for later use, then calls the ghosts() function and the move() funcion for the first time, to set them off. These functions then repeatedly call themselves on a timeout command (nb: move is also called from keydown events - we don't want to wait!).
*/
function init(){

	if (document.all){top.main.document.focus();}
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

	if (top.score){
		if (top.score.level>1){
			scoreform.forms[0].elements[0].value = top.score.score
			lifeform.forms[0].elements[1].value = top.score.lives
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

function ghosts(){

	//possG is the possible moves for each ghost, based on its co-ordinates of the mazedata array 
	for (wg=0;wg<4;wg++){
		//possG[wg] = eval ("mazedata[topG[" + wg + "]].left" + parseInt(leftG[wg]))
		possG[wg] = mazedata[topG[wg]][parseInt(leftG[wg])];

		//check possibile moves. The ghostData array contains info on which moves are possible. If more than 3 directions are present, or only 1 (ie backwards, so dead end) - a new direction must be generated...
		ghostCount=0 // counters for each ghost
		for (n=0;n<4;n++){
		ghostData[n]=0
		if (possG[wg] && possG[wg].charAt(n) != "X") { // HACK2016
			ghostData[n] = "8"
			ghostCount++;
		} else {
			ghostData[n] = n}
		}

		if (ghostCount>2 || ghostCount==1) getGhostDir(wg,ghostCount,possG[wg])

		//if there's 2 directions only, the '8' added above is used to ascertain if they are opposite directions (eg Left & Right) or not. If they're opposite, obviously the previous direction will apply. If they're at right angles (No cases of 2 8's next to each other) a new direction must be generated.
		firstPair = false; secPair = false
		if (ghostCount==2) {
			if (ghostData[0] == ghostData[1]) firstPair = true
			if (ghostData[2] == ghostData[3]) secPair = true
			if (!firstPair && !secPair) getGhostDir(wg,ghostCount,possG[wg])
		  }
		//compare ghost positions to your position & if it can see you, adjust direction.
		if (!onPath[wg]) { intelligence(wg) }

		//for each ghost, if ghostDir (current direction) is in the possG array (the move is possible) then a flag to engage the ghost (engGhost) is set to true. Otherwise (move not possible) engGhost (engage ghost) is set to false. Thus, the ghost is only engaged if it can make the move. NB: Ghost is also engaged if onPath is true, as it knows where it's going (onPath means the ghost has been eaten and is on a path to the base.. - this path is coded into the mazedata array)

		//status = (wg + "--" + possG[wg]) //status bar for error checking
		if (!possG[wg]){ possG[wg]="0";} // HACK2016
		if (ghostDir[wg] == possG[wg].charAt(0) || ghostDir[wg] == possG[wg].charAt(1) || ghostDir[wg] == possG[wg].charAt(2) || ghostDir[wg] == possG[wg].charAt(3) || onPath[wg]) engGhost[wg] = true; else engGhost[wg] = false

		// if onPath is true for the particular ghost, and there's a path direction present in the array, change the ghost's direction to follow the path home...
		// 2016 - think this is defunct now as path is calculated as part of getting the ghosts movement.
		if (onPath[wg] && possG[wg].length=='6') {
			ghostDir[wg] = possG[wg].charAt(5)
			//alert("Ghost" + i + " told to go " + ghostDir[i])
		} else if (onPath[wg]){
			console.log("ON A PATH");
		
		}

		//status bar stuff for checking variables..
		//status = possG[0] + ":" + possG[1] + ":" + possG[2] + ":" + possG[3] + "-- " + ghostDir[0] + " " + ghostDir[1] + " " + ghostDir[2] + " " + ghostDir[3] + "**** " + secondGhost[1] + "^^" + engGhost[0] + engGhost[1] + engGhost[2] + engGhost[3]

		// we store ghost positions so can be compared to positions next time round. If same, generate new direction. This is to over-ride when they stick if they're following you and you move out of the way, as there's nothing else to tell them to generate a new direction.
		if (preGtop[wg] == topG[wg] && preGleft[wg] == leftG[wg]) getGhostDir(wg,ghostCount,possG[wg])
		preGtop[wg] = topG[wg]
		preGleft[wg] = leftG[wg]
		

		//if the ghost is engaged, update position variable, and then position
		if (engGhost[wg] || onPath[wg]) {
			if (ghostDir[wg] == "U") {topG[wg] = (topG[wg]-10); eval ("divGhost" + wg + ".top = topG[wg]")}
			if (ghostDir[wg] == "D") {topG[wg] = (topG[wg]+10); eval ("divGhost" + wg + ".top = topG[wg]")}
			if (ghostDir[wg] == "L") {leftG[wg] = (leftG[wg]-10); eval ("divGhost" + wg + ".left = leftG[wg]")}
			if (ghostDir[wg] == "R") {leftG[wg] = (leftG[wg]+10); eval ("divGhost" + wg + ".left = leftG[wg]")}
		}

		// for the path stuff... if it goes off the maze (er.. this means there is an error somehow int the mazedata array!), then immediately return to home.
		if (onPath[wg]) {
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
			if (!won){onPath[wg] = false;}
			vulnerable[wg] = false;
			eval ("ghost" + wg + "src.src=ghimg" + wg + ".src")
			ghostDir[wg] = "U"
			}
		}

		//Checks to see if pacman has hit a ghost. If so, either return the ghost to start, or lose a life, depending whether a powerpill is currently active. Also updates score and lives
		if (pacLeft > leftG[wg]-20 && pacLeft < leftG[wg]+20 && pacTop > topG[wg]-20 && pacTop< topG[wg]+20) {

			//if no Powerpill and game not won and ghost not on path, you've lost a life
			//or pill is on but ghost is not vulnerable then same
			if ((ppTimer=="0" && !won && !onPath[wg]) || (ppTimer>="1" && !vulnerable[wg] && !onPath[wg])) {
				lives = (lives-1)
				score -= 50
				scoreform.forms[0].elements[0].value = score
				lifeform.forms[0].elements[1].value -= 1
				divMessage.visibility='visible'
				onPause=1;
				setTimeout('divMessage.visibility=\'hidden\'; onPause=0; pacTimer = setTimeout("move()",speed); ghostsTimer = setTimeout("ghosts()",speed)',messageLifetime);
					
				 if (lives==0) {
					 divMessEnd.visibility='visible'
					 onPause=1;
					 setTimeout('divMessEnd.visibility=\'hidden\'; won=true; top.score.score=score; location="afterplay.html"',messageLifetime);
				} else {
					reset()
				} 
				//if powerpill is on and ghost is vulnerable, turns ghost to eyes, sets first possible direction, and makes path true
			} else if (ppTimer>="1" && vulnerable[wg]) {
				eval ("ghost" + wg + "src.src = eyes.src")
				vulnerable[wg] = false
				if (possG[wg].charAt(0)=='U') {
					ghostDir[wg]='U'
				} else {
					if (possG[wg].charAt(2)=='L') {
						ghostDir[wg]='L'
					} else {
						if (possG[wg].charAt(3)=='R') {
							ghostDir[wg]='R'
						} else {
							if (possG[wg].charAt(1)=='D') {
								ghostDir[wg]='D'
							}
						}
					}
				}
				onPath[wg] = true
				score += ghostscore
				ghostscore+=50
				scoreform.forms[0].elements[0].value = score
		      } 
		}
	}

	//change source of ghost images if powerpill nearly over.
	if (ppTimer >="1") ppTimer=(ppTimer-1)
	if (ppTimer == ghostBlinkLifetime) {
		for(i=0;i<4;i++){
			if (!onPath[i]) {
				if (vulnerable[i]) eval ("ghost" + i + "src.src = ghimg6.src")
			}
			}
	}

	//return ghost images to normal when powerpill wears off.
	if (ppTimer == "0" && powerpilon) {powerpilon=false
	for(i=0;i<4;i++){
		if (!onPath[i]) {
			eval ("ghost" + i + "src.src = ghimg" + i + ".src")
			onPath[i]=false
			vulnerable[i] = true
			ghostscore=50
		}
	}
	}

	// check to see if a ghost has gone through the channel to the other side of the screen
	for (i=0;i<4;i++){
		ghostPos = mazedata[topG[i]][parseInt(leftG[i])];
		if (ghostPos && (ghostPos.charAt(2)=="O" || ghostPos.charAt(3)=="O")){
			if (leftG[i] <= 35 && ghostDir[i] =="L") {leftG[i] = 555; }
			if (leftG[i] >= 565 && ghostDir[i] =="R") {leftG[i] = 35; }
		}
	}

	//intelligence()
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
			alert ("All lives lost - Game Over!! Your score was " + score + " points"); top.score.score = score; location="afterplay.html"} else {
			reset()
		} 

	}
	if (!onPause){ ghostsTimer = setTimeout("ghosts()",speed) }
}

// keydown = invoked if key pressed. First works out which key it is, and translates it to a direction. Four flags are present here - key, newkey, lastkey & movekey. If the key that is pressed (key) is not the same as the previously pressed key (newkey - it was last time round!), then the previously pressed key is stored in lastkey. Movekey is the current movement, and if it's not the same as the key just pressed (key) the value is stored in newkey, and the move function is called if a flag 'moving' is false. This will all make sense later - honest!
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
		//gameTimer = setTimeout('divStart.visibility=\'hidden\'; move(); ghosts();',speed) 
		//if (!ghostsTimer){ ghostsTimer = setTimeout("ghosts()",speed); }
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
	

function keyLogic(key){

	// movement kreys (aznm or cursor keys)
	if (key=="65" || key=="97" || key == "38") {key="U"}
	if (key=="90" || key=="122" || key == "40") {key="D"}
	if (key=="78" || key=="110" || key == "37") {key="L"}
	if (key=="77" || key=="109" || key == "39") {key="R"}

	// game reste key (r)
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

	newClass = "pacman_" + key;
	document.getElementById("pacman").classList.remove("pacman_U");
	document.getElementById("pacman").classList.remove("pacman_D");
	document.getElementById("pacman").classList.remove("pacman_L");
	document.getElementById("pacman").classList.remove("pacman_R");
	document.getElementById("pacman").classList.add(newClass);

}

/* Function : ku
 * Meta: decreases keycount by one as a key goes up
*/
function ku(e){
	keycount--;
}

//function controls movement of pacman
function move(){

	possibilities = mazedata[pacTop][pacLeft];
	u = possibilities.charAt(0)
	d = possibilities.charAt(1)
	l = possibilities.charAt(2)
	r = possibilities.charAt(3)

	if (newkey==u || newkey==d || newkey ==l || newkey == r) {

		engage=true; movekey = newkey; lastkey = newkey // lastkey set to stop constant repetition of last 2 moves without the user touching anything.. see later on.

	} else {

		if (lastkey==u || lastkey==d || lastkey==l || lastkey==r) {
			engage = true
			movekey = lastkey

			newClass = "pacman_" + newkey;
			document.getElementById("pacman").classList.remove("pacman_U");
			document.getElementById("pacman").classList.remove("pacman_D");
			document.getElementById("pacman").classList.remove("pacman_L");
			document.getElementById("pacman").classList.remove("pacman_R");
			document.getElementById("pacman").classList.add(newClass);
		} else {
			engage = false
			moving = false
		}
	}
	//status = possibilities + "," + pacTop + "-" + pacLeft + "," + u + d + l + r + "- " + engage

	if (engage) {


		if (movekey==u) {divPacman.top=(pacTop-10); pacTop=pacTop-10}
		if (movekey==d) {divPacman.top=(pacTop+10); pacTop=pacTop+10}
		if (movekey==l) {divPacman.left=(pacLeft-10);pacLeft=pacLeft-10}
		if (movekey==r) {divPacman.left=(pacLeft+10); pacLeft=pacLeft+10}


		//newleftamt = "left" + pacLeft
		//console.log("Top: " + pacTop + " Left: " + pacLeft);
		//console.log(mazedata);
		//console.log(mazedata[pacTop][pacLeft]);
		getnew = mazedata[pacTop][pacLeft];
		if (getnew.length>=5) { ifpil = getnew.charAt(4)} else {ifpil = 0}
		if (ifpil=="1" || ifpil=="2") {
			pb0 = getnew.charAt(0)
			pb1 = getnew.charAt(1)
			pb2 = getnew.charAt(2)
			pb3 = getnew.charAt(3)
			pb4 = "0"
			if (getnew.length==6) {
				pb5=getnew.charAt(5)
				putback = eval ("pb0+pb1+pb2+pb3+pb4+pb5")
				} else {
				putback = eval ("pb0+pb1+pb2+pb3+pb4")
				}
			//eval ("mazedata[pacTop]." + newleftamt + "= putback")
			mazedata[pacTop][pacLeft] = putback
			getnew = putback;
			if (ns) pilsrc = eval("document.p" + pacLeft + pacTop + ".document")
			eval("pilsrc.images.pil_" + pacLeft + pacTop + ".src = blank.src")
			if (ifpil==2){
				for(i=0;i<4;i++){
					eval ("ghost" + i + "src.src=ghimg5.src")
					ppTimer = powerPillLifetime 
					powerpilon = true
					vulnerable[i]=true
					ghostscore=50
				}
			}
			ifpil=0; pilcount++
			score += (10)
			scoreform.forms[0].elements[0].value = score
			if (pilcount>=pillNumber) {
				won = true
				onPath[0]=true; onPath[1]=true; onPath[2]=true;onPath[3]=true;
				document.getElementById("pacman").style.display="none";
				gameEnd();

			}
		}

		if (score>=5000 && score <5500 && top.score.exlife1) {
			lives++; top.score.lives++; scoreform.forms[0].elements[1].value = lives
			top.score.exlife1=false
		}

		if (score>=10000 && score <10500 && top.score.exlife2) {
			lives++; top.score.lives++; scoreform.forms[0].elements[1].value = lives
			top.score.exlife2=false
		} 

		//fruit stuff
		if (score>=nextfruitscore && score <=nextfruitscore+300 && fruitArray[thisfruit]) {showFruit()}
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

		// offside bit - if you go off the screen it puts you to the opposite side.
		if (getnew.charAt(2)=="O" || getnew.charAt(3)=="O"){
			if (pacLeft==35){ pacLeft=555; divPacman.left=pacLeft; }
			if (pacLeft==575){ pacLeft=55; divPacman.left=pacLeft; }
		}

		moving = true
		if (!won && !onPause){
			pacTimer = setTimeout("move()",speed)
		}
	}
}

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

//generates a random direction for a particular ghost when there's a branch in the maze.
function getGhostDir(who,howMany,possibilities){

		dice=Math.round(Math.random() * 6);

		if (!onPath[who] && dice <2){
			pacLeft = parseInt(divPacman.left)
			pacTop = parseInt(divPacman.top)
			ghostDir[who] = headFor(who,Array(pacLeft,pacTop));
			
		} else {

			possibilities=possibilities.replace(/X/g,"");
			if (mazedata[topG[who]][leftG[who]] == "3" && !onPath(who)){// ghosts can only re-enter the home base when on a path to regenerate 
				possibilities=possibilities.replace(/5/g,"");
			}
			if (howMany>1){
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

/* removes the opposite direction from the list of possible moves - no point in going back where we've just come fron - keeps them moving */
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

	//console.log(ghostDir[who],topG[who],leftG[who],ghostHomeBase[0],ghostHomeBase[1],currentCell.charAt[0],currentCell.charAt[1],currentCell.charAt[2],currentCell.charAt[3],home);
	if (!home) { home = ghostDir[who];}
	return home;
}



// generates a random direction for a ghost, but not towards pacman (used for when a powerpill is active).
// NB: The lack of checking whether or not the direction can be made is actually what slows down the ghosts when a pill is on and they are in your line of sight
// Although not programatically brilliant, it worked for the game in an 'off label' kind of way, so it got left. 
function getTrueDir(who,not){
	ghostDir[wg] = Math.round(Math.random() *3)
	if (ghostDir[wg] == "0") {ghostDir[wg] = "U"}
	if (ghostDir[wg] == "1") {ghostDir[wg] = "D"}
	if (ghostDir[wg] == "2") {ghostDir[wg] = "L"}
	if (ghostDir[wg] == "3") {ghostDir[wg] = "R"}
	if (ghostDir[wg] == not) {getTrueDir(wg,not)}
}

//resets all positions, image sources and directions if a life is lost
function reset(){
	divPacman.top=pacStartTop
	divPacman.left=pacStartLeft
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
  Function : intelligence 
  Meta: Gives the ghosts a bit of thinking power. If there's a clear line between them and you, this function will change their direction to move towards you, unless a powerpill is active on them, in which case they go in any direction that is not towards you.  
*/

function intelligence(g){
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
	if (changedir && ppTimer =="0"){ ghostDir[wg] = "D"} else if (changedir && ppTimer >="1" && vulnerable[wg]) {getTrueDir(wg,"D")} else if (changedir && ppTimer >="1" && !vulnerable[wg]) { ghostDir[wg] = "D"}
	} else {
	if (topG[wg] > pacTop) {// ghost > pac
		changedir=true
		for (v=pacTop;v<topG[wg];v=(v+10)){
		//newdatabit = eval ("mazedata[" + v + "].left" + pacLeft)
		newdatabit = mazedata[v][pacLeft]
		if (newdatabit && newdatabit.charAt(0) != "U") changedir=false
		}//for j
		if (changedir && ppTimer == "0"){ ghostDir[wg] = "U"} else if (changedir && ppTimer >="1" && vulnerable[wg]) {getTrueDir(wg,"U")} else if (changedir && ppTimer >="1" && !vulnerable[wg]) { ghostDir[wg] = "U"}
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
	if (changedir && ppTimer == "0"){ ghostDir[wg] = "R" } else if (changedir && ppTimer >="1" && vulnerable[wg]) {getTrueDir(wg,"R")} else if (changedir && ppTimer >="1" && !vulnerable[wg]) { ghostDir[wg] = "R"}
	} else {
	if (leftG[wg] > pacLeft) {// if ghost > pac
	changedir=true
	for (v=pacLeft;v<leftG[wg];v=(v+10)){
	//newdatabit = eval ("mazedata[pacTop].left" + v)
	newdatabit = mazedata[pacTop][v];
	if (newdatabit && newdatabit.charAt(2) != "L") changedir=false
	}//for j
	if (changedir && ppTimer == "0"){ ghostDir[wg] = "L" } else if (changedir && ppTimer >="1" && vulnerable[wg]) {getTrueDir(wg,"L")} else if (changedir && ppTimer >="1" && !vulnerable[wg]) { ghostDir[wg] = "L" }
	}

	}// if eq top
	}// for i

	//status bar for de-buging
	//status = pacLeft + "-" + pacTop + ":" + ifpil + "~~~" + pilcount + "^^^^" + topG[0] + "-" + topG[1] + "-" + topG[2] + "-" + topG[3] + ":::" + newdatabit.length + "****" + keycount
}

// flash maze at end of level. Also should kill the move timeouts here really
function gameEnd(){


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
		mazeFlashTimer=setTimeout ("gameEnd()",300)
	} else {
		top.score.score=score
		top.score.lives = lives
		top.score.level++
		if (top.score.level==10){
			top.score.level=1
			if (top.score.speed>=5){top.score.speed=top.score.speed-5;}
		}
		eval ("location='pacman_" + top.score.level + ".html'")
	}

}

function start(){
	gameTimer = setTimeout('divStart.visibility=\'hidden\'; move(); ghosts();',messageLifetime) 
}

/* Thiknking about proper OO version */

// ghost constructor
var ghost = function(){
	// properties:
	// name - blinky, pinky, inky, clyde 
	// src - the source image can be named after the name
	// top
	// left
	// current direction
	// alive bool 1,0 - 0 will become the original onPath variable
	// mode (chase, scatter, frightened)
}

