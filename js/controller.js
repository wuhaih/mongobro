$(function() {

	//项目基本配置
	//2015-10-07 update

	var _document = $(document);

	var config = {
		DEBUG : true, //是否为DEBUG状态
		LEFT_CLICK : 1, //左键单击
		RIGHT_CLICK : 2, //右键单击
		DB_LIST : {
			FIRST_LEVEL : 1, //dblist 第一层
			SECOND_LEVEL : 2 //sblist 第二层
		}
	};

	//用于输出数据的函数,仅当DEBUG状态为真时触发
	var debug = function(str) {
		if(config.DEBUG){
			console.log(str);
		}
	};

	//终端窗口状态
	var terminalStatus = {
		isMaxified : false, //终端窗口是否最大化,默认为假
		isMinified : false, //终端窗口是否最小化,默认为假
		isClosed : true, //终端窗口是否被关闭,默认为真
		isShow : false //终端窗口是否被显示,默认为假
	};

	//控制台的相关配置文件
	var terminalConfig = {
		TIPS : '$_> ', //控制台输入提示符(用来作为用户输入命令的分割符)
		EDITORID : 'cmd', //控制台编辑器的ID
		EOI : '\r\n' //换行符
	};

	//数据库配置文件
	var dbConfig = {
		currentDBName : '', //现行左键单击的数据库名称
		currentTableName : '', //现行左键单击的数据表名称
		currentRightClickDBName : '', //现行右键单击的数据库名称
		currentRightClickTableName : '' //现行右键单击的数据表名称
	};

	//记录运行时产生的数据参数
	var runtime = {
		dbList : {
			ClickMethod : config.LEFT_CLICK, //数据库/数据表点击方式(1:左击,2:右击)
			ClickLevel : config.DB_LIST.FIRST_LEVEL //记录单击或右击的level层,1为第一层,2为第二层
		},

		collection : {
			selected: [], //记录数据表中被选择的所有项目
			isExists: function(_id) { //检测被选择的项是否已存在于列表中,如果有则删除,没有则push
				for (var i = 0; i < this.selected.length; i++) {
					var curr = this.selected[i];
					if(curr._id == _id) {
						this.selected.splice(i,1);
						return true;
					}
				};
				return false;
			}
		}
	};

	//拓展string对象
	String.prototype.trim=function(){
　　    return this.replace(/(^\s*)|(\s*$)/g, "");
　　};

　　String.prototype.ltrim=function(){
　　    return this.replace(/(^\s*)/g,"");
　　};

　　String.prototype.rtrim=function(){
　　    return this.replace(/(\s*$)/g,"");
　　};

	//拓展Number对象
	var inArray = function(search, array) {
		for(var i in array){
	        if(array[i]==search){
	            return true;
	        }
	    }
	    return false;
	}

	var notInArray = function(search, array) {
		return !inArray(search, array);
	}

	//终端命令列表
	var terminalCommands = {

		currentFunctionName : '', //当前的函数名

		terminalEditorObj : '',

		getTerminalAllContent : function(obj) { //获得控制台窗口的全部内容
			var _this = $(obj);
	    	var e = _this.val();
	    	return e;
		},

		//为控制台窗口添加新行
		appendNewLineInTerminal : function(e,obj,displayTips) {
			displayTips = displayTips == null ? true : false;

			if(displayTips) {
				var TIPS = terminalConfig.TIPS;
			}else{
				var TIPS = '';
			}

			$(obj).val(e + '\r\n' + TIPS);
			var scrollTop = $("#" + terminalConfig.EDITORID)[0].scrollHeight;
            $("#"+terminalConfig.EDITORID).scrollTop(scrollTop);
		},

		echo: function(obj, args, val) {
			var tips = val;
			var all = terminalCommands.getTerminalAllContent('\r\n       ' + obj);
			terminalCommands.appendNewLineInTerminal(all + tips, obj);
		},

		getAllCmds: function() { //获得所有命令
			var list = [];
			for(var key in terminalCommands) {
				list.push(key);
			}
			return list;
		},

		formatCmds: function() { //格式化命令显示方式
			var tmp = '';
			var cmdList = terminalCommands.getAllCmds();
			for (var i = 0; i < cmdList.length; i++) {
				var curr = cmdList[i];
				tmp += '       ' + curr + '\r\n';
			};
			return tmp;
		},

		cmd : function (func,obj,args) { //根据函数名执行函数
			if(func.length!==0){
				var objCalled = eval('terminalCommands.'+func);

				//清空命令行中的空白字符
				for (var i = 0; i < args.length; i++) {
					args[i] = args[i].trim();
					args[i] = args[i].replace('\r\n','');
				};

				func = func.replace('\n','');//textarea中\n为换行符,替换之.否则会多出一行
				var append = '\r\n       command "' + func +'" is not found';

				if (typeof objCalled == 'undefined') {
					terminalCommands.appendNewLineInTerminal(terminalCommands.getTerminalAllContent(obj)+append, obj);
					return false;
				}

				new objCalled(obj,args);
			}
		},

		clear : function (obj,args) { //清空控制台窗口内容
			obj.val(terminalConfig.TIPS);
		},

		help : function (obj,args) { //输出帮助信息
			var all = terminalCommands.getTerminalAllContent(obj);
			if(args.length > 0) {
				for (var i = 0; i < args.length; i++) {
					all += '\n       '+ args[i] + ' : ' + terminalCommands[args[i]];
				};
			}else {
				all = all + '\r\n\r\n       this the help tips, all commands available are listed below:(you can type help [command name] to lookup the prototype of the command that you want to learn,for example : help clear) \r\n' + terminalCommands.formatCmds();				
			}
			terminalCommands.appendNewLineInTerminal(all,obj);
		},

		debug : function (obj,args) { //debug开关

			var debugSwitch = {
				'on' : function() {
					config.DEBUG = true;
				},
				'off' : function() {
					config.DEBUG = false;
				}
			};

			if(args.length === 0 || args[0] == 'toggle') {
				config.DEBUG = ! config.DEBUG;
			}else {
				debugSwitch[args[0]]();
			}
			
			var tips = config.DEBUG ? '\r\n       DEBUG开关已打开' : '\r\n       DEBUG开关已关闭';
			var all = terminalCommands.getTerminalAllContent(obj);
			terminalCommands.appendNewLineInTerminal(all + tips, obj);
		},

		remove : function (obj,args) { //清空数据库,如果参数留空则清空所有数据库
			var method = {
				'all' : function() {
					mongoBro.removeAllDatabases();
					getDBExists();
				}
			};

			var type = '';

			if(args.length === 0) {
				type = 'all';
			}else{
				type = args[0];
			}

			if (typeof method[type] == 'function') {
				method[type]();				
			}else {
				var tips = '\r\n       ' + type + 'is undefined';
				var all = terminalCommands.getTerminalAllContent(obj);
				terminalCommands.appendNewLineInTerminal(all + tips, obj);
			}
		},

		exit: function(obj, args) {
			toggleTerminal();
		},

		add: function(obj, args) {
			//add key to person_edit2 in test set fuck,shit,bitch values ha,ha,ha
			var tokenList =  [ "key", "to", "TABLENAME", "in", "DBNAME", "set", "FIELDSNAME", "values", "VALUELIST" ];
			var indexMust = [0, 1, 3, 5];

			var syntax = 0;

			var errorList = [];

			for (var i = 0; i < tokenList.length; i++) {
				var currToken = tokenList[i];
				if(inArray(i, indexMust)) {
					if(typeof args[i] == 'undefined' || args[i] != tokenList[i]) {
						errorList.push(tokenList[i]);
						syntax ++;
					}
				}
			};

			if(syntax > 0) {
				var tips = '\r\n       ' + '语法错误' + '\r\n       Token错误: ' + JSON.stringify(errorList);
				var all = terminalCommands.getTerminalAllContent(obj);
				terminalCommands.appendNewLineInTerminal(all + tips, obj);
				return false;
			}

			var tableName = args[2];
			var DBName = args[4];
			var fieldsName = args[6];
			var valueList = args[8];

			var fieldsNameList = fieldsName.split(',');

			if(typeof valueList != 'undefined') {
				var valueList = valueList.split(',');
			}else {
				var valueList = [];
			}

			mongoBro.addTableKey(DBName, tableName, fieldsNameList, valueList);

		},

		rollback: function(obj, args) {
			rollback();
			getDBExists();
		}

	};

	//****************************基本库****************************

	//数据库是否点击了二级菜单
	function isDBListClick2ndLevel() {
		return runtime.dbList.ClickLevel === config.DB_LIST.SECOND_LEVEL;
	}

	//***************************UI控制层***************************

	//模态框

	var modal = {

		show : function(id) {
			$('#' + id).addClass('is-visible');
		},

		alert : function(id,callback) {
			var html = '<div class="cd-popup" id="'+id+'">\
							<div class="cd-popup-container">\
							  	<div class="modal-header">\
							  		<h3>Are you sure to do that?</h3>\
							  	</div>\
							    <ul class="cd-buttons">\
							      	<li><a data-callback="'+callback+'" href="#0">确定</a></li>\
							      	<li><a data-callback="" href="#0">取消</a></li>\
							    </ul>\
							    <a href="#0" class="cd-popup-close img-replace"></a>\
							 </div>\
						</div>';
			$('body').append(html);
			
		}

	};

	//点击空白处时触发
	$('.cd-popup').on('click', function(event){
	    if( $(event.target).is('.cd-popup-close') || $(event.target).is('.cd-popup') ) {
	      event.preventDefault();
	      $(this).removeClass('is-visible');
	    }
	});

	//确定按钮被按下
	$('.cd-buttons li:first-child a').click(function(){
		var callback = $(this).attr('data-callback');
		if(typeof callback == 'undefined') {
			return false;
		}
		var callfunc = eval(callback);
		if(callfunc == undefined || callfunc == true) {
			$('.cd-popup').removeClass('is-visible');
		}
	});

	//取消按钮被按下
	$('.cd-buttons li:last-child a').click(function(){
		$('.cd-popup').removeClass('is-visible');
		var callback = $(this).attr('data-callback');
		if(typeof callback == 'undefined') {
			return false;
		}
		var callfunc = eval(callback);
	});

	//左边数据库列表被点击
	$(document).on("click",".file-list ul li",function(){
	    
	    ///装饰器模式

	    runtime.dbList.ClickMethod = config.LEFT_CLICK; //当前是单击模式

	    var _this = $(this);

		FileListClickOnStart(this);

		$('.file-list ul').find('.active').removeClass('active');
		_this.toggleClass('active');

		FileListClickOnEnd(this);

	});

	var displayRightMenu  = function(top,left) {
		var _rightMenu = $('.right-menu');
		_rightMenu.show();
		_rightMenu.css({
			'top': top,
			'left': left
		});
	};

	//左边列表被右击
	$(document).on('mousedown','.file-list ul li',function(e){
		if(e.which == 3) {
			runtime.dbList.ClickMethod = config.RIGHT_CLICK; //当前是右击模式
			var _this = $(this);
			var _thisDBName = _this.attr('data-dbname');
			var _thisTableName = _this.attr('data-tableName');
			var top = e.clientX;
			var left = e.clientY + 100;
			if( typeof _thisTableName == 'undefined' ) {
				//点击了一级菜单
				displayRightMenu(left,top);
				dbConfig.currentRightClickDBName = _thisDBName;
				runtime.dbList.ClickLevel = config.DB_LIST.FIRST_LEVEL; //右击第一层
			}else {
				//点击了二级菜单
				displayRightMenu(left,top);
				dbConfig.currentRightClickDBName = _thisDBName;
				dbConfig.currentRightClickTableName = _thisTableName;
				runtime.dbList.ClickLevel = config.DB_LIST.SECOND_LEVEL; //右击第二层
			}
			return false;
		}
	}).bind('contextmenu',function(e){
	    e.preventDefault();
	    return false;
	});;


	//数据库/数据表列表右键菜单被单击
	$('#dblist-rm ul li').click(function(){

		dbListRightMenuClickStart(this);

		$('#dblist-rm').hide();
	});

	//https://www.zybuluo.com/ivydom/note/217261

	$(document).on('click','.file-list ul li.active ul li',function(){
		
		var _this = $(this);

		tableListClickOnStart(this);

		_this.parent().find('.sactive').removeClass('sactive');
		_this.addClass('sactive');

		tableListClickOnEnd(this);

	});

	//body被点击时隐藏右键菜单,数据列表编辑框等
	$(document).on('click','body',function(e){
		$('.right-menu').hide();

		var clickArea = e.originalEvent.explicitOriginalTarget;

		//每个列表项的上一级都有一个data-val,以此判断受否点击了列表项,如果点击了列表项,不允许隐藏列表项编辑框
		if(typeof $(clickArea).parent().attr('data-val') == 'undefined') {
			$('#collectionList tbody tr td input, #collectionList tbody tr td textarea').each(function(i, e) {
				var curr = $(e);
				//新建表格项的时候点击了body与此处冲突,因此需要检测当前td是否有td-new-collection类,如果有则不允许置空
				if(curr.parent().hasClass('td-new-collection')) {
					return false;
				}
				curr.parent().html(curr.val());
			});
		}

	});

	//禁用右键菜单	
	$('body').bind('contextmenu',function() {
		if(!config.DEBUG){
			return false;			
		}
	});

	$('body').bind('selectstart',function() {
		if(!config.DEBUG){
			return false;			
		}
	});

	//终端右边按钮

	//终端位置初始化
	var mongoTerminalObj = $('.mongo-terminal');
	mongoTerminalObj.css({
		'left' : ((_document.width()-mongoTerminalObj.width())/2)+'px',
		'top' : ((_document.height()-mongoTerminalObj.height())/2-150)+'px'
	});

	//最大化终端窗口
	var maxifyTerminal = function() {
		if(terminalStatus.isMaxified){
			$('.mongo-terminal').css({
				'width':'800px',
				'height':'400px',
				'top':'30px',
				'left':'30px'
			});
		}else{
			$('.mongo-terminal').css({
				'width':'100%',
				'height':'100%',
				'top':'0',
				'left':'0'
			});
		}
		terminalStatus.isMaxified = !terminalStatus.isMaxified;
		terminalStatus.isShow = true;
		terminalStatus.isMinified = false;
	};

	//最小化终端窗口
	var minifyTerminal = function() {
		$('.mongo-terminal').hide();
		terminalStatus.isMinified = true;
		terminalStatus.isShow = true;
		terminalStatus.isMaxified = false;
	};

	//关闭或打开终端窗口
	var toggleTerminal = function() {
		$('.mongo-terminal').fadeToggle(200);
		$("#"+terminalConfig.EDITORID).focus();
		terminalStatus.isClosed = !terminalStatus.isClosed;
		terminalStatus.isShow = !terminalStatus.isShow;
		if(!terminalStatus.isMinified) {
			$("#"+terminalConfig.EDITORID).val("Welcome to MongoBro (version 1.0.0-preview20151010)\r\n\r\nRun 'h' to dplay the help index.\r\nRun 'h <command>' to display help for specific commands.\r\n\r\n"+terminalConfig.TIPS);
		}
		terminalStatus.isMinified = !terminalStatus.isMinified;
		// terminalStatus.isMaxified = !terminalStatus.isMaxified;
	};

	//终端控制按钮点击事件
	$('.terminal-control-btn ul li').click(function(){
		var thisId = $(this).attr('id');
		switch (thisId) {
			case 'minify' :
				minifyTerminal();
				break;
			case 'maxify' :
				maxifyTerminal();
				break;
			case 'close' :
				toggleTerminal();
				break;
		}
	});

	//双击终端标题栏放大或缩小
	$('.terminal-top').on('dblclick',function(){
		maxifyTerminal();
	});

	//终端标题栏拖动事件
	var dragging = false;
	var dragIsFirst = true;
    var iX, iY;
    $(".terminal-top").mousedown(function(e) {
        dragging = true;
        $(".mongo-terminal").css({"transition":'none'});
        iX = e.clientX - this.offsetLeft;
        iY = e.clientY - this.offsetTop;
        this.setCapture && this.setCapture();
        return false;
    });

    document.onmousemove = function(e) {
        if (dragging) {
	        var e = e || window.event;
	        if (!dragIsFirst){
	        	var oX = e.clientX - iX + 830;
	        	var oY = e.clientY - iY - 300;
	        }else{
	        	var oX = e.clientX - iX + 170;
	        	var oY = e.clientY - iY + 40;
	        }
	        $(".mongo-terminal").css({"left":oX + "px", "top":oY + "px"});
	        return false;
        }
    };

    $(document).mouseup(function(e) {
        dragging = false;
        dragIsFirst = true;
        $(".mongo-terminal")[0].releaseCapture();
        $(".mongo-terminal").css({"transition":'all 0.6s ease 0s'});
        iX = 0;
        iY = 0;
        e.cancelBubble = true;
    });

	//菜单栏终端选项点击事件
	$('#main-menu ul li#menu-terminal').click(function(){
		toggleTerminal();
	});

	//获得用户输入的命令
	var getCMD = function(obj,count) {
		count = count == null ? 2 : count;
		var e = terminalCommands.getTerminalAllContent(obj);
    	var cmd = e.split(terminalConfig.TIPS);
    	var n = cmd.length-count;
    	e = '';
    	cmd[n] = cmd[n].replace('\n','');
    	return cmd[n];
	}

	//控制台textarea回车捕获事件
	$("#"+terminalConfig.EDITORID).keydown(function(event) {
        if (event.keyCode === 13) {
        	var all = terminalCommands.getTerminalAllContent(this);
        	terminalCommands.appendNewLineInTerminal(all,this);
        	handleCommands(getCMD(this));
        	all = '';
        	return false;
        }
	});

	//控制台textarea按下退格键时判断前4个字符是否为'$_> ',如果是则阻止删除
	$("#"+terminalConfig.EDITORID).keydown(function(event){
		if (event.keyCode === 8) {
			var cmd = getCMD(this,1);
			if(cmd === ''){
				return false;
			}
		}
	});

	//控制台命令处理函数
	var handleCommands = function(cmd) {
		var func = eval(terminalCommands.cmd);

		var cmdSplit = cmd.split(' ');
		var funcName = cmdSplit[0];
		var args = cmdSplit.shift();//数组中的第一个为主命令

		funcName = funcName.replace('\n','');

		if(funcName == 'h'){
			funcName = 'help';//因为命令行依赖的函数不能出现一个字符的情况,所以当输入为h时自动转换为help
		}

		//第二个参数是被调用函数的第一个参数
		//所有被调用函数的第一个参数都为控制台编辑器的对象
		//第二个参数为命令后面的空格数据(数组形式)
		new func (funcName,$("#"+terminalConfig.EDITORID),cmdSplit);
		
	};

	//快捷键CTRL+ALT+SAPCE,显示/关闭命令行控制台
	var fnKeyup = function(event) {
		if (event.keyCode === 32 && event.ctrlKey && event.altKey) {
			toggleTerminal();
		}
	}

	if (document.addEventListener) {
		document.addEventListener("keyup",fnKeyup,true);
	}else {
		document.attachEvent("onkeyup",fnKeyup);
	}

	//新建数据库按钮被按下
	$('#main-menu ul li#new-db').click(function(){
		modal.show('input-newdb');
	});

	//查看文档按钮被按下
	$('#main-menu ul li#view-document').click(function(){
		window.open("https://www.zybuluo.com/ivydom/note/217261");
	});

	//下载源代码
	$('#main-menu ul li#download').click(function(){
		window.open("https://github.com/leinue/mongobro");
	});

	//新建数据库表按钮被按下
	$('#main-menu ul li#new-table').click(function(){

		var currentDB = $('.file-list ul').find('li.active');
		var dbname = '';

		if(currentDB.length === 0){
			alert('请至少选择一个数据库');	
			return false;
		}

		dbname = currentDB.html();

		modal.show('input-newtable');
	});

	//数据库列表append
	var appendDBList = function(obj) {

		$('.file-list ul.first').html('');

		for (var i = 0; i <= obj.length-1; i++) {
			var tableList = mongoBro.getTableByDBName(obj[i]);
			var second = '<ul class="second">';

			if (tableList.length !== 0) {
				for (var j = tableList.length - 1; j >= 0; j--) {
					var tableName = mongoBro.getTableCollection(tableList[j]);
					second += '<li data-dbname="'+tableName['dbname']+'" data-tableName="'+tableName['tableName']+'"><div>'+tableName['tableName']+'</div></li>';
				};
			}

			second = second === '<ul class="second">' ? '' : second + '</ul>';
			// console.log('<li data-dbname="'+obj[i]+'"><div>'+obj[i]+'</div>'+second+'</li>');
			$('.file-list ul.first').append('<li data-dbname="'+obj[i]+'"><div>'+obj[i]+'</div>'+second+'</li>');
		};

	};

	//数据记录append
	var appendCollection = function(thisName) {

		var currentDataObj = mongoBro.getTableCollection(thisName);

		var currentData = currentDataObj.data;

		var collectionKeyList = mongoBro.getTableKey(currentData);

		var collectionKeyListLength = collectionKeyList.length;

		var theadHTML = '<tr><th>#</th>';

		for (var i = 0; i <= collectionKeyList.length - 1; i++) {
			var key = collectionKeyList[i];

			theadHTML += '<th>' + key + '</th>';		
		};

		theadHTML += '</tr>';

		$('#collectionList thead').html(theadHTML);

		var tbodyHTML = '<tr><td></td>';

		var primaryKeyList = [];

		if(typeof currentData != 'undefined') {
			for(var name in currentData.data) {
				var val = currentData.data[name];

				if(typeof val == 'object') {

					var count = 0;

					for(var key in val) {
						tbodyHTML += '<td data-collection-name="'+key+'" data-val=\''+JSON.stringify(val)+'\'>' + val[key] + '</td>';
						count ++;
						//保存所有的主键值,防止重复
						if(key == '_id') {
							primaryKeyList.push(val[key]);
						}
					}

					if(count < collectionKeyListLength) {
						tbodyHTML += '<td>\</td>';
					}

					tbodyHTML += '</tr><tr><td></td>';
				}else {
					tbodyHTML += '<td>'+ val +'</td>';
				}
			}

			tbodyHTML += '</tr>';

			$('#collectionList tbody').html(tbodyHTML);
			//优化DOM中存储数据的方式
			$('#collectionList tbody tr').each(function(index, elem) {
				var _this = $(elem);
				var dataVal = _this.find('td:nth-child(2)');
				if(typeof dataVal != 'undefined') {
					_this.attr('data-val', dataVal.attr('data-val'));
					_this.attr('data-main-key', JSON.stringify(primaryKeyList));
				}

				_this.find('td').each(function(i, e) {
					var curr = $(e);
					curr.attr('data-val', '');	
				});
			});
			$('#collectionList tbody tr:last-child').remove();
		}

		//底部控制按钮可用
		$('.table-toolbar #main-menu ul li').removeClass('menu-disabled');

	}

	//表格项被点击
	$(document).on('click', '#collectionList tbody tr td', function() {
		var tdIndex = $(this).index();

		var tableMethod = {

			0: function(obj) { //选择
				var _this = $(obj);
				_this.parent().toggleClass('active');

				if(typeof _this.parent().attr('data-val') == 'undefined') {
					return false;
				}
				//所有数据存储于data-val中
				var val = JSON.parse(_this.parent().attr('data-val'));
				
				if(!runtime.collection.isExists(val._id)) {
					runtime.collection.selected.push(val);
				}

			}

		};

		if(typeof tableMethod[tdIndex] != 'undefined') {
			tableMethod[tdIndex](this);
		}

	});
	
	//表格项被双击
	$(document).on('dblclick', '#collectionList tbody tr td', function() {
		var _this = $(this);
		var thisValue = _this.html();

		var thisInput = _this.find('input');

		if(thisInput.length === 0) {
			var tmpl = '<input type="text" value="'+ thisValue +'" />';
			_this.html(tmpl);
		}
	});

	//获得主键列表
	var getThisPrimaryKey = function(obj) {

		var thisPrimaryKey = obj.attr('data-main-key');

		if(typeof thisPrimaryKey == 'undefined' || thisPrimaryKey == '') {
			thisPrimaryKey = {};
		}else {
			thisPrimaryKey = JSON.parse(thisPrimaryKey);
		}

		return thisPrimaryKey;
	}

	//通过thead获取所有字段名
	//index为第几个,若省略则返回所有
	var getCollectionNameListByThead = function(index) {
		index = index == null ? -1 : index;

		var currentDataObj = mongoBro.getTableCollection(dbConfig.currentTableName);
		var currentData = currentDataObj.data;
		var collectionKeyList = mongoBro.getTableKey(currentData);

		if(index != -1) {
			return collectionKeyList[index];
		}

		return collectionKeyList;
	}

	//获得集合名称
	var getCollectionName = function(obj) {
		var collectionName = obj.attr('data-collection-name');
		if(typeof collectionName == 'undefined') {
			//如果当前项不存在data-collection-name属性则通过thead获取当前项目对应的字段名
			var index = obj.index() - 1;
			return getCollectionNameListByThead(index);
		}else {
			return obj.attr('data-collection-name');
		}
	}

	//获得当前被点击项目的所有集合
	var getDataVal = function(obj) {
		var thisJsonData = obj.attr('data-val');
		if(typeof thisJsonData != 'undefined' || thisJsonData == '') {
			var thisData = JSON.parse(thisJsonData);
		}else {
			var thisData = {};
		}
		return thisData;
	}

	var executeCollectionSaving = function(obj) {
		var _this = $(obj);
		var thisParent = _this.parent();
		var thisGrandparent = thisParent.parent();

		var thisCollectionName = getCollectionName(thisParent);

		var thisPrimaryKey = getThisPrimaryKey(thisGrandparent);
		var dataMainKey = getThisPrimaryKey(thisGrandparent);

		var thisData = getDataVal(thisGrandparent);
		var originalId = thisData._id;

		var id = thisData._id;

		var myValue = _this.val();

		if (saveTableCollection(id, thisCollectionName, myValue, thisPrimaryKey)) {
			//更新DOM

			//更新DOM属性
			thisData[thisCollectionName] = myValue;
			thisGrandparent.attr('data-val', JSON.stringify(thisData));

			if(thisCollectionName == '_id') {
				thisGrandparent.parent().find('tr').each(function(i, e) {
					var recordLength = dataMainKey.length;
					var _this = $(e);
					for (var i = 0; i < recordLength; i++) {
						var curr = dataMainKey[i];
						if(curr == originalId) {
							dataMainKey[i] = parseInt(myValue);
						}
					};
					_this.attr('data-main-key', JSON.stringify(dataMainKey));
				});
			}

			//更新DOM可见内容
			_this.parent().html(myValue);
		}
	};

	//表格项文本框被按下enter
	$(document).on('keyup', '#collectionList tbody tr td input', function(e) {
		if(e.keyCode == 13 && e.ctrlKey) {
			var _this = $(this);
			var myValue = _this.val();

			_this.parent().html('<textarea style="width:100%">' + myValue + '</textarea>');
			return false;
		}

		if(e.keyCode == 13) {
			executeCollectionSaving(this);
		}
	});

	//表格项多行文本框被按下enter + alt
	$(document).on('keyup', '#collectionList tbody tr td textarea', function(e) {
		if(e.keyCode == 13 && e.ctrlKey) {
			executeCollectionSaving(this);
		}
	});

	//底部数据表功能菜单被点击
	$('.table-toolbar #main-menu ul li').click(function() {
		var _this = $(this);

		if(_this.hasClass('menu-disabled')) {
			return false;
		}

		var tableName = getCurrentTableName();

		var clickIndex = _this.index();

		var clickMethod = {
			0: function() {//新增

				//append表格进编辑框供用户编辑

				var collectionListBody = $('#collectionList tbody');
				var collectionListBodyTr = collectionListBody.find('tr');
				var firstCollection = collectionListBodyTr[0];

				var dataMainKey = [];
				var jsonDataMainKey = '';

				var collectionNameList = getCollectionNameListByThead();
				var tmpl = '';
				var dataVal = {};

				if(typeof firstCollection != 'undefined') {
					//列表中已有项目
					dataMainKey = JSON.parse($(collectionListBodyTr[0]).attr('data-main-key'));
					dataMainKey.push(dataMainKey.length + 1);
					jsonDataMainKey = JSON.stringify(dataMainKey);
					for (var i = 0; i < collectionListBodyTr.length; i++) {
						var curr = collectionListBodyTr[i];
						$(curr).attr('data-main-key', jsonDataMainKey);
					};
				}else {
					//列表中无项目
					var tableKey = mongoBro.getTableKey(dbConfig.currentTableName);
					if(tableKey.length === 0) {
						modal.show('table-fields-new');
					}else {

					}

					return true;
				}

				for (var i = 0; i < collectionNameList.length; i++) {
					var curr = collectionNameList[i];
					if(curr == '_id') {
						tmpl += '<td class="td-new-collection"><input type="text" value="' + (dataMainKey.length) + '"></td>';
					}else {
						tmpl += '<td class="td-new-collection"><input type="text"></td>';
					}
					dataVal[curr] = "";
				};

				var result = mongoBro.insertTableCollection(dbConfig.currentDBName, dbConfig.currentTableName,dataVal);

				if(!result) {
					return false;
				}

				dataVal = JSON.stringify(dataVal);

				var tmpl = '<tr data-val=\'' + dataVal + '\' data-main-key="' + jsonDataMainKey + '"><td></td>' + tmpl;
				tmpl += '</tr>';

				collectionListBody.append(tmpl);
			},

			1: function() {//删除

				var collectionSelected = runtime.collection.selected;

				if(collectionSelected.length === 0) {
					alert('请至少选择一项');
					return false;
				}

				modal.show('delete-collection');

			},

			2: function() {//刷新

			}
		}

		clickMethod[clickIndex]();
	});

	var changeCurrentDBName = function(name) {
		$('#main-menu ul li.main-menu-title').html(name);
		dbConfig.currentDBName = name;
	};

	var changeCurrentTableName = function(name) {
		dbConfig.currentTableName = name;
		$('#main-menu ul li.main-menu-title').append(name);
	};

	var getCurrentTableName = function() {
		return dbConfig.currentTableName;
	}

	//***************************业务逻辑控制层***************************

	//读取已有数据库
	var getDBExists = function() {
		var allDB = mongoBro.getDatabases();
		console.log(allDB);
		if(allDB != null) {
			appendDBList(allDB);
		}else {
			$('.file-list ul').html('');
			$('#collectionList').html('<thead>\
				<tr>\
					<th>#</th>\
				</tr>\
			</thead>\
			<tbody>\
				<tr>\
					<td></td>\
				</tr>\
			</tbody>');
		}
	};

	getDBExists();

	//左边数据库列表被点击时触发
	function FileListClickOnStart(obj) {

	}

	//左边数据库列表被点击完毕时触发
	function FileListClickOnEnd(obj) {

		var dbname = $(obj).attr('data-dbname');

		changeCurrentDBName(dbname);

		var tableList = mongoBro.getTableByDBName(dbname);

	}

	//数据表被点击开始
	function tableListClickOnStart(obj) {

	}

	//数据表被点击结束
	function tableListClickOnEnd(obj) {
		
		var _this = $(obj);

		var thisName = _this.find('div').html();

		changeCurrentTableName(thisName);

		appendCollection(thisName);
	}

	//数据库列表右键菜单被单击时的回调函数
	function dbListRightMenuClickStart(obj) {
		var _this = $(obj);
		var type = _this.attr('id');
		var method = {
			'dblist-rename' : function() {
				var curerntDBName = dbConfig.currentRightClickDBName;

				//如果是点击了二级菜单,则读取现行表名称
				if(isDBListClick2ndLevel()) {
					var currentTableName = dbConfig.currentRightClickTableName;
					modal.show('rename-table');
					$('#rename-tablename').val(currentTableName);
					return true;
				}
				
				modal.show('rename-db');
				$('#rename-dbname').val(curerntDBName);
			},
			'dblist-delete' : function() {
				var curerntDBName = dbConfig.currentRightClickDBName;

				//如果是点击了二级菜单,则读取现行表名称
				if(isDBListClick2ndLevel()) {
					var currentTableName = dbConfig.currentRightClickTableName;
					modal.show('delete-table');
					return true;
				}

				modal.show('delete-db');
			}
		};
		method[type]();
	}

	//新建数据库确定按钮回调函数
	var createNewDB = function(id) {
		var dbname = $('#' + id).val();

		if(dbname == null){
			return false;
		}

		mongoBro.createDB(dbname);

		getDBExists();

	};

	var removeDB = function() {
		var currentDBName = dbConfig.currentRightClickDBName;

		if(currentDBName != '') {
			mongoBro.removeDB(currentDBName);
		}

		getDBExists();
	}

	//新建数据表确定按钮互调函数
	var createNewTable = function(id) {
		var tableName = $('#' + id).val();

		if(tableName == null) {
			return false;
		}

		var currentDBName = dbConfig.currentDBName;
		mongoBro.createTable(currentDBName,tableName,{});
		getDBExists();
	};

	//删除数据表
	var removeTable = function() {

		var currentTableName = dbConfig.currentRightClickTableName;
		var currentDBName = dbConfig.currentRightClickDBName;

		if(currentTableName != '') {
			mongoBro.removeTable(currentDBName,currentTableName);
		}

		getDBExists();

	}

	//修改表名称
	var renameTable = function(id) {
		var newtableName = $('#' + id).val();

		if(newtableName == null) {
			return false;
		}

		var currentTableName = dbConfig.currentRightClickTableName;
		var currentDBName = dbConfig.currentRightClickDBName;
		mongoBro.updateTable(currentDBName,currentTableName, newtableName);
		getDBExists();

	};

	//修改数据库名称
	var renameDatabase = function(id) {
		var newDBName = $('#' + id).val();

		if(newDBName == null) {
			return false;
		}

		var currentDBName = dbConfig.currentRightClickDBName;
		mongoBro.updateDB(currentDBName,newDBName);
		getDBExists();

	};

	//删除数据记录
	var removeCollection = function() {
		for (var i = 0; i < runtime.collection.selected.length; i++) {
			var id = runtime.collection.selected[i]._id;
			mongoBro.removeTableCollection(dbConfig.currentDBName,dbConfig.currentTableName,id);
		};

		runtime.collection.selected = [];
		appendCollection(getCurrentTableName());
	};

	//用户修改/增加字段保存到本地localStorage
	var saveTableCollection = function(id, collectionName, value, thisPrimaryKey) {

		if(collectionName == '_id') {
			if(isNaN(value)) {
				alert('请填写数值');
				return false;
			}
		}

		//去掉thisPrimaryKey中存在的当前值
		thisPrimaryKey.splice(thisPrimaryKey.indexOf(parseInt(id)), 1);

		if(thisPrimaryKey.indexOf(parseInt(value)) != -1) {
			alert('主键不允许重复');
			return false;
		}

		if(value < 0) {
			alert('主键不允许小于0');
			return false;
		}

		var dbname = dbConfig.currentDBName;
		var tableName = getCurrentTableName();
		return mongoBro.updateTableCollection(dbname, tableName, id, collectionName, value);

	}

	//新建数据表字段
	var addTableFields = function(id) {
		var fieldNames = $('#' + id).val();

		if(fieldNames == '') {
			alert('字段名不能为空');
			return false;
		}

		var fieldsList = fieldNames.split(',');

		var data = {};

		for (var i = 0; i < fieldsList.length; i++) {
			var curr = fieldsList[i];
			if(curr != '') {
				data[curr] = "";				
			}
		};

		mongoBro.insertTableCollection(dbConfig.currentDBName, dbConfig.currentTableName, data);
		appendCollection(getCurrentTableName());
	}

});
