//Util
var Util = {
	log : function() {
		if(isLog && typeof console != undefined){
			for (var i in arguments){
				console.log(arguments[i]);
			}
		}
	},
	
	expandTextarea : function(el) {
		$(el).expandingTextarea();
	}
};

log = Util.log; //简化log调用