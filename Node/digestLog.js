
var digestLog={};


digestLog.nfcLog = function(str){
	var response=str;
	if (str=="ROK"){
		response="NFC will ROM stickers";
	}
	if (str=="RKO"){
		response="NFC will NOT ROM stickers";
	}
	if (str=="SOK"){
		response="Sticker in position";
	}
	if (str=="launchOne"){
		response="Sticker launched";
	}
	if (str.indexOf(""))
	if (str=="error"){
		response="No NFC chip detected";
	}
	if (str.indexOf("Rerror")>0){
		response="Unable to read NDEF.";
	}
	if (str.indexOf("Werror")>0){
		response="Unable to write NDEF.";
	}

	return response;
}

//Metode que genera el objecte de resposta de la placa de NFC:
digestLog.nfc=function(str){
	var response={
			debug:"",
			message:{
				id: "",
				status:"",
				reason:"",
				detect:"",
				identify:"",
				read:"",
				write:""
			}
	}
	var aux=str.split('\n');
	for(var i=0;i<aux.length;i++){
		if (aux[i].indexOf('**')>-1){
			var aux2=aux[i].split("**");
			response.message.id=aux2[0];
			if (aux[i].indexOf("**RO**")>-1){
				response.message.status="success";
				response.message.reason="rom";
			}
			if (aux[i].indexOf("**R**")>-1){
				response.message.status="success";
				response.message.reason="no rom";
			}
			if (aux[i].indexOf("++RE**")>-1){
				response.message.status="error";
				response.message.reason="Read error";
			}
			if (aux[i].indexOf("++WE**")>-1){
				response.message.status="error";
				response.message.reason="Write error";
			}
			response.message.detect=aux2[2];
			response.message.identify=aux2[3];
			response.message.read=aux2[4];
			response.message.write=aux2[5];
		}else{
			response.debug+=aux[i]+"\n";
		}
	}
	return response;
}

digestLog.nfcRom = function(str){
	if (str == "ROK")	return "NFC will ROM stickers";
	else return "NFC will NOT ROM stickers";
}


//Export module
module.exports = digestLog;

//0432c56afe4a81**RO**26**73**209**1   -> OK
//0432c56afe4a81**::::.https://varias-go.tictap.me/track/2N87EG4O++RE**27**237**178**1 -> KO
