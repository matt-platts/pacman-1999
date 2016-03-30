var globals = [];
globals.score = 0;
globals.lives = 3,
globals.level = 1,
globals.speed = 42,
globals.exlife1 = true,
globals.exlife2 = true,
globals.gameTime = 2000;


globals.basicVision = false; // set to 1 and the ghosts can see you if there is no wall between you and them in scatter mode, and move towards you (or away if a powerill is on) 



for (x in globals){
	sessionStorage.setItem(x,globals[x]);
	console.log(x,globals[x]);
}
