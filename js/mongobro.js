(function(window){

	var isLocalStorageNull = function(key) {
		return typeof localStorage[key] == 'undefined'?true:(localStorage[key] == ''?true:false);
	};

	var mongoDB = {
		currentDBName : '',
		MongoDBNameList : '',
		MongoDBUpdated : false
	};

	var mongoDBTable = {
		MongoDBTableList : '',
		mongoDBTableUpdated : false,
	};

	function mongoBro(){
		if(!this.isMongoNull()){

		}else{
			localStorage.MongoBrowserDB = '';
		}
	}

	mongoBro.prototype.broadcastMongoDbUpdated = function() {
		mongoDB.MongoDBUpdated = true;
	}

	mongoBro.prototype.broadcastMongoDbNoUpdated = function() {
		mongoDB.MongoDBUpdated = false;
	}

	mongoBro.prototype.getDatabases = function() {
		return this.getMongoObj();
	}

	mongoBro.prototype.getMongoCount = function() {
		return this.getMongoObj().length;
	}

	mongoBro.prototype.isMongoNull = function() {
		return typeof localStorage.MongoBrowserDB == 'undefined'?true:(localStorage.MongoBrowserDB == ''?true:false);
	}

	mongoBro.prototype.getMongoObj = function(){
		if(this.isMongoNull()){
			return null;
		}

		if(mongoDB.MongoDBNameList === '' || mongoDB.MongoDBUpdated === true){
			mongoDB.MongoDBNameList = JSON.parse(localStorage.MongoBrowserDB);
			this.broadcastMongoDbNoUpdated();
		}

		return mongoDB.MongoDBNameList;
	}

	/*
	* 判断dbname是否存在
	* @param dbname
	* @return true | false;
	**/
	mongoBro.prototype.isDbExists = function(dbname) {
		return this.isExists(dbname) === false ? false : true;
	}

	mongoBro.prototype.writeMongoObj = function(str) {
		localStorage.MongoBrowserDB = JSON.stringify(str);
		this.broadcastMongoDbUpdated();
		return this;
	}

	mongoBro.prototype.createDB = function(dbname) {
		if(dbname === null || dbname === '') {
			return false;
		}

		var databasesExists = this.getMongoObj();

		if(databasesExists == null) {
			databasesExists = {};
			databasesExists[0] = dbname;
			databasesExists.length = 1;
		}else{
			if(this.isExists() === false){
				databasesExists[databasesExists.length] = dbname;
				databasesExists.length += 1;
			}
		}

		mongoDB.currentDBName = dbname;

		this.writeMongoObj(databasesExists);

		return this;
	}

	mongoBro.prototype.updateDB = function(original_name,new_name){

		var databasesNameList = this.getMongoObj();

		var nameId=this.isExists(original_name);

		if(nameId === false){
			return false;
		}else{
			databasesNameList[nameId] = new_name;
			this.writeMongoObj(databasesNameList);
			this.setCurrentDBName(new_name);
			return this;
		}
			
	}

	/*
	* 判断数据库是否存在,如果存在返回下标,否则返回false
	* @param string dbname;
	* @return i | false;
	*/

	mongoBro.prototype.isExists = function(dbname) {
		var databasesNameList = this.getMongoObj();

		for (var i = 0; i < databasesNameList.length; i++) {
			if(dbname === databasesNameList[i]){
				return i;
			}
		}

		return false;
	}

	mongoBro.prototype.use = function(dbname) {

		this.setCurrentDBName(dbname);

		if(this.isExists(dbname) === false){
			this.setCurrentDBName('');
		}
		
		return this;
	}

	mongoBro.prototype.getCurrentDBName = function(){
		return mongoDB.currentDBName;
	}

	mongoBro.prototype.setCurrentDBName = function(dbname){
		mongoDB.currentDBName = dbname;
	}

	mongoBro.prototype.removeDB = function(dbname) {

		var nameId = this.isExists(dbname);

		if(nameId === false){
			return false;
		}

		var databasesNameList = this.getMongoObj();

		delete databasesNameList[nameId];
		databasesNameList.length-=1;
		this.writeMongoObj(databasesNameList);

		if(this.getCurrentDBName() === dbname){
			this.setCurrentDBName('');
		}

		return this;

	}

	mongoBro.prototype.removeAllDatabases = function() {
		localStorage.MongoBrowserDB = '';
		this.removeAlltableList();
		return this;
	}

	mongoBro.prototype.isTableNull = function() {
		return isLocalStorageNull('MongoDBTableList');
	}

	mongoBro.prototype.writeMongoTableDB = function(obj) {
		localStorage['MongoDBTableList'] = JSON.stringify(obj);
		this.broadcastMongoDbTableUpdated();
	}

	mongoBro.prototype.addTableList = function(database,tableName) {

		if(tableName === null || tableName === '') {
			return false;
		}

		var tableExists = this.getTableList();

		if(tableExists === null || tableExists === '') {
			tableExists = {};
			tableExists.length = 1;
			tableExists[0] = {
				tableName : tableName,
				database : database
			};
		}else{
			tableExists[tableExists.length] = {
				tableName : tableName,
				database : database				
			};
			tableExists.length += 1;
		}

		this.writeMongoTableDB(tableExists);

		return this;

	}

	mongoBro.prototype.removeTableList = function(dbname,tableName) {

		var tableNameId = this.isTableExists(dbname,tableName);

		if(tableNameId === false) {
			return false;
		}

		var tableList = this.getTableList();

		if(tableList === null) {
			return false;
		}

		delete tableList[tableNameId];
		tableList.length -= 1;
		this.writeMongoTableDB(tableList);

		return this;

	}

	mongoBro.prototype.removeAlltableList = function(){

		localStorage['MongoDBTableList'] = '';

		return this;
	}

	mongoBro.prototype.updateTableList = function(dbname,oldName,newName) {
		
		if(oldName === null || oldName === '' || newName === null || newName === ''){
			return false;
		}

		var tableNameId = this.isTableExists(dbname,oldName);

		if(tableNameId === false) {
			return false;
		}

		var tableList = this.getTableList();

		tableList[tableNameId].tableName = newName;

		this.writeMongoTableDB(tableList);

		return this;
	}

	mongoBro.prototype.getTableList = function() {

		if(this.isTableNull()) {
			return null;
		}

		if(this.isTableUpdated()) {
			var tableList = JSON.parse(localStorage['MongoDBTableList']);
			mongoDBTable.MongoDBTableList = tableList;
			this.broadcastMongoDbTableNoUpdated();
		}else{
			if(mongoDBTable.MongoDBTableList === ''){
				var tableList = JSON.parse(localStorage['MongoDBTableList']);
				mongoDBTable.MongoDBTableList = tableList;
				this.broadcastMongoDbTableNoUpdated();	
			}
			var tableList = mongoDBTable.MongoDBTableList;
		}
		
		return tableList;

	}

	mongoBro.prototype.isTableUpdated = function() {
		return mongoDBTable.mongoDBTableUpdated;
	}

	mongoBro.prototype.broadcastMongoDbTableUpdated = function() {
		mongoDBTable.mongoDBTableUpdated = true;
	}

	mongoBro.prototype.broadcastMongoDbTableNoUpdated = function() {
		mongoDBTable.mongoDBTableUpdated = false;
	}

	mongoBro.prototype.createTable = function(dbname,tableName,data) {

		dbname = dbname === null ? getCurrentDBName() : dbname;

		if(dbname === null || dbname === '' || tableName === '' || tableName === null ){
			return false;
		}

		data = data === null ? '': data;

		var dbnameId = this.isExists(dbname);

		if(dbnameId === false){
			return false;
		}else{

			for(var key in data) {
				data[key]._id = parseInt(key) + 1;
			}

			var tableObj = {
				dbname : dbname,
				tableName : tableName,
				data : {
					data
				}
			};

			this.addTableList(dbname,tableName);

			localStorage[tableName] = JSON.stringify(tableObj);
		}

		return this;
	}

	mongoBro.prototype.isTableExists = function(dbname,tableName) {
		
		var tableList = this.getTableList();

		if(tableList === null) {
			return false;
		}

		if(this.isExists(dbname) === false) {
			return false;
		}

		for (var i = 0; i < tableList.length; i++) {
			if(tableList[i].tableName === tableName && tableList[i].database === dbname) {
				return i;
			}
		};

		return false;

	}

	mongoBro.prototype.updateTable = function(dbname,oldName,newName) {

		var res = this.updateTableList(dbname,oldName,newName);

		if(res !== false) {
			var currentTableObj = JSON.parse(localStorage[oldName]);
			currentTableObj.tableName = newName;
			localStorage[newName] = JSON.stringify(currentTableObj);
			localStorage[oldName] = '';
		}else {
			return false;
		}

		return this;

	}

	mongoBro.prototype.removeTable = function(dbname,tableName) {

		var tableNameId = this.isTableExists(dbname,tableName);

		if(tableNameId === false) {
			return false;
		}

		this.removeTableList(dbname,tableName);

		localStorage[tableName] = '';

		return this;

	}

	mongoBro.prototype.getTableByDBName = function(dbname) {

		var tableList = this.getTableList();

		var result = [];

		for (var key in tableList) {
			if(typeof tableList[key] == 'object') {
				var tableObj = tableList[key];
				var databaseName = tableObj.database;
				if(databaseName == dbname){
					result.push(tableObj.tableName);
				}
			}
			
		};

		return result;
	}

	mongoBro.prototype.getTableCollection = function(tableName) {
		if( typeof localStorage[tableName] != 'undefined') {
			return JSON.parse(localStorage[tableName]);
		}
		return false;
	}

	mongoBro.prototype.getTableCollectionBy = function(dbname, tableName, key, val, like) {

		like = like == null ? false: true;

		if(dbname == null || tableName == null || key == null) {
			return false;
		}

		var collection = [];
		var flag = 0;

		var data = this.getTableCollection(tableName).data.data;
		for (var i = 0; i < data.length; i++) {
			var curr = data[i];
			if(key == '_id') {
				//主键要做特殊搜索
				if(curr[key] == val) {
					collection.push(curr);
					flag ++;			
				}
			}else {
				//字符串要做模糊查询,待定
				if(like) {
					//使用模糊查询
				}else {
					//不使用模糊查询
				}
			}
		};

		if(flag === 0 ) {
			return false;
		}

		return collection;
	}

	mongoBro.prototype.getTableCollectionById = function(dbname, tableName, val) {
		return this.getTableCollectionBy(dbname, tableName, '_id', val);
	}

	mongoBro.prototype.removeTableCollection = function(dbname, tableName, id) {

		if(dbname == null || tableName == null || id == null) {
			return false;
		}

		var dataExists = this.getTableCollection(tableName);
		var realData = dataExists.data.data;

		var realID = '';

		for (var i = 0; i < realData.length; i++) {
			var curr = realData[i];
			if(curr._id === id) {
				realID = i;
				break;
			}
		};

		if(realID === '') {
			return false;
		}

		dataExists.data.data.splice(realID,1);

		localStorage[tableName] = JSON.stringify(dataExists);

	}

	mongoBro.prototype.updateTableCollection = function(dbname, tableName, id, collectionName, value) {

		if(dbname == null || tableName == null || id == null) {
			return false;
		}

		if(collectionName == null || value == null) {
			return this;
		}

		if(collectionName == '_id') {
			if(isNaN(value)) {
				return false;
			}
		}

		var dataExists = this.getTableCollection(tableName);
		var realData = dataExists.data.data;
		
		if(id === 0) {
			id ++;//mongobro中主键从1开始
		}

		var datsLength = realData.length;

		if(typeof datsLength == 'undefined') {
			datsLength = this.getObjLength(realData);
		}

		for (var i = 0; i < datsLength; i++) {
			var curr = realData[i];
			if(curr._id == id) {
				realData[i][collectionName] = value;
				break;
			}
		};

		localStorage[tableName] = JSON.stringify(dataExists);

		return this;

	}

	/*
	* 通过对象方式更新集合
	* @param string dbname, string tableName, int id, object obj
	* @return false | this
	**/

	mongoBro.prototype.updateTCByObject = function(dbname, tableName, id, obj) {

		if(tableName == null || dbname == null || id == null || obj == null) {
			return false;
		}

		if(!this.isDbExists(dbname)) {
			return false;
		}

		if(!this.isTableExists(dbname, tableName)) {
			return false;
		}

		if(typeof obj != 'object') {
			return false;
		}

		if(isNaN(id)) {
			return false;
		}

		var keyList = this.getObjKey(obj);

		var dataExists = this.getTableCollection(tableName);
		var realData = dataExists.data.data;

		//查找对应id是否存在
		var isCollectionExists = function(obj) {
			return obj.getTableCollectionById(dbname, tableName, id);
		}(this);

		if(isCollectionExists) {
			//存在该id
			var keyListEx = this.getObjKey(realData[0]);
			keyListEx.pop();

			var likeCount = 0;
			var count = keyListEx.length;
			for (var i = 0; i < keyList.length; i++) {
				var curr = keyList[i];
				likeCount ++;
				//如果有对应字段则直接做修改操作
				//如果没有对应字段则进行添加字段和值操作(添加部分直接向对象加入键)
				for (var j = 0; j < realData.length; j++) {
					var currData = realData[j];
					if(currData._id === id) {
						currData[curr] = obj[curr];
					}
				};
			};

			localStorage[tableName] = JSON.stringify(dataExists);
		}else {
			//不存在该id,直接进行加入操作
			return this.insertTableCollection(dbname, tableName, obj);
		}

		return this;

	}

	//获得集合对象的key
	mongoBro.prototype.getObjKey = function(o) {
		if(typeof o != 'object') {
			return false;
		}

		var keyList = [];

		for (var key in o) {
			keyList.push(key);
		};

		return keyList;
	}

	mongoBro.prototype.insertTableCollection = function(dbname, tableName, data, isAddKey) {

		if(dbname == null || tableName == null || data == null ) {
			return false;
		}

		isAddKey = isAddKey == null ? false : isAddKey;

		//add key to person_edit2 in test set fuck,shit

		var dataExists = this.getTableCollection(tableName);
		var realData = dataExists.data.data;

		if(typeof realData != 'undefined') {
			var dataCount = realData.length;

			if(typeof dataCount == 'undefined') {
				dataCount = this.getObjLength(realData);
			}

			var realDataLength = dataExists.data.data.length;

			if(typeof realDataLength == 'undefined') {
				realDataLength = this.getObjLength(dataExists.data.data);
			}

			for (var i = 0; i < realDataLength; i++) {
				for (var key in data) {
					var currValue = data[key];
					if(typeof dataExists.data.data[i][key] == 'undefined') {
						dataExists.data.data[i][key] = currValue;
					}
				};
			};
		}else {
			var dataCount = 0;
			dataExists.data.data = [];
		}

		if(!isAddKey || dataCount === 0) {
			dataExists.data.data[dataCount] = data;
			dataExists.data.data[dataCount]._id = dataCount + 1;
		}

 		localStorage[tableName] = JSON.stringify(dataExists);

		return this;
	}

	mongoBro.prototype.getObjLength = function(obj) {
		var count = 0;
		for(var key in obj) {
			count ++;
		}
		return count;
	}

	mongoBro.prototype.getTableKey = function(tableCollection) {
		var collectionList = [];
		if(typeof tableCollection != 'undefined') {
			for(var name in tableCollection.data) {
				if(typeof tableCollection.data == 'object') {
					var dataLength = tableCollection.data.length;
					if(typeof dataLength == 'undefined') {
						dataLength = this.getObjLength(tableCollection.data);						
					}
					for (var i = 0; i < dataLength; i++) {
						var currentTableCollection = tableCollection.data[i];
						for(var key in currentTableCollection) {
							collectionList.push(key);
						}
						break;
					};
					break;
				}else {
					collectionList.push(name);
				}
			}

			return collectionList;
		}

		return false;
		
	},

	mongoBro.prototype.addTableKey = function(dbname, tableName, keyList, valueList) {

		var tmp = {};

		if(keyList == null) {
			return false;
		}

		if(keyList.length != valueList.length || typeof keyList == 'undefined') {
			valueList = [];
			for (var i = 0; i < keyList.length; i++) {
				valueList.push('');
			};
		}

		for (var i = 0; i < keyList.length; i++) {
			var currKey = keyList[i];
			tmp[currKey] = valueList[i];
		};

		this.insertTableCollection(dbname, tableName, tmp, true);
	}

	window.mongoBro = new mongoBro();

})(window);

var rollback = function(remove) {

	remove = remove == null ? false : remove;

	mongoBro.removeAllDatabases();

	console.log(mongoBro.createDB('test').getDatabases());

	console.log(mongoBro.createDB('fuck').getDatabases());

	console.log(mongoBro.updateDB('fuck','bitch').getDatabases());

	console.log(mongoBro.getCurrentDBName());

	console.log(mongoBro.removeDB('bitch').getDatabases());

	console.log(mongoBro.use('test').getCurrentDBName());

	console.log(mongoBro.createTable('test','person').getTableCollection('person'));

	console.log(mongoBro.getTableList());

	console.log(mongoBro.createTable('test','xieyang',
		[{
		name : 'xieyang',
		sex : 'malemalemalemalemalemalemalemalemalemalemalemalemalemalemalemalemalemalemalemalemalemalemalemalemalemalemalemalemalemalemalemalemalemalemalemalemalemalemalemalemalemalemalemalemalemalemalemalemalemalemalemalemalemalemalemalemalemalemalemale' 
	},{
		name: 'lanjia',
		sex: 'male'
	}]).getTableCollection('xieyang'));
		
	var tableInTest = mongoBro.getTableByDBName('test');

	console.log(tableInTest);

	console.log('输出test数据库中的表数据');

	for (var i = 0; i < tableInTest.length; i++) {
		console.log(mongoBro.getTableCollection(tableInTest[i]));
	};

	console.log('向test表中插入数据');

	console.log(mongoBro.insertTableCollection('test', 'xieyang', {
		name: 'hh',
		sex: '233'
	}));

	console.log('更新test表数据库名为xieyang中主键为1的name字段');

	console.log(mongoBro.updateTableCollection('test', 'xieyang', 1, 'name', 'xuqianying').getTableList());

	console.log('更新test表数据库名为xieyang中主键为2的name字段');

	console.log(mongoBro.updateTableCollection('test', 'xieyang', 2, 'name', 'xieyang').getTableList());

	console.log('以对象的方式修改test表中数据库名为xieyang中主键为2的集合');

	console.log(mongoBro.updateTCByObject('test', 'xieyang', 1, {
		name: '蛤蛤',
		sex: 'LGBT'
	}));

	console.log('修改person表的名称');

	console.log(mongoBro.updateTable('test','person','person_edit2').getTableList());

	if(remove) {
		console.log(mongoBro.removeTable('test','person_edit2').getTableList());
	}

}

//// rollback();
