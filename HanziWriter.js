/* global Module */

/* Magic Mirror
 * Module: HanziWriter
 *
 * By 
 * MIT Licensed.
 */


Module.register("HanziWriter", {

	defaults: {
//		hanzi_data_json: "https://raw.githubusercontent.com/NicholasARossi/MMM-HanziStudy/master/charecter_data/hsk3.json",
		hanzi_data_json: "charecter_data/hsk3.json",

		updateInterval: 30000,
		remoteFile: null,
		fadeSpeed: 4000,
		morningStartTime: 3,
		morningEndTime: 12,
		afternoonStartTime: 12,
		afternoonEndTime: 17,
		random: true,
		mockDate: null
	},



	requiresVersion: "2.1.0", // Required version of MagicMirror

	start: function() {

		var self = this;
		var dataRequest = null;
		var dataNotification = null;

		//Flag for check if module is loaded
		this.loaded = false;

		// Schedule update timer.
		this.getData();
		setInterval(function() {
			self.updateDom();
		}, this.config.updateInterval);
	},

	/*
	 * getData
	 * function example return data and show it in the module wrapper
	 * get a URL request
	 *
	 */
	getData: function() {
		var self = this;

		var urlApi = this.config.hanzi_data_json;
		var retry = true;

		var dataRequest = new XMLHttpRequest();
		dataRequest.open("GET", urlApi, true);
		dataRequest.onreadystatechange = function() {
			console.log(this.readyState);
			if (this.readyState === 4) {
				console.log(this.status);
				if (this.status === 200) {
					self.processData(JSON.parse(this.response));
				} else if (this.status === 401) {
					self.updateDom(self.config.animationSpeed);
					Log.error(self.name, this.status);
					retry = false;
				} else {
					Log.error(self.name, "Could not load data.");
				}
				if (retry) {
					self.scheduleUpdate((self.loaded) ? -1 : self.config.retryDelay);
				}
			}
		};
		dataRequest.send();
	},


	/* scheduleUpdate()
	 * Schedule next update.
	 *
	 * argument delay number - Milliseconds before next update.
	 *  If empty, this.config.updateInterval is used.
	 */
	scheduleUpdate: function(delay) {
		var nextLoad = this.config.updateInterval;
		if (typeof delay !== "undefined" && delay >= 0) {
			nextLoad = delay;
		}
		nextLoad = nextLoad ;
		var self = this;
		setTimeout(function() {
			self.getData();
		}, nextLoad);
	},

	getDom: function() {
		var self = this;


		const keys = Object.keys(this.dataRequest)
		console.log(keys)
		console.log(keys[0])
		// create element wrapper for show into the module
		var wrapper = document.createElement("div");
		var sub_char=document.createElement("div");
		var hanzi_text=document.createElement("div");
		var eng_text=document.createElement("div");

		hanzi_text.className = "newsfeed-desc small light"
		eng_text.className = "newsfeed-desc small light"

		hanzi_text.innerHTML=this.translate('租房子当然是越便宜越好了')
		eng_text.innerHTML=this.translate('If we rent, the cheaper the better.')

		// If this.dataRequest is not empty
//		if (this.dataRequest) {
//			var wrapperDataRequest = document.createElement("div");
//			// check format https://jsonplaceholder.typicode.com/posts/1
//			wrapperDataRequest.innerHTML = this.dataRequest.title;
//
//			var labelDataRequest = document.createElement("label");
//			// Use translate function
//			//             this id defined in translations files
//			labelDataRequest.innerHTML = this.translate("TITLE");
//
//
//			wrapper.appendChild(labelDataRequest);
//			wrapper.appendChild(wrapperDataRequest);
//		}
//
//		// Data from helper
//		if (this.dataNotification) {
//			var wrapperDataNotification = document.createElement("div");
//			// translations  + datanotification
//			wrapperDataNotification.innerHTML =  this.translate("UPDATE") + ": " + this.dataNotification.date;
//
//			wrapper.appendChild(wrapperDataNotification);
//		}
		var writer = HanziWriter.create(sub_char, '越', {
		  width: 200,
		  height: 200,
		  padding: 5,
		  strokeColor: '#FFFFFF',
		  outlineColor :'#000',
		  delayBetweenLoops: 3000
		});

		writer.loopCharacterAnimation();
		wrapper.appendChild(sub_char);
		wrapper.append(hanzi_text);
		wrapper.append(eng_text);

		return wrapper;
	},

	getScripts: function() {
		return ['hanzi-writer.js'];
	},

	getStyles: function () {
		return [
			"HanziWriter.css",
		];
	},

	// Load translations files
	getTranslations: function() {
		//FIXME: This can be load a one file javascript definition
		return {
			en: "translations/en.json",
			es: "translations/es.json"
		};
	},

	processData: function(data) {
		var self = this;
		this.dataRequest = data;
		if (this.loaded === false) { self.updateDom(self.config.animationSpeed) ; }
		this.loaded = true;

		// the data if load
		// send notification to helper
		this.sendSocketNotification("HanziWriter-NOTIFICATION_TEST", data);
	},

	// socketNotificationReceived from helper
	socketNotificationReceived: function (notification, payload) {
		if(notification === "HanziWriter-NOTIFICATION_TEST") {
			// set dataNotification
			this.dataNotification = payload;
			this.updateDom();
		}
	},
});
