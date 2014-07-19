/*
 * @Author: Chuyik
 */

var prefix = "$";
var split_regex = /\s/;

CharReplace = Backbone.Model.extend({
		defaults : {
			ori: null,
	        ret: null,
	        regex: null
		},
		
		initialize: function(){
			this.set('regex', [{key: prefix + '1', val: ''.split(split_regex)}]);
		}
});

CharReplaces = Backbone.Collection.extend({
		model: CharReplace
});

CharView = Backbone.View.extend({
        //el: $("#tool"),
        initialize: function () {
        		this.listenTo(this.model, 'change', this.replaceChar);
        		Util.expandTextarea(this.$el.find("textarea:not([name='regex'])"));
        },
        
        template: _.template($('#char_tpl').html()),
        
        render: function() {
			this.$el.html(this.template(this.model.toJSON()));
			this.renderRegex();
			return this;
	    },
        renderRegex: function(){
        	var template = '';
        	for(var i in this.model.get('regex')){
        	    template += _.template($("#regex_tpl").html(), this.model.get('regex')[i]);
        	}
        	this.$el.find("#regex div:eq(0)").html(template);
        },
        events: {
                "keyup #ori-text": "setOri",
                "keyup #regex textarea": "setRegex",
                "click #regex button": "addRegex",
                "focus textarea": "resize",
                "blur textarea": "resize"
        },
        setOri: function(){
        	this.model.set('ori', this.$el.find('#ori-text').val());
        },
        setRegex: function(e){
        	for(var i in this.model.get('regex')){
        	    if(this.model.get('regex')[i].key == $(e.currentTarget).attr("mytool-data-for")){
        	    	var val = $.trim($(e.currentTarget).val()).replace(/\n/g, ' '); //reduce \n
        	    	var arr = val.split(split_regex);
        	    	this.model.get('regex')[i].val = arr;
        	    	break;
        	    }
        	}
        	this.replaceChar();
        },
        addRegex: function(){
        	var order = this.model.get('regex').length + 1; 
        	this.model.get('regex').push({key: prefix + order, val: ''});
        	log("model",this.model);
        	this.renderRegex();
        },
        replaceChar: function () {
        		if(!this.model.get('ori')){
                	return
                }
                //判断字符串最多替换多少次
                var maxlength = 0;
                for(var i in this.model.get('regex')){
                	var regex = this.model.get('regex')[i].val;
                	if(regex.length > maxlength){
                		maxlength = regex.length;
                	}
                }
                log("最大长度: " + maxlength);
                
                //****替换字符串****//
                var str = '';
                for(var i = 0; i < maxlength; i++){
                	var tempstr = '';
                	for(var ii = 0; ii < this.model.get('regex').length; ii++){
                		var key = this.model.get('regex')[ii].key;
                		var val = this.model.get('regex')[ii].val[i];
                		if(!val){
                			val = '';
                		}
                		key = eval("/\\" + key + "/g"); //全局正则表达式（因为$开头，需要转义）
                		if(ii == 0){
                			tempstr = this.model.get('ori').replace(key, val);
                			log(tempstr);
                		}else{
                			tempstr = tempstr.replace(key, val);
                		}
                	}
                	str += (tempstr + '\r\n');
                }
                log(str);
                this.$el.find('#ret-text').val(str).trigger('change');
        },
        resize: function(e){
        	var bExpand = (e.type == 'focusin');
        	this.$el.find("#char_replace").children().each(function(i, ee){
        		//隐藏中间连接符号
        		if($(ee).is('#plus,#equals')){
        			if(bExpand){
	        			$(ee).hide();
        			}else{
        				$(ee).show();
        			}
        			return true;
        		}
        		//调整当前Textarea大小
        		var cur = $(ee).find('textarea');
        		if(cur[0] === e.currentTarget){
        			var clazz = $(ee).attr('class');
        			
        			clazz = clazz.replace(/(.+?)(\d)+/g, function(m,p1,p2){
        				return p1 + (bExpand ? parseInt(p2)+2 : parseInt(p2)-2);
        			});
        			if(bExpand){
    	    			$(ee).attr('class', clazz);
        			}else{
	        			$(ee).attr('class', clazz);
        			}
        		}
        	});
        }
});

var models = new CharReplaces();

AppView = Backbone.View.extend({
        el: $("#tool"),
        initialize: function () {
        	this.listenTo(models, 'add', this.addOne);
        	this.listenTo(models, 'reset', this.addAll);
        },
        
        events:{
        	"click #addModel": "createOne"
        },
        
        createOne: function(){
        	this.addOne(new CharReplace());
        },
        
        addOne: function(model) {
	        var view = new CharView({model: model});
	        this.$el.find('#tool-body').append(view.render().el);
	    },
	    
	    addAll: function(){
	    	models.each(this.addOne, this);
	    }
});


BookShelf = Backbone.Collection.extend({
    model : CharReplace
});

var appView = new AppView();
models.add([new CharReplace(), new CharReplace()]);

Util.expandTextarea($("textarea:not([name='regex'])"));
