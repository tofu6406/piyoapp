console.log("utility.js!!");

//==========
// ServiceWorker
navigator.serviceWorker.register("./pwa_sw.js");

//==========
// Toast
function showToast(title, sub, msg, autohide=true, delay=400){
	console.log("showToast:", title, msg);
	// Object
	if(typeof(msg) == "object"){
		const props = Object.getOwnPropertyNames(msg);
		for(let prop of props){
			setTimeout(()=>popToast(title, sub, msg[prop], autohide), delay);
			delay += delay;
		}
		return;
	}
	setTimeout(()=>popToast(title, sub, msg, autohide), delay);
}

function popToast(title, sub, msg, autohide=true){
	if(typeof(msg) == "object") return;
	if(100 < msg.length) return;
	// Clone
	const base = document.querySelector(".toast");
	const clone = base.cloneNode(true);
	clone.querySelector("strong").innerText = title;
	clone.querySelector("small").innerText = sub;
	clone.querySelector(".toast-body").innerText = msg;
	// Event
	clone.addEventListener("shown.bs.toast", ()=>{
		//console.log("shown");
	});
	clone.addEventListener("hidden.bs.toast", ()=>{
		//console.log("hidden");
		clone.remove();// Remove
	});
	clone.classList.remove("d-none");
	// Append
	const container = document.querySelector(".toast-container");
	container.appendChild(clone);
	// Toast
	const toast = new bootstrap.Toast(clone, {autohide: autohide});
	toast.show();
}

//==========
// Axios
function loadAxios(url, onSuccess, onError){
	const option = {responseType: "blob"};
	axios.get(url, option).then(res=>{
		res.data.text().then(str=>{
			onSuccess(JSON.parse(str));
		});
	}).catch(err=>{
		onError(err);
	});
}

//==========
// Notification

function sendNotification(title, body, timeout=12000){
	console.log("sendNotification:", title);
	if(!Push.Permission.has()){
		Push.Permission.request(()=>{
			console.log("onGranted!!");
			const status = Push.Permission.get();// Status
			console.log(status);
			createNotification(title, body, timeout);
		}, ()=>{
			console.log("onDenied!!");
			const status = Push.Permission.get();// Status
			console.log(status);
		});
		return;
	}
	createNotification(title, body, timeout);
}

function createNotification(title, body, timeout=12000){

	Push.create(title, {
		body: body,
		icon: "./assets/images/logo.png",
		tag: "myTag",
		timeout: timeout,
		vibrate: [100, 100, 100],
		onClick: function(e){
			console.log("onClick", e);
		},
		onShow: function(e){
			console.log("onShow", e);
		},
		onClose: function(e){
			console.log("onClose", e);
		},
		onError: function(e){
			console.log("onError", e);
		}
	});
}

//==========
// Howler

window.addEventListener("blur", e=>{
	//console.log("blur");
});

window.addEventListener("focus", e=>{
	//console.log("focus");
});

class MyHowler{

	constructor(){
		this._se = {};
		this._bgm = {};
		this._soundFlg = JSON.parse(localStorage.getItem("sound"));
		if(this._soundFlg == null) this._soundFlg = true;
	}

	playSE(src, volume=1.0, loop=false){
		//this.stopSE();// Stop all SE
		if(!this.isActive()) return;
		if(src in this._se){
			this._se[src].play();
			return;
		}
		const sound = new Howl({
			src: src, 
			volume: volume, 
			loop: loop
		});
		this._se[src] = sound;
		this._se[src].play();
	}

	stopSE(){
		console.log("stopSE");
		//if(!this.isActive()) return;
		for(let key in this._se){
			if(this._se[key].seek() <= 0) continue;
			this._se[key].stop();
		}
	}

	playBGM(src, volume=1.0, loop=false){
		this.stopBGM();// Stop all BGM
		if(!this.isActive()) return;
		if(src in this._bgm){
			this._bgm[src].play();
			return;
		}
		const sound = new Howl({
			src: src, 
			volume: volume, 
			loop: loop
		});
		this._bgm[src] = sound;
		this._bgm[src].play();
	}

	stopBGM(){
		console.log("stopBGM");
		//if(!this.isActive()) return;
		for(let key in this._bgm){
			if(this._bgm[key].seek() <= 0) continue;
			this._bgm[key].stop();
		}
	}

	pauseBGM(){
		console.log("pauseBGM");
		//if(!this.isActive()) return;
		for(let key in this._bgm){
			if(!this._bgm[key].playing()) continue;
			this._bgm[key].pause();
		}
	}

	resumeBGM(){
		console.log("resumeBGM");
		if(!this.isActive()) return;
		for(let key in this._bgm){
			if(this._bgm[key].seek() <= 0) continue;
			this._bgm[key].play();
		}
	}

	isActive(){
		return this._soundFlg;
	}

	toggleActive(){
		this._soundFlg = !this._soundFlg;
		if(!this._soundFlg){
			this.stopSE();
			this.pauseBGM();
		}else{
			this.resumeBGM();
		}
		localStorage.setItem("sound", this._soundFlg);
	}
}
