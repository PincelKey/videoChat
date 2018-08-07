//Socket del Server
const WebSocketSever = require("ws").Server,
    express = require("express"),
    https = require("https"),
    app = express(),
    fs = require("fs");

//Certificados SSL
const pkey = fs.readFileSync("./ssl/key.pem"),
    cert = fs.readFileSync("./ssl/cert.pem"),
    options={key: pkey, cert: cert, passphrase: '123456789'};

let wss=null, sslServer=null;

//Utilizando express para nuestra app (HTML, CSS, JS)

app.use(express.static('public'));

app.use(function(req, res, next) {
    if(req.headers['x-forwarded-proto']==='http') {
      return res.redirect(['https://', req.get('Host'), req.url].join(''));
    }
    next();
  });

//-->entender mas despues

//Creamos e iniciamos el servidor HTTPS
sslServer = https.createServer(options,app).listen(443);
console.log("El servidor HTTPS esta corriendo");

//Creamos el socket del servidor
wss = new WebSocketSever({server: sslServer});
console.log("Webscoket seguro corriendo");

/**Conexión exitosa */

//Defino mi stack de clientes
var clientes=[];

//Trabajo los eventos de mi Socket
///Verifico si hay una conexion a mi servidor
wss.on('connection',function(wsCliente){
	//0. Almacenar esa nueva conexion a mi stack
	console.log("[------NEW CLIENTE-----]");
	clientes.push(wsCliente);
 
	//Desplegar mas eventos
	//1. Cierre de la conexion
	wsCliente.on('close', function(){
		//Desapilo el cliente que se ha desconectado
		//cliente.splice();---Pendiente --URgente
		console.log("CLIENTE X DESCONECTADO")
		clientes.splice(clientes.indexOf(wsCliente),1);
	});

	//2. La existenca de un mensaje en el servidor
	wsCliente.on('message', function(message){
		var msg = JSON.parse(message);
		console.log("()SERVER-Msg: "+msg.from+" --> "+msg.to+" action: "+msg.action);
		for(var iCliente=0; iCliente<clientes.length; iCliente++){
			console.log(" [   Msg    ]")
			clientes[iCliente].send(message);
		}
	});	
});




