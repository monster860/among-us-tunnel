const readline = require('readline');
const dgram = require('dgram');
//broadcaster.connect(47777, "255.255.255.255");

// This is a solid block of shitcode, I know. So is among us, so it's fair anyways.

/*

To advertise, UDP broadcast packet from port 62446 to 255.255.255.255:47777
during game, server uses 22023 always and client uses any port.
? -> 22023

*/
/*
Our protocol is very simple: 1 byte for header, and the rest is payload.
The first byte can be:
0 (client->server) - subscribe
1 (server->client) - advertise
2 (client->server) - gameplay
3 (server->client) - gameplay
4 (client->server) - gameplay keepalive

Subscribing and gameplay use separate sockets for sanity.
*/

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

function q(question) {
	return new Promise((resolve, reject) => {
		rl.question(question, resolve);
	});
}

(async () => {
	try {
		let hosting_answer;
		do {hosting_answer = (await q("Are you (h)osting or (c)onnecting to a game? ")).toLowerCase()[0];} while(!"hc".includes(hosting_answer));
		if(hosting_answer == "h") {
			let port_answer = await q("What port? ");
			if(+port_answer != +port_answer) {
				console.log("Not a valid port");
			} else {
				be_server(+port_answer);
			}
		} else {
			let ip_answer = await q("Enter IP or hostname to connect to (include port): ");
			if(!ip_answer) return;
			be_client(ip_answer);
		}
	} finally {
		rl.close();
	}
})();

function be_server(port) {
	console.log("When you click local, it will say 'Couldn't start local network listener'. This is NORMAL. Close that warning and create a game.");
	let server = dgram.createSocket('udp4');
	server.bind(port);
	let server_ip = null;
	let broadcast_listener = dgram.createSocket('udp4');
	broadcast_listener.bind(47777);
	let subscribe_connections = new Map();
	let active_connections = new Map();
	server.on('message', (msg, rinfo) => {
		if(msg[0] == 0) {
			let key = `${rinfo.address}:${rinfo.port}`;
			if(!subscribe_connections.has(key)) {
				console.log(`New subscriber ${key}`);
				let conn = [
					rinfo.address,
					rinfo.port,
					make_disconnect_timeout(key)
				];
				subscribe_connections.set(key, conn);
			} else {
				console.log(`Continuing subscription ${key}`);
				let conn = subscribe_connections.get(key);
				clearTimeout(conn[2]);
				conn[2] = make_disconnect_timeout(key);
			}
		} else if((msg[0] == 2 || msg[0] == 4) && server_ip) {
			let key = rinfo.address + ":" + rinfo.port;
			if(!active_connections.has(key)) {
				let connection = be_client_for(server_ip, 22023, active_connections, rinfo.address, rinfo.port, server);
				active_connections.set(key, connection);
				connection(msg, rinfo);
			} else {
				active_connections.get(key)(msg, rinfo);
			}
		}
	});
	function make_disconnect_timeout(key) {
		return setTimeout(() => {
			console.log(`Disconnect from ${key}`);
			subscribe_connections.delete(key);
		}, 30000);
	}
	broadcast_listener.on('message', (msg, rinfo) => {
		if(!server_ip) {
			server_ip = rinfo.address;
			console.log(`Binding to ${server_ip}`);
		}
		if(server_ip != rinfo.address) {
			console.warn(`IGNORING Broadcast from ${rinfo.address}`, msg.toString('utf8'));
			return;
		}
		console.log(`Broadcast from ${rinfo.address}: `, msg.toString('utf8'));
		for(let [connip,connport] of subscribe_connections.values()) {
			//console.log(`Rebroadcasting to ${connip}:${connport}`);
			server.send(Buffer.concat([Buffer.from([1]), msg]), connport, connip);
		}
	});
}

function be_client_for(ip, port, active_connections, targetip, targetport, serversocket) {
	console.log("New connection from " + targetip + ":" + targetport);
	let socket = dgram.createSocket('udp4');
	socket.bind();
	let timeout;
	function refresh_timeout() {
		if(timeout) clearTimeout(timeout);
		timeout = setTimeout(() => {
			console.warn("Connection from " + targetip + ":" + targetport + " timed out");
			active_connections.delete(ip+":"+port);
			socket.close();
			return;
		}, 30000);
	}
	socket.on('message', (msg, rinfo) => {
		serversocket.send(Buffer.concat([Buffer.from([3]), msg]), targetport, targetip);
	});
	return (msg, rinfo) => {
		if(msg[0] == 2) {
			socket.send(msg, 1, msg.length-1, port, ip);
		}
		refresh_timeout();
	};
}

function be_client(ip_str) {
	let split = ip_str.split(/:(?=[0-9]+$)/);
	if(split.length != 2) {
		console.error("Expected IP or hostname and port");
	}
	let ip = split[0];
	let port = +split[1];
	
	let server, broadcaster;
	server = dgram.createSocket('udp4');
	server.bind(22023);
	broadcaster = dgram.createSocket('udp4');
	broadcaster.bind(62446, () => {
		broadcaster.setBroadcast(true);
	});
	
	let active_connections = new Map();
	
	let broadcaster_connection = dgram.createSocket('udp4');
	broadcaster_connection.bind();
	broadcaster_connection.send(Buffer.from([0]), port, ip);
	setInterval(() => {
		console.log("Sending subscription keepalive");
		broadcaster_connection.send(Buffer.from([0]), port, ip);
	}, 5000);
	broadcaster_connection.on('message', (msg, rinfo) => {
		console.log("Rebroadcasting: " + msg.toString('utf8'));
		if(msg[0] == 1) {
			broadcaster.send(msg, 1, msg.length-1, 47777, "255.255.255.255");
		}
	});
	
	server.on('message', (msg, rinfo) => {
		let key = rinfo.address + ":" + rinfo.port;
		if(!active_connections.has(key)) {
			let connection = be_server_for(rinfo.address, rinfo.port, active_connections, ip, port, server);
			active_connections.set(key, connection);
			connection(msg, rinfo);
		} else {
			active_connections.get(key)(msg, rinfo);
		}
	});
}

function be_server_for(ip, port, active_connections, targetip, targetport, serversocket) {
	console.log("New connection from " + ip + ":" + port);
	let socket = dgram.createSocket('udp4');
	socket.bind();
	let timeout;
	let refresh_interval = setInterval(() => {
		socket.send(Buffer.from([4]), targetport, targetip);
	}, 30000);
	function refresh_timeout() {
		if(timeout) clearTimeout(timeout);
		timeout = setTimeout(() => {
			console.warn("Connection from " + ip + ":" + port + " timed out");
			active_connections.delete(ip+":"+port);
			clearInterval(refresh_interval);
			socket.close();
			return;
		}, 30000);
	}
	socket.on('message', (msg, rinfo) => {
		if(msg[0] == 3) {
			serversocket.send(msg, 1, msg.length-1, port, ip);
		}
	});
	return (msg, rinfo) => {
		socket.send(Buffer.concat([Buffer.from([2]), msg]), targetport, targetip);
	};
}

// const broadcaster = dgram.createSocket('udp4');
//let header = Buffer.concat([Buffer.from([4, 2]), Buffer.from("UwU~Open~1", "utf8")])

//broadcaster.bind(62446, "127.0.0.1");
//broadcaster.send(header, 47777, "255.255.255.255");
//broadcaster.send(header, 47777, "127.0.0.1");