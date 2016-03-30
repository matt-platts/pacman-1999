var globals = [];
globals.score = 0;
globals.lives = 3,
globals.level = 1,
globals.speed = 42,
globals.exlife1 = true,
globals.exlife2 = true,
globals.gameTime = 2000;

for (x in globals){
	sessionStorage.setItem(x,globals[x]);
	console.log(x,globals[x]);
}
