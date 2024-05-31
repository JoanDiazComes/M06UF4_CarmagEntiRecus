const config = {
	type: Phaser.AUTO,
	width: 800,
	height: 600,
	physics: {default:'arcade'},
	scene:{
		preload: preload,
		create: create,
		update: update
	  }
	}

let player_num = 0;

let player1;
let player2;

let bullet1;
let bullet2;

let canShoot = true;

const bullet_speed = 3;

const socket = new WebSocket("ws://192.168.1.17:8080");

socket.addEventListener("open", function(event){
});

socket.addEventListener("message", function(event){

	let data = JSON.parse(event.data);

	if(data.player_num != undefined){
		player_num = data.player_num;
		console.log("Player num: ", player_num);
	}
	if(data.x != undefined){
		if(player_num == 2){
			if (data.n == 1) {
				player1.x = data.x,
				player1.y = data.y,
				player1.rotation = data.r
			}
		}
		else if(player_num == 1){
			if (data.n == 2) {
				player2.x = data.x,
				player2.y = data.y,
				player2.rotation = data.r
			}
		}
		else{
			if (data.n == 1) {
				player1.x = data.x,
				player1.y = data.y,
				player1.rotation = data.r
			}
			if (data.n == 2) {
				player2.x = data.x,
				player2.y = data.y,
				player2.rotation = data.r
			}
		}
	}
	else if(data.bx != undefined){
		if(data.n === 1){
			console.log("bala1");
			if(bullet1 == undefined){

				bullet1 = global_game.add.image(data.bx, data.by, "bullet");
				bullet1.setScale(0.07);
				bullet1.rotation = data.br;

				global_game.physics.add.collider(player2, bullet1, () => {
                    console.log("Collided Player " + player_num);
                    bullet1.destroy(true, false);
                    let collided = {
                        player: 2,
                        collided: true
                    };

                    socket.send(JSON.stringify(collided));
                });

				global_game.physics.add.existing(bullet1, false);
			}

			bullet1.y -= bullet_speed * Math.cos(bullet1.rotation);
			bullet1.x += bullet_speed * Math.sin(bullet1.rotation);
		}

		if(data.n === 2){
			console.log("bala2");
			if(bullet2 == undefined){

				bullet2 = global_game.add.image(data.bx, data.by, "bullet");
				bullet2.setScale(0.07);
				bullet2.rotation = data.br;

				global_game.physics.add.collider(player1, bullet2, () => {
                    console.log("Collided Player " + player_num);
                    bullet2.destroy(true, false);
                    let collided = {
                        player: 1,
                        collided: true
                    };
                    socket.send(JSON.stringify(collided));
                });
				
				global_game.physics.add.existing(bullet2, false);
			}
			bullet2.y -= bullet_speed * Math.cos(bullet2.rotation);
			bullet2.x += bullet_speed * Math.sin(bullet2.rotation);
		}

	}

	else if (data.game_over != undefined) {

        bg_canvas = global_game.add.rectangle(0, 0, config.width*2, config.height*2, 0x000000);

        if (data.game_over === player_num) {
            text = global_game.add.text(config.width / 3, config.height / 2, "YOU LOSE", {font: '600 36px Impact', color: '#8F0000'});
        }
        else if (data.gameOver != player_num && player_num <= 2) {
            text = global_game.add.text(config.width / 3, config.height / 2, "YOU WON", {font: '600 36px Impact', color: '#7B00FF'});
        }
		else {
            let number;
            data.game_over === 1 ? number = 2 : number = 1;
            text = global_game.add.text(config.width / 3, config.height / 2, "PLAYER " + number + " WON", {font: '600 36px Impact', color: '#0EC9C2'});
        }
    }
});

const game = new Phaser.Game(config);

let global_game;

let bg_canvas;
let text;

const car_speed = 2;
const car_rotation = 2;

let player1_angle = -1.5;
let player2_angle = -1.5;

let car_move;
let bullet_shoot;

function preload ()
{
	this.load.image('car1', 'assets/PNG/Cars/car_yellow_small_1.png');
	this.load.image('car2', 'assets/PNG/Cars/car_red_small_1.png');

	this.load.image('track', 'assets/PNG/Track/track.png');

	this.load.image('bullet', 'assets/PNG/Bullet/bullet.jpg');

	global_game = this;

}

function create ()
{
	track = this.add.image(400, 300, 'track').setDisplaySize(800,600);

	player1 = this.add.image(272, 508, 'car1');
	player2 = this.add.image(272, 544, 'car2');

	this.physics.add.existing(player1, false);
	this.physics.add.existing(player2, false);

	player1.setScale(0.5);
	player2.setScale(0.5);

	player1.setAngle(-90);
	player2.setAngle(-90);

	car_move = this.input.keyboard.createCursorKeys();
	bullet_shoot = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

}

function update ()
{
	if(player_num == 0)
		return;

	if(player_num == 1){
		if( car_move.up.isDown){
			player1.y -= car_speed*Math.cos(player1_angle*Math.PI/180);
			player1.x += car_speed*Math.sin(player1_angle*Math.PI/180);
		}
	
		if( car_move.down.isDown){
			player1.y += car_speed*Math.cos(player1_angle*Math.PI/180);
			player1.x -= car_speed*Math.sin(player1_angle*Math.PI/180);
		}
	
		if(car_move.left.isDown){
			player1_angle -= car_rotation;
		}
	
		if(car_move.right.isDown){
			player1_angle += car_rotation;
		}

		if (bullet_shoot.isDown && canShoot) {
            bullet1 = this.add.image(
                player1.x + (2 * player1.width / 3)* Math.sin(player1_angle * Math.PI / 180),
                player1.y - (2 * player1.width / 3) * Math.cos(player1_angle * Math.PI / 180),
                "bullet"
            );
            bullet1.setScale(0.07);
            bullet1.rotation = player1_angle * Math.PI / 180;
            canShoot = false;
        }

		player1.rotation = player1_angle*Math.PI/180;

 		 let player_data = {
			n: player_num,
			x: player1.x,
			y: player1.y,
			r: player1.rotation
  		};

 		socket.send(JSON.stringify(player_data));

		if (bullet1 == undefined || canShoot) {
			return;
		}
	
		bullet1.y -= bullet_speed * Math.cos(bullet1.rotation);
		bullet1.x += bullet_speed * Math.sin(bullet1.rotation);
	
		let bullet_data = {
			bx: bullet1.x,
			by: bullet1.y,
			br: bullet1.rotation,
			n: 1
		}
	
		socket.send(JSON.stringify(bullet_data));

	}
	else if(player_num == 2){
		if( car_move.up.isDown){
			player2.y -= car_speed*Math.cos(player2_angle*Math.PI/180);
			player2.x += car_speed*Math.sin(player2_angle*Math.PI/180);
		}
	
		if( car_move.down.isDown){
			player2.y += car_speed*Math.cos(player2_angle*Math.PI/180);
			player2.x -= car_speed*Math.sin(player2_angle*Math.PI/180);
		}
	
		if(car_move.left.isDown){
			player2_angle -= car_rotation;
		}
	
		if(car_move.right.isDown){
			player2_angle += car_rotation;
		}

		if (bullet_shoot.isDown && canShoot) {
            bullet2 = this.add.image(
                player2.x + (2 * player2.width / 3)* Math.sin(player2_angle * Math.PI / 180),
                player2.y - (2 * player2.width / 3) * Math.cos(player2_angle * Math.PI / 180),
                "bullet"
            );
            bullet2.setScale(0.07);
            bullet2.rotation = player2_angle * Math.PI / 180;
            canShoot = false;
        }

		player2.rotation = player2_angle*Math.PI/180;

 		 let player_data = {
			n: player_num,
			x: player2.x,
			y: player2.y,
			r: player2.rotation
  		};

		socket.send(JSON.stringify(player_data));

		if (bullet2 == undefined || canShoot) {
			return;
		}
	
		bullet2.y -= bullet_speed * Math.cos(bullet2.rotation);
		bullet2.x += bullet_speed * Math.sin(bullet2.rotation);
	
		let bullet_data = {
			bx: bullet2.x,
			by: bullet2.y,
			br: bullet2.rotation,
			n: 2
		}
	
		socket.send(JSON.stringify(bullet_data));

	}
}

