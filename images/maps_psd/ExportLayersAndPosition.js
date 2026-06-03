// adapted from https://retropie.org.uk/forum/topic/16580/photoshop-script-for-getting-size-and-position-of-layers
#target photoshop
var levelID;
var worldID;
var stageID;
var arrWorlds = ['null','Grass Land','Ripple Field','Sand Canyon','Cloudy Park','Iceberg'];
var wholeLevel;
main();
function main(){
	if(!documents.length) return;

	var myWidth = app.activeDocument.width.toString().replace(' px', '');
	var myHeight = app.activeDocument.height.toString().replace(' px', '');

	var Info = getNamesPlusIDs();
	var Name = app.activeDocument.name.replace(/\.[^\.]+$/, '');
	var path = app.activeDocument.path;
	levelID = app.activeDocument.name.replace(".psd","");
	worldID = levelID.substr(0,1);
	stageID = levelID.substr(2,1);
	wholeLevel = arrWorlds[worldID] + " " + stageID
	
	//create individual level file
	var file = new File(path + "/" + levelID + ".json");
	file.open("w", "TEXT", "????");
	
	//create or open overview world file
	var worldFile = new File(path + "/level" + worldID + ".json");
	if (stageID == '1') {
		worldFile.open("w", "TEXT", "????");
		var worldFileHeader = '[';
		worldFileHeader += '\n\t{';
		worldFileHeader += '\n\t\t"name": "Level ' + worldID + ': ' + arrWorlds[worldID] + '"';
		worldFileHeader += '\n\t\t"children": [';
		worldFile.writeln(tabsToSpaces(worldFileHeader));
	}
	else {
		worldFile.open("a", "TEXT", "????");
	}
	var worldFileContent = '\t\t\t{';
	worldFileContent += '\n\t\t\t\t"name": "' + levelID + '",';
	worldFileContent += '\n\t\t\t\t"access_rules": [';
	worldFileContent += '\n\t\t\t\t\t//"11"';
	worldFileContent += '\n\t\t\t\t],';
	worldFileContent += '\n\t\t\t\t"sections": [';
	var worldFileContentFooter = '\n\t\t\t\t],';
	worldFileContentFooter += '\n\t\t\t}';
	if (stageID < 6) {
			worldFileContentFooter += ',';
	}
	var worldFileFooter = '\n\t\t]';
	worldFileFooter += '\n\t}';
	worldFileFooter += '\n]';
	
	//create or open location mapping file
	var locationsFile = new File(path + "/LocationsList.txt");
	if (levelID == '1-1') {
		locationsFile.open("w", "TEXT", "????");
	}
	else {
		locationsFile.open("a", "TEXT", "????");
	}
	locationsFile.writeln("-- " + levelID);
	$.os.search(/windows/i)	!= -1 ? file.lineFeed = 'windows' : file.lineFeed = 'macintosh';
	var locationCount = Info.length;
	var locationHeader = '[';
	locationHeader += '\n\t{';
	locationHeader += '\n\t\t"name": "' + levelID + '",';
	locationHeader += '\n\t\t"children":';
	locationHeader += '\n\t\t[';
	file.writeln(tabsToSpaces(locationHeader));
	
	var i = 0;
	for(var a in Info) { 
		//loop over each layer. Each layer is a child of the level and represents a location square.
		i++;
		var starCheck = false;
		locationName = capitalizeLayerName(Info[a][0]);
		if (locationName == 'Stage') { continue; }
		if (locationName == 'Background') { continue; }
		if (locationName == 'Location Block') { continue; }
		if (locationName.toUpperCase == 'DOOR LINKS') { continue; }
		var autoscrollerCheck = locationName.toUpperCase();
		autoscrollerCheck = autoscrollerCheck.replace("^","").replace("<","").replace(">","").replace("V","").replace("#","");
		if (autoscrollerCheck == "AUTOSCROLLER") { continue; }
		if (locationName.indexOf('Star ') == 0) {
			starCheck = true;
		}
		var locationX = (Number(Info[a][1])+8);
		var locationY = (Number(Info[a][2])+8);
		var locationString = "";
		var sectionName = locationName;
		if (sectionName.indexOf('Star') == 0 && (sectionName.indexOf(',') != -1 || sectionName.indexOf('-') != -1)) {
			sectionName = sectionName.replace('Star','Stars');
		}
		locationString += '\t\t\t{'; //open bracket for children/squares array element
		locationString += '\n\t\t\t\t"name": "' + sectionName + '",';
		
		// We can add access/visibility/icon rules here for whole squares if all/most items share
		// We probably won't because A FEW TIMES it overlaps with consumables
		if (starCheck) {
			locationString += '\n\t\t\t\t"chest_unopened_img": "images/StarSmall.png",';
			locationString += '\n\t\t\t\t"chest_opened_img": "images/StarSmallDim.png",';
			locationString += '\n\t\t\t\t"visibility_rules": ["Starsanity"],';
			locationString += buildAccessList(locationName, levelID);
		}
/*
		if (locationName.indexOf('Tomato') >= 0) {
			locationString += '\n\t\t\t\t"chest_unopened_img": "images/MaximTomato.png",';
			locationString += '\n\t\t\t\t"chest_opened_img": "images/MaximTomatoDim.png",';
			locationString += '\n\t\t\t\t"visibility_rules": ["Consumables"],';
			locationString += buildAccessList(locationName, levelID);
		}
		if (locationName.indexOf('1-Up') >= 0) {
			locationString += '\n\t\t\t\t"chest_unopened_img": "images/1Up.png",';
			locationString += '\n\t\t\t\t"chest_opened_img": "images/1UpDim.png",';
			locationString += '\n\t\t\t\t"visibility_rules": ["Consumables"],';
			locationString += buildAccessList(locationName, levelID);
		}
*/
		
		
		// Start map location block: defines where the square appears
		locationString += '\n\t\t\t\t"map_locations":';
		locationString += '\n\t\t\t\t[';
		locationString += '\n\t\t\t\t\t{';
		locationString += '\n\t\t\t\t\t\t"map": "' + levelID + '",';
		locationString += '\n\t\t\t\t\t\t"x": ' + locationX + ',';
		locationString += '\n\t\t\t\t\t\t"y": ' + locationY + '';
		locationString += '\n\t\t\t\t\t}';
		locationString += '\n\t\t\t\t],';
		// End map location block
		// "sections" is an array of individual items/checks inside the location square
		// this is where we parse layers into individual stars/items
		locationString += '\n\t\t\t\t"sections":';
		locationString += '\n\t\t\t\t['; //open sections array
		//theoretical loop start
		if (starCheck) { //Starts with 'star', check for parse method
			var starList = locationName.split(' ')[1];
			if (starList.indexOf('-') != -1) { //range of stars, iterate
				var starRange = starList.split('-');
				var startID = +starRange[0];
				var endID = +starRange[1];
				for (j = startID; j <= endID; j++) {
					var itemName = 'Star ' + j;
					locationString += addLocation(itemName, (j < endID));
					worldFileContent += addOverworldLocation(itemName, sectionName, (j < endID));
					locationsFile.writeln(createStarLocation(levelID, sectionName, itemName));
				}
			} //end of -range condition
			else { //single star or comma delimited list
				var starIDs = starList.split(',');
				for(j = 0; j < starIDs.length; j++) {
					var itemName = 'Star ' + starIDs[j];
					locationString += addLocation(itemName, (j+1 < starIDs.length));
					worldFileContent += addOverworldLocation(itemName, sectionName, (j+1 < starIDs.length));
					locationsFile.writeln(createStarLocation(levelID, sectionName, itemName));
				}
			}
		}
		else { //not a star, just re-use the square's title
			locationString += addLocation(locationName, false);
		}
		locationString += '\n\t\t\t\t]'; //close sections array
		locationString += '\n\t\t\t}'; //close bracket for children/squares array element
		//file.writeln(locationName + ', ', + i + '/' + locationCount);
		if (i < locationCount) {
			locationString += ',';
		}
		
		file.writeln(tabsToSpaces(locationString));
	} //END LOOP
	var locationFooter = '\t\t]';
	locationFooter += '\n\t}';
	locationFooter += '\n]';
	file.writeln(tabsToSpaces(locationFooter));
	file.close();
	worldFileContent += worldFileContentFooter;
	worldFile.writeln(tabsToSpaces(worldFileContent));
}
function getNamesPlusIDs(){
	var ref = new ActionReference();
	ref.putEnumerated( charIDToTypeID('Dcmn'), charIDToTypeID('Ordn'), charIDToTypeID('Trgt') );
	var count = executeActionGet(ref).getInteger(charIDToTypeID('NmbL')) +1;
	var Names=[];
	try{
		activeDocument.backgroundLayer;
		var i = 0; }catch(e){ var i = 1; };
	for(i;i<count;i++){
		if(i == 0) continue;
		ref = new ActionReference();
		ref.putIndex( charIDToTypeID( 'Lyr ' ), i );
		var desc = executeActionGet(ref);
		var layerName = desc.getString(charIDToTypeID('Nm  '));
		var Id = desc.getInteger(stringIDToTypeID( 'layerID' ));
		if(layerName.match(/^<\/Layer group/) ) continue;
		var vMask = desc.getBoolean(stringIDToTypeID('hasVectorMask' ));
		try{
			var adjust = typeIDToStringID(desc.getList (stringIDToTypeID('adjustment')).getClass (0));
			if(vMask == true){
				adjust = false;
				var Shape = true;
			}
		}catch(e){var adjust = false; var Shape = false;}
		var layerType = typeIDToStringID(desc.getEnumerationValue( stringIDToTypeID( 'layerSection' )));
		var isLayerSet =( layerType == 'layerSectionContent') ? false:true;
		var Vis = desc.getBoolean(stringIDToTypeID( 'visible' ));
		var descBounds = executeActionGet(ref).getObjectValue(stringIDToTypeID( "bounds" ));
		var X = descBounds.getUnitDoubleValue(stringIDToTypeID('left'));
		var Y = descBounds.getUnitDoubleValue(stringIDToTypeID('top'));
		var Wt = descBounds.getUnitDoubleValue(stringIDToTypeID('width'));
		var Ht = descBounds.getUnitDoubleValue(stringIDToTypeID('height'));
		if(Vis && !isLayerSet && !adjust) Names.push([[layerName],[X],[Y], [Wt], [Ht]]);
	};
	return Names;
};
function capitalizeLayerName(layerName) {
	var capitalName = layerName.toString();
	capitalName = capitalName.replace("stage", "Stage");
	capitalName = capitalName.replace("background", "Background");
	capitalName = capitalName.replace("location block", "Location Block");
	capitalName = capitalName.replace("heart star mission", "Heart Star Mission");
	capitalName = capitalName.replace("star", "Star");
	capitalName = capitalName.replace("tomato", "Maxim Tomato");
	capitalName = capitalName.replace("1-up", "1-Up");
	capitalName = capitalName.replace("burning", "Burning");
	capitalName = capitalName.replace("fire", "Burning");
	capitalName = capitalName.replace("Fire", "Burning");
	capitalName = capitalName.replace("stone", "Stone");
	capitalName = capitalName.replace("ice", "Ice");
	capitalName = capitalName.replace("needle", "Needle");
	capitalName = capitalName.replace("clean", "Clean");
	capitalName = capitalName.replace("parasol", "Parasol");
	capitalName = capitalName.replace("spark", "Spark");
	capitalName = capitalName.replace("cutter", "Cutter");
	capitalName = capitalName.replace("level clear", "Level Clear");
	capitalName = capitalName.replace("block", "Block");
	capitalName = capitalName.replace("current", "Current");
	capitalName = capitalName.replace("Currents", "Current");
	capitalName = capitalName.replace("Current", "Currents");
	//capitalName = capitalName.replace("open", "Open");
	capitalName = capitalName.replace(" (open)", "");
	capitalName = capitalName.replace(" (floor)", "");
	return capitalName;
}

function tabsToSpaces(input) {
	while(input.indexOf('\t') != -1) {
		input = input.replace('\t','    ');
	}
	return input;
}

function rawHeaders(filevar) {
	var headerStr = "";
	headerStr += "LevelID";
	headerStr += "LocationName";
	headerStr += "X";
	headerStr += "Y";
	filevar.writeln(headerStr);
}

function addLocation(locationName, notLast) {
	var locationString = "";
	locationString += '\n\t\t\t\t\t{'; //open check
	locationString += '\n\t\t\t\t\t\t"name": "' + locationName + '"';
	//locationString += '\n\t\t\t\t\t\t"item_count": 1';
	if (locationName.indexOf('Tomato') >= 0 || locationName.indexOf('1-Up') >= 0) {
		locationString += ',\n\t\t\t\t\t\t"ref": "' + 'Level ' + levelID.substr(0,1) + '/' + levelID + '/' + wholeLevel + " - " + locationName + '"';
	}
	locationString += '\n\t\t\t\t\t}'; //close check
	if (notLast) { locationString += ',' }
	
	return locationString;
}

function addOverworldLocation(locationName, sectionName, notLast) {
	var locationString = "";
	locationString += '\n\t\t\t\t\t{'; //open check
	//locationString += '\n\t\t\t\t\t\t"name": "' + locationName + '",';
	var checkName = sectionName;
	if (sectionName.indexOf('-') >= 0 || sectionName.indexOf(',') >= 0) {
		checkName = locationName;
		if (sectionName.indexOf('(') >=0) {
			checkName += ' ' + sectionName.substring(sectionName.indexOf('('),sectionName.lastIndexOf(')')+1);
		}
	}
	locationString += '\n\t\t\t\t\t\t"name": "' + checkName + '",';
	locationString += '\n\t\t\t\t\t\t"ref": "' + levelID + '/' + sectionName + '/' + locationName + '",';
	//locationString += '\n\t\t\t\t\t\t"item_count": 1';
	locationString += '\n\t\t\t\t\t}'; //close check
	//if (notLast) { locationString += ',' }
	locationString += ',';
	
	return locationString;
}

function buildAccessList(locationName, levelID) {
	var returnString = '';
	var arrAccess = ['Burning','Stone','Ice','Needle','Clean','Parasol','Spark','Cutter','Currents'];
	var arrAccessList = new Array();
	var yellowAccess = '';
	for (i=0; i < arrAccess.length; i++) {
		var powerReq = arrAccess[i];
		if (locationName.indexOf(powerReq) >= 0) {
			if (powerReq == 'Currents') {powerReq = 'Kine';}
			arrAccessList.push(powerReq);
		}
	}
	switch(levelID) {
		case '2-5':
			if ( locationName.indexOf('Star') != -1 ) {
				var starID = locationName.replace('Star ','');
				//var arrEarlyStars = ['1','2','3','4','5','6'];
				//19-31
				//38,39,40
				//41,42 start the Kine requirement
				if (!(1 <= starID && starID <=6 || 19 <= starID && starID <= 31 || 38 <= starID && starID <= 40)) {
					arrAccessList.push('Kine');
				}
			}
/*			if ( locationName.indexOf('Exit') != -1 ) {
				arrAccessList.push('Kine')
			}
			if ( locationName.indexOf('Currents') != -1 ) {
				arrAccessList.push('Burning');
				arrAccessList.push('Stone');
			}
*/
			break;
		case '3-5':
			if ( locationName.indexOf('(Ice)') != -1 ) {
				returnString = '\n\t\t\t\t"access_rules":';
				returnString += '\n\t\t\t\t[';
				returnString += '\n\t\t\t\t\t' + '"Ice,Rick","Ice,Coo","Ice,Nago","Ice,ChuChu","Ice,Pitch",';
				returnString += '\n\t\t\t\t\t' + '"[Rick],[Coo],[Nago],[ChuChu],[Pitch],Ice,Kine"';
				returnString += '\n\t\t\t\t],';
				return returnString;
			}
			if ( locationName.indexOf('Star') != -1 ) {
				var starID = locationName.replace('Star ','');
				if ( starID == 21 || starID == 22 )
				{
					arrAccessList.push('Chuchu');
				}
			}
			break;
		case '4-4':
			if ( locationName.indexOf('Star') != -1 )
			{
				var starID = locationName.replace('Star ','');
				if ( (starID <= 30) || (44 <= starID && starID <= 50) )
				{
					arrAccessList.push('Coo');
					//yellowAccess = '"[Coo]"';
				}
			}
			break;
		case '4-6':
			if (locationName.indexOf('Burning') >= 0) {
				returnString = '\n\t\t\t\t"access_rules": ';
				//returnString += '["Ice","[Ice],Burning"],';
				returnString += '["Burning"],';
				return returnString;
			}
			break;
		case '5-4':
			if (locationName.indexOf('Star') >= 0) {
				arrAccessList.push('Burning');
			}
			break;
	}
	if (arrAccessList.length > 0) {
		returnString += '\n\t\t\t\t"access_rules": ["' + arrAccessList.toString() + '"';
		if (yellowAccess != '') {
				returnString += ',' + yellowAccess;
		}
		returnString +='],';
	}
	return returnString;
}

function createStarLocation(map, square, item) {
	//var format = '{"@Level 1/1-1/Loose Stars","@Level 1/1-1/Grass Land 1 - Star 1"}';
	var format = '    [%5]={"@%2/%3/%4","@Level %1/%2/Stars"},';
	var world = map.slice(0,1);
	var starray = [];
	starray['1-1 Star 1'] = '0x770401';
	starray['1-1 Star 2'] = '0x770402';
	starray['1-1 Star 3'] = '0x770403';
	starray['1-1 Star 4'] = '0x770404';
	starray['1-1 Star 5'] = '0x770405';
	starray['1-1 Star 6'] = '0x770406';
	starray['1-1 Star 7'] = '0x770407';
	starray['1-1 Star 8'] = '0x770408';
	starray['1-1 Star 9'] = '0x770409';
	starray['1-1 Star 10'] = '0x77040a';
	starray['1-1 Star 11'] = '0x77040b';
	starray['1-1 Star 12'] = '0x77040c';
	starray['1-1 Star 13'] = '0x77040d';
	starray['1-1 Star 14'] = '0x77040e';
	starray['1-1 Star 15'] = '0x77040f';
	starray['1-1 Star 16'] = '0x770410';
	starray['1-1 Star 17'] = '0x770411';
	starray['1-1 Star 18'] = '0x770412';
	starray['1-1 Star 19'] = '0x770413';
	starray['1-1 Star 20'] = '0x770414';
	starray['1-1 Star 21'] = '0x770415';
	starray['1-1 Star 22'] = '0x770416';
	starray['1-1 Star 23'] = '0x770417';
	starray['1-2 Star 1'] = '0x770418';
	starray['1-2 Star 2'] = '0x770419';
	starray['1-2 Star 3'] = '0x77041a';
	starray['1-2 Star 4'] = '0x77041b';
	starray['1-2 Star 5'] = '0x77041c';
	starray['1-2 Star 6'] = '0x77041d';
	starray['1-2 Star 7'] = '0x77041e';
	starray['1-2 Star 8'] = '0x77041f';
	starray['1-2 Star 9'] = '0x770420';
	starray['1-2 Star 10'] = '0x770421';
	starray['1-2 Star 11'] = '0x770422';
	starray['1-2 Star 12'] = '0x770423';
	starray['1-2 Star 13'] = '0x770424';
	starray['1-2 Star 14'] = '0x770425';
	starray['1-2 Star 15'] = '0x770426';
	starray['1-2 Star 16'] = '0x770427';
	starray['1-2 Star 17'] = '0x770428';
	starray['1-2 Star 18'] = '0x770429';
	starray['1-2 Star 19'] = '0x77042a';
	starray['1-2 Star 20'] = '0x77042b';
	starray['1-2 Star 21'] = '0x77042c';
	starray['1-3 Star 1'] = '0x77042d';
	starray['1-3 Star 2'] = '0x77042e';
	starray['1-3 Star 3'] = '0x77042f';
	starray['1-3 Star 4'] = '0x770430';
	starray['1-3 Star 5'] = '0x770431';
	starray['1-3 Star 6'] = '0x770432';
	starray['1-3 Star 7'] = '0x770433';
	starray['1-3 Star 8'] = '0x770434';
	starray['1-3 Star 9'] = '0x770435';
	starray['1-3 Star 10'] = '0x770436';
	starray['1-3 Star 11'] = '0x770437';
	starray['1-3 Star 12'] = '0x770438';
	starray['1-3 Star 13'] = '0x770439';
	starray['1-3 Star 14'] = '0x77043a';
	starray['1-3 Star 15'] = '0x77043b';
	starray['1-3 Star 16'] = '0x77043c';
	starray['1-3 Star 17'] = '0x77043d';
	starray['1-3 Star 18'] = '0x77043e';
	starray['1-3 Star 19'] = '0x77043f';
	starray['1-3 Star 20'] = '0x770440';
	starray['1-3 Star 21'] = '0x770441';
	starray['1-3 Star 22'] = '0x770442';
	starray['1-3 Star 23'] = '0x770443';
	starray['1-3 Star 24'] = '0x770444';
	starray['1-3 Star 25'] = '0x770445';
	starray['1-3 Star 26'] = '0x770446';
	starray['1-3 Star 27'] = '0x770447';
	starray['1-3 Star 28'] = '0x770448';
	starray['1-3 Star 29'] = '0x770449';
	starray['1-3 Star 30'] = '0x77044a';
	starray['1-3 Star 31'] = '0x77044b';
	starray['1-4 Star 1'] = '0x77044c';
	starray['1-4 Star 2'] = '0x77044d';
	starray['1-4 Star 3'] = '0x77044e';
	starray['1-4 Star 4'] = '0x77044f';
	starray['1-4 Star 5'] = '0x770450';
	starray['1-4 Star 6'] = '0x770451';
	starray['1-4 Star 7'] = '0x770452';
	starray['1-4 Star 8'] = '0x770453';
	starray['1-4 Star 9'] = '0x770454';
	starray['1-4 Star 10'] = '0x770455';
	starray['1-4 Star 11'] = '0x770456';
	starray['1-4 Star 12'] = '0x770457';
	starray['1-4 Star 13'] = '0x770458';
	starray['1-4 Star 14'] = '0x770459';
	starray['1-4 Star 15'] = '0x77045a';
	starray['1-4 Star 16'] = '0x77045b';
	starray['1-4 Star 17'] = '0x77045c';
	starray['1-4 Star 18'] = '0x77045d';
	starray['1-4 Star 19'] = '0x77045e';
	starray['1-4 Star 20'] = '0x77045f';
	starray['1-4 Star 21'] = '0x770460';
	starray['1-4 Star 22'] = '0x770461';
	starray['1-4 Star 23'] = '0x770462';
	starray['1-4 Star 24'] = '0x770463';
	starray['1-4 Star 25'] = '0x770464';
	starray['1-4 Star 26'] = '0x770465';
	starray['1-4 Star 27'] = '0x770466';
	starray['1-4 Star 28'] = '0x770467';
	starray['1-4 Star 29'] = '0x770468';
	starray['1-4 Star 30'] = '0x770469';
	starray['1-4 Star 31'] = '0x77046a';
	starray['1-4 Star 32'] = '0x77046b';
	starray['1-4 Star 33'] = '0x77046c';
	starray['1-4 Star 34'] = '0x77046d';
	starray['1-4 Star 35'] = '0x77046e';
	starray['1-4 Star 36'] = '0x77046f';
	starray['1-4 Star 37'] = '0x770470';
	starray['1-5 Star 1'] = '0x770471';
	starray['1-5 Star 2'] = '0x770472';
	starray['1-5 Star 3'] = '0x770473';
	starray['1-5 Star 4'] = '0x770474';
	starray['1-5 Star 5'] = '0x770475';
	starray['1-5 Star 6'] = '0x770476';
	starray['1-5 Star 7'] = '0x770477';
	starray['1-5 Star 8'] = '0x770478';
	starray['1-5 Star 9'] = '0x770479';
	starray['1-5 Star 10'] = '0x77047a';
	starray['1-5 Star 11'] = '0x77047b';
	starray['1-5 Star 12'] = '0x77047c';
	starray['1-5 Star 13'] = '0x77047d';
	starray['1-5 Star 14'] = '0x77047e';
	starray['1-5 Star 15'] = '0x77047f';
	starray['1-5 Star 16'] = '0x770480';
	starray['1-5 Star 17'] = '0x770481';
	starray['1-5 Star 18'] = '0x770482';
	starray['1-5 Star 19'] = '0x770483';
	starray['1-5 Star 20'] = '0x770484';
	starray['1-5 Star 21'] = '0x770485';
	starray['1-5 Star 22'] = '0x770486';
	starray['1-5 Star 23'] = '0x770487';
	starray['1-5 Star 24'] = '0x770488';
	starray['1-5 Star 25'] = '0x770489';
	starray['1-5 Star 26'] = '0x77048a';
	starray['1-5 Star 27'] = '0x77048b';
	starray['1-5 Star 28'] = '0x77048c';
	starray['1-5 Star 29'] = '0x77048d';
	starray['1-6 Star 1'] = '0x77048e';
	starray['1-6 Star 2'] = '0x77048f';
	starray['1-6 Star 3'] = '0x770490';
	starray['1-6 Star 4'] = '0x770491';
	starray['1-6 Star 5'] = '0x770492';
	starray['1-6 Star 6'] = '0x770493';
	starray['1-6 Star 7'] = '0x770494';
	starray['1-6 Star 8'] = '0x770495';
	starray['1-6 Star 9'] = '0x770496';
	starray['1-6 Star 10'] = '0x770497';
	starray['1-6 Star 11'] = '0x770498';
	starray['1-6 Star 12'] = '0x770499';
	starray['1-6 Star 13'] = '0x77049a';
	starray['1-6 Star 14'] = '0x77049b';
	starray['1-6 Star 15'] = '0x77049c';
	starray['1-6 Star 16'] = '0x77049d';
	starray['1-6 Star 17'] = '0x77049e';
	starray['1-6 Star 18'] = '0x77049f';
	starray['1-6 Star 19'] = '0x7704a0';
	starray['1-6 Star 20'] = '0x7704a1';
	starray['1-6 Star 21'] = '0x7704a2';
	starray['1-6 Star 22'] = '0x7704a3';
	starray['1-6 Star 23'] = '0x7704a4';
	starray['1-6 Star 24'] = '0x7704a5';
	starray['1-6 Star 25'] = '0x7704a6';
	starray['1-6 Star 26'] = '0x7704a7';
	starray['1-6 Star 27'] = '0x7704a8';
	starray['1-6 Star 28'] = '0x7704a9';
	starray['1-6 Star 29'] = '0x7704aa';
	starray['2-1 Star 1'] = '0x7704ab';
	starray['2-1 Star 2'] = '0x7704ac';
	starray['2-1 Star 3'] = '0x7704ad';
	starray['2-1 Star 4'] = '0x7704ae';
	starray['2-1 Star 5'] = '0x7704af';
	starray['2-1 Star 6'] = '0x7704b0';
	starray['2-1 Star 7'] = '0x7704b1';
	starray['2-1 Star 8'] = '0x7704b2';
	starray['2-1 Star 9'] = '0x7704b3';
	starray['2-1 Star 10'] = '0x7704b4';
	starray['2-1 Star 11'] = '0x7704b5';
	starray['2-1 Star 12'] = '0x7704b6';
	starray['2-1 Star 13'] = '0x7704b7';
	starray['2-1 Star 14'] = '0x7704b8';
	starray['2-1 Star 15'] = '0x7704b9';
	starray['2-1 Star 16'] = '0x7704ba';
	starray['2-1 Star 17'] = '0x7704bb';
	starray['2-1 Star 18'] = '0x7704bc';
	starray['2-1 Star 19'] = '0x7704bd';
	starray['2-2 Star 1'] = '0x7704be';
	starray['2-2 Star 2'] = '0x7704bf';
	starray['2-2 Star 3'] = '0x7704c0';
	starray['2-2 Star 4'] = '0x7704c1';
	starray['2-2 Star 5'] = '0x7704c2';
	starray['2-2 Star 6'] = '0x7704c3';
	starray['2-2 Star 7'] = '0x7704c4';
	starray['2-2 Star 8'] = '0x7704c5';
	starray['2-2 Star 9'] = '0x7704c6';
	starray['2-2 Star 10'] = '0x7704c7';
	starray['2-2 Star 11'] = '0x7704c8';
	starray['2-2 Star 12'] = '0x7704c9';
	starray['2-2 Star 13'] = '0x7704ca';
	starray['2-2 Star 14'] = '0x7704cb';
	starray['2-2 Star 15'] = '0x7704cc';
	starray['2-2 Star 16'] = '0x7704cd';
	starray['2-2 Star 17'] = '0x7704ce';
	starray['2-3 Star 1'] = '0x7704cf';
	starray['2-3 Star 2'] = '0x7704d0';
	starray['2-3 Star 3'] = '0x7704d1';
	starray['2-3 Star 4'] = '0x7704d2';
	starray['2-3 Star 5'] = '0x7704d3';
	starray['2-3 Star 6'] = '0x7704d4';
	starray['2-3 Star 7'] = '0x7704d5';
	starray['2-3 Star 8'] = '0x7704d6';
	starray['2-3 Star 9'] = '0x7704d7';
	starray['2-3 Star 10'] = '0x7704d8';
	starray['2-3 Star 11'] = '0x7704d9';
	starray['2-3 Star 12'] = '0x7704da';
	starray['2-3 Star 13'] = '0x7704db';
	starray['2-3 Star 14'] = '0x7704dc';
	starray['2-3 Star 15'] = '0x7704dd';
	starray['2-3 Star 16'] = '0x7704de';
	starray['2-3 Star 17'] = '0x7704df';
	starray['2-3 Star 18'] = '0x7704e0';
	starray['2-3 Star 19'] = '0x7704e1';
	starray['2-3 Star 20'] = '0x7704e2';
	starray['2-3 Star 21'] = '0x7704e3';
	starray['2-4 Star 1'] = '0x7704e4';
	starray['2-4 Star 2'] = '0x7704e5';
	starray['2-4 Star 3'] = '0x7704e6';
	starray['2-4 Star 4'] = '0x7704e7';
	starray['2-4 Star 5'] = '0x7704e8';
	starray['2-4 Star 6'] = '0x7704e9';
	starray['2-4 Star 7'] = '0x7704ea';
	starray['2-4 Star 8'] = '0x7704eb';
	starray['2-4 Star 9'] = '0x7704ec';
	starray['2-4 Star 10'] = '0x7704ed';
	starray['2-4 Star 11'] = '0x7704ee';
	starray['2-4 Star 12'] = '0x7704ef';
	starray['2-4 Star 13'] = '0x7704f0';
	starray['2-4 Star 14'] = '0x7704f1';
	starray['2-4 Star 15'] = '0x7704f2';
	starray['2-4 Star 16'] = '0x7704f3';
	starray['2-4 Star 17'] = '0x7704f4';
	starray['2-4 Star 18'] = '0x7704f5';
	starray['2-4 Star 19'] = '0x7704f6';
	starray['2-4 Star 20'] = '0x7704f7';
	starray['2-4 Star 21'] = '0x7704f8';
	starray['2-4 Star 22'] = '0x7704f9';
	starray['2-4 Star 23'] = '0x7704fa';
	starray['2-4 Star 24'] = '0x7704fb';
	starray['2-4 Star 25'] = '0x7704fc';
	starray['2-4 Star 26'] = '0x7704fd';
	starray['2-4 Star 27'] = '0x7704fe';
	starray['2-4 Star 28'] = '0x7704ff';
	starray['2-4 Star 29'] = '0x770500';
	starray['2-4 Star 30'] = '0x770501';
	starray['2-4 Star 31'] = '0x770502';
	starray['2-4 Star 32'] = '0x770503';
	starray['2-4 Star 33'] = '0x770504';
	starray['2-4 Star 34'] = '0x770505';
	starray['2-4 Star 35'] = '0x770506';
	starray['2-4 Star 36'] = '0x770507';
	starray['2-4 Star 37'] = '0x770508';
	starray['2-4 Star 38'] = '0x770509';
	starray['2-4 Star 39'] = '0x77050a';
	starray['2-4 Star 40'] = '0x77050b';
	starray['2-4 Star 41'] = '0x77050c';
	starray['2-4 Star 42'] = '0x77050d';
	starray['2-4 Star 43'] = '0x77050e';
	starray['2-4 Star 44'] = '0x77050f';
	starray['2-4 Star 45'] = '0x770510';
	starray['2-4 Star 46'] = '0x770511';
	starray['2-4 Star 47'] = '0x770512';
	starray['2-4 Star 48'] = '0x770513';
	starray['2-4 Star 49'] = '0x770514';
	starray['2-4 Star 50'] = '0x770515';
	starray['2-4 Star 51'] = '0x770516';
	starray['2-5 Star 1'] = '0x770517';
	starray['2-5 Star 2'] = '0x770518';
	starray['2-5 Star 3'] = '0x770519';
	starray['2-5 Star 4'] = '0x77051a';
	starray['2-5 Star 5'] = '0x77051b';
	starray['2-5 Star 6'] = '0x77051c';
	starray['2-5 Star 7'] = '0x77051d';
	starray['2-5 Star 8'] = '0x77051e';
	starray['2-5 Star 9'] = '0x77051f';
	starray['2-5 Star 10'] = '0x770520';
	starray['2-5 Star 11'] = '0x770521';
	starray['2-5 Star 12'] = '0x770522';
	starray['2-5 Star 13'] = '0x770523';
	starray['2-5 Star 14'] = '0x770524';
	starray['2-5 Star 15'] = '0x770525';
	starray['2-5 Star 16'] = '0x770526';
	starray['2-5 Star 17'] = '0x770527';
	starray['2-5 Star 18'] = '0x770528';
	starray['2-5 Star 19'] = '0x770529';
	starray['2-5 Star 20'] = '0x77052a';
	starray['2-5 Star 21'] = '0x77052b';
	starray['2-5 Star 22'] = '0x77052c';
	starray['2-5 Star 23'] = '0x77052d';
	starray['2-5 Star 24'] = '0x77052e';
	starray['2-5 Star 25'] = '0x77052f';
	starray['2-5 Star 26'] = '0x770530';
	starray['2-5 Star 27'] = '0x770531';
	starray['2-5 Star 28'] = '0x770532';
	starray['2-5 Star 29'] = '0x770533';
	starray['2-5 Star 30'] = '0x770534';
	starray['2-5 Star 31'] = '0x770535';
	starray['2-5 Star 32'] = '0x770536';
	starray['2-5 Star 33'] = '0x770537';
	starray['2-5 Star 34'] = '0x770538';
	starray['2-5 Star 35'] = '0x770539';
	starray['2-5 Star 36'] = '0x77053a';
	starray['2-5 Star 37'] = '0x77053b';
	starray['2-5 Star 38'] = '0x77053c';
	starray['2-5 Star 39'] = '0x77053d';
	starray['2-5 Star 40'] = '0x77053e';
	starray['2-5 Star 41'] = '0x77053f';
	starray['2-5 Star 42'] = '0x770540';
	starray['2-5 Star 43'] = '0x770541';
	starray['2-5 Star 44'] = '0x770542';
	starray['2-5 Star 45'] = '0x770543';
	starray['2-5 Star 46'] = '0x770544';
	starray['2-5 Star 47'] = '0x770545';
	starray['2-5 Star 48'] = '0x770546';
	starray['2-5 Star 49'] = '0x770547';
	starray['2-5 Star 50'] = '0x770548';
	starray['2-5 Star 51'] = '0x770549';
	starray['2-6 Star 1'] = '0x77054a';
	starray['2-6 Star 2'] = '0x77054b';
	starray['2-6 Star 3'] = '0x77054c';
	starray['2-6 Star 4'] = '0x77054d';
	starray['2-6 Star 5'] = '0x77054e';
	starray['2-6 Star 6'] = '0x77054f';
	starray['2-6 Star 7'] = '0x770550';
	starray['2-6 Star 8'] = '0x770551';
	starray['2-6 Star 9'] = '0x770552';
	starray['2-6 Star 10'] = '0x770553';
	starray['2-6 Star 11'] = '0x770554';
	starray['2-6 Star 12'] = '0x770555';
	starray['2-6 Star 13'] = '0x770556';
	starray['2-6 Star 14'] = '0x770557';
	starray['2-6 Star 15'] = '0x770558';
	starray['2-6 Star 16'] = '0x770559';
	starray['2-6 Star 17'] = '0x77055a';
	starray['2-6 Star 18'] = '0x77055b';
	starray['2-6 Star 19'] = '0x77055c';
	starray['2-6 Star 20'] = '0x77055d';
	starray['2-6 Star 21'] = '0x77055e';
	starray['2-6 Star 22'] = '0x77055f';
	starray['2-6 Star 23'] = '0x770560';
	starray['3-1 Star 1'] = '0x770561';
	starray['3-1 Star 2'] = '0x770562';
	starray['3-1 Star 3'] = '0x770563';
	starray['3-1 Star 4'] = '0x770564';
	starray['3-1 Star 5'] = '0x770565';
	starray['3-1 Star 6'] = '0x770566';
	starray['3-1 Star 7'] = '0x770567';
	starray['3-1 Star 8'] = '0x770568';
	starray['3-1 Star 9'] = '0x770569';
	starray['3-1 Star 10'] = '0x77056a';
	starray['3-1 Star 11'] = '0x77056b';
	starray['3-1 Star 12'] = '0x77056c';
	starray['3-1 Star 13'] = '0x77056d';
	starray['3-1 Star 14'] = '0x77056e';
	starray['3-1 Star 15'] = '0x77056f';
	starray['3-1 Star 16'] = '0x770570';
	starray['3-1 Star 17'] = '0x770571';
	starray['3-1 Star 18'] = '0x770572';
	starray['3-1 Star 19'] = '0x770573';
	starray['3-1 Star 20'] = '0x770574';
	starray['3-1 Star 21'] = '0x770575';
	starray['3-1 Star 22'] = '0x770576';
	starray['3-2 Star 1'] = '0x770577';
	starray['3-2 Star 2'] = '0x770578';
	starray['3-2 Star 3'] = '0x770579';
	starray['3-2 Star 4'] = '0x77057a';
	starray['3-2 Star 5'] = '0x77057b';
	starray['3-2 Star 6'] = '0x77057c';
	starray['3-2 Star 7'] = '0x77057d';
	starray['3-2 Star 8'] = '0x77057e';
	starray['3-2 Star 9'] = '0x77057f';
	starray['3-2 Star 10'] = '0x770580';
	starray['3-2 Star 11'] = '0x770581';
	starray['3-2 Star 12'] = '0x770582';
	starray['3-2 Star 13'] = '0x770583';
	starray['3-2 Star 14'] = '0x770584';
	starray['3-2 Star 15'] = '0x770585';
	starray['3-2 Star 16'] = '0x770586';
	starray['3-2 Star 17'] = '0x770587';
	starray['3-2 Star 18'] = '0x770588';
	starray['3-2 Star 19'] = '0x770589';
	starray['3-2 Star 20'] = '0x77058a';
	starray['3-2 Star 21'] = '0x77058b';
	starray['3-2 Star 22'] = '0x77058c';
	starray['3-2 Star 23'] = '0x77058d';
	starray['3-2 Star 24'] = '0x77058e';
	starray['3-2 Star 25'] = '0x77058f';
	starray['3-2 Star 26'] = '0x770590';
	starray['3-2 Star 27'] = '0x770591';
	starray['3-2 Star 28'] = '0x770592';
	starray['3-2 Star 29'] = '0x770593';
	starray['3-2 Star 30'] = '0x770594';
	starray['3-2 Star 31'] = '0x770595';
	starray['3-2 Star 32'] = '0x770596';
	starray['3-2 Star 33'] = '0x770597';
	starray['3-2 Star 34'] = '0x770598';
	starray['3-2 Star 35'] = '0x770599';
	starray['3-2 Star 36'] = '0x77059a';
	starray['3-2 Star 37'] = '0x77059b';
	starray['3-2 Star 38'] = '0x77059c';
	starray['3-2 Star 39'] = '0x77059d';
	starray['3-2 Star 40'] = '0x77059e';
	starray['3-2 Star 41'] = '0x77059f';
	starray['3-2 Star 42'] = '0x7705a0';
	starray['3-2 Star 43'] = '0x7705a1';
	starray['3-2 Star 44'] = '0x7705a2';
	starray['3-2 Star 45'] = '0x7705a3';
	starray['3-2 Star 46'] = '0x7705a4';
	starray['3-2 Star 47'] = '0x7705a5';
	starray['3-2 Star 48'] = '0x7705a6';
	starray['3-3 Star 1'] = '0x7705a7';
	starray['3-3 Star 2'] = '0x7705a8';
	starray['3-3 Star 3'] = '0x7705a9';
	starray['3-3 Star 4'] = '0x7705aa';
	starray['3-3 Star 5'] = '0x7705ab';
	starray['3-3 Star 6'] = '0x7705ac';
	starray['3-3 Star 7'] = '0x7705ad';
	starray['3-3 Star 8'] = '0x7705ae';
	starray['3-3 Star 9'] = '0x7705af';
	starray['3-3 Star 10'] = '0x7705b0';
	starray['3-4 Star 1'] = '0x7705b1';
	starray['3-4 Star 2'] = '0x7705b2';
	starray['3-4 Star 3'] = '0x7705b3';
	starray['3-4 Star 4'] = '0x7705b4';
	starray['3-4 Star 5'] = '0x7705b5';
	starray['3-4 Star 6'] = '0x7705b6';
	starray['3-4 Star 7'] = '0x7705b7';
	starray['3-4 Star 8'] = '0x7705b8';
	starray['3-4 Star 9'] = '0x7705b9';
	starray['3-4 Star 10'] = '0x7705ba';
	starray['3-4 Star 11'] = '0x7705bb';
	starray['3-4 Star 12'] = '0x7705bc';
	starray['3-4 Star 13'] = '0x7705bd';
	starray['3-4 Star 14'] = '0x7705be';
	starray['3-4 Star 15'] = '0x7705bf';
	starray['3-4 Star 16'] = '0x7705c0';
	starray['3-4 Star 17'] = '0x7705c1';
	starray['3-4 Star 18'] = '0x7705c2';
	starray['3-4 Star 19'] = '0x7705c3';
	starray['3-4 Star 20'] = '0x7705c4';
	starray['3-4 Star 21'] = '0x7705c5';
	starray['3-4 Star 22'] = '0x7705c6';
	starray['3-4 Star 23'] = '0x7705c7';
	starray['3-5 Star 1'] = '0x7705c8';
	starray['3-5 Star 2'] = '0x7705c9';
	starray['3-5 Star 3'] = '0x7705ca';
	starray['3-5 Star 4'] = '0x7705cb';
	starray['3-5 Star 5'] = '0x7705cc';
	starray['3-5 Star 6'] = '0x7705cd';
	starray['3-5 Star 7'] = '0x7705ce';
	starray['3-5 Star 8'] = '0x7705cf';
	starray['3-5 Star 9'] = '0x7705d0';
	starray['3-5 Star 10'] = '0x7705d1';
	starray['3-5 Star 11'] = '0x7705d2';
	starray['3-5 Star 12'] = '0x7705d3';
	starray['3-5 Star 13'] = '0x7705d4';
	starray['3-5 Star 14'] = '0x7705d5';
	starray['3-5 Star 15'] = '0x7705d6';
	starray['3-5 Star 16'] = '0x7705d7';
	starray['3-5 Star 17'] = '0x7705d8';
	starray['3-5 Star 18'] = '0x7705d9';
	starray['3-5 Star 19'] = '0x7705da';
	starray['3-5 Star 20'] = '0x7705db';
	starray['3-5 Star 21'] = '0x7705dc';
	starray['3-5 Star 22'] = '0x7705dd';
	starray['3-5 Star 23'] = '0x7705de';
	starray['3-5 Star 24'] = '0x7705df';
	starray['3-5 Star 25'] = '0x7705e0';
	starray['3-5 Star 26'] = '0x7705e1';
	starray['3-5 Star 27'] = '0x7705e2';
	starray['3-5 Star 28'] = '0x7705e3';
	starray['3-5 Star 29'] = '0x7705e4';
	starray['3-5 Star 30'] = '0x7705e5';
	starray['3-5 Star 31'] = '0x7705e6';
	starray['3-5 Star 32'] = '0x7705e7';
	starray['3-5 Star 33'] = '0x7705e8';
	starray['3-5 Star 34'] = '0x7705e9';
	starray['3-5 Star 35'] = '0x7705ea';
	starray['3-5 Star 36'] = '0x7705eb';
	starray['3-5 Star 37'] = '0x7705ec';
	starray['3-5 Star 38'] = '0x7705ed';
	starray['3-5 Star 39'] = '0x7705ee';
	starray['3-5 Star 40'] = '0x7705ef';
	starray['4-1 Star 1'] = '0x7705f0';
	starray['4-1 Star 2'] = '0x7705f1';
	starray['4-1 Star 3'] = '0x7705f2';
	starray['4-1 Star 4'] = '0x7705f3';
	starray['4-1 Star 5'] = '0x7705f4';
	starray['4-1 Star 6'] = '0x7705f5';
	starray['4-1 Star 7'] = '0x7705f6';
	starray['4-1 Star 8'] = '0x7705f7';
	starray['4-1 Star 9'] = '0x7705f8';
	starray['4-1 Star 10'] = '0x7705f9';
	starray['4-1 Star 11'] = '0x7705fa';
	starray['4-1 Star 12'] = '0x7705fb';
	starray['4-1 Star 13'] = '0x7705fc';
	starray['4-1 Star 14'] = '0x7705fd';
	starray['4-1 Star 15'] = '0x7705fe';
	starray['4-1 Star 16'] = '0x7705ff';
	starray['4-1 Star 17'] = '0x770600';
	starray['4-1 Star 18'] = '0x770601';
	starray['4-1 Star 19'] = '0x770602';
	starray['4-1 Star 20'] = '0x770603';
	starray['4-1 Star 21'] = '0x770604';
	starray['4-1 Star 22'] = '0x770605';
	starray['4-1 Star 23'] = '0x770606';
	starray['4-2 Star 1'] = '0x770607';
	starray['4-2 Star 2'] = '0x770608';
	starray['4-2 Star 3'] = '0x770609';
	starray['4-2 Star 4'] = '0x77060a';
	starray['4-2 Star 5'] = '0x77060b';
	starray['4-2 Star 6'] = '0x77060c';
	starray['4-2 Star 7'] = '0x77060d';
	starray['4-2 Star 8'] = '0x77060e';
	starray['4-2 Star 9'] = '0x77060f';
	starray['4-2 Star 10'] = '0x770610';
	starray['4-2 Star 11'] = '0x770611';
	starray['4-2 Star 12'] = '0x770612';
	starray['4-2 Star 13'] = '0x770613';
	starray['4-2 Star 14'] = '0x770614';
	starray['4-2 Star 15'] = '0x770615';
	starray['4-2 Star 16'] = '0x770616';
	starray['4-2 Star 17'] = '0x770617';
	starray['4-2 Star 18'] = '0x770618';
	starray['4-2 Star 19'] = '0x770619';
	starray['4-2 Star 20'] = '0x77061a';
	starray['4-2 Star 21'] = '0x77061b';
	starray['4-2 Star 22'] = '0x77061c';
	starray['4-2 Star 23'] = '0x77061d';
	starray['4-2 Star 24'] = '0x77061e';
	starray['4-2 Star 25'] = '0x77061f';
	starray['4-2 Star 26'] = '0x770620';
	starray['4-2 Star 27'] = '0x770621';
	starray['4-2 Star 28'] = '0x770622';
	starray['4-2 Star 29'] = '0x770623';
	starray['4-2 Star 30'] = '0x770624';
	starray['4-2 Star 31'] = '0x770625';
	starray['4-2 Star 32'] = '0x770626';
	starray['4-2 Star 33'] = '0x770627';
	starray['4-2 Star 34'] = '0x770628';
	starray['4-2 Star 35'] = '0x770629';
	starray['4-2 Star 36'] = '0x77062a';
	starray['4-2 Star 37'] = '0x77062b';
	starray['4-2 Star 38'] = '0x77062c';
	starray['4-2 Star 39'] = '0x77062d';
	starray['4-2 Star 40'] = '0x77062e';
	starray['4-2 Star 41'] = '0x77062f';
	starray['4-2 Star 42'] = '0x770630';
	starray['4-2 Star 43'] = '0x770631';
	starray['4-2 Star 44'] = '0x770632';
	starray['4-2 Star 45'] = '0x770633';
	starray['4-2 Star 46'] = '0x770634';
	starray['4-2 Star 47'] = '0x770635';
	starray['4-2 Star 48'] = '0x770636';
	starray['4-2 Star 49'] = '0x770637';
	starray['4-2 Star 50'] = '0x770638';
	starray['4-2 Star 51'] = '0x770639';
	starray['4-2 Star 52'] = '0x77063a';
	starray['4-2 Star 53'] = '0x77063b';
	starray['4-2 Star 54'] = '0x77063c';
	starray['4-3 Star 1'] = '0x77063d';
	starray['4-3 Star 2'] = '0x77063e';
	starray['4-3 Star 3'] = '0x77063f';
	starray['4-3 Star 4'] = '0x770640';
	starray['4-3 Star 5'] = '0x770641';
	starray['4-3 Star 6'] = '0x770642';
	starray['4-3 Star 7'] = '0x770643';
	starray['4-3 Star 8'] = '0x770644';
	starray['4-3 Star 9'] = '0x770645';
	starray['4-3 Star 10'] = '0x770646';
	starray['4-3 Star 11'] = '0x770647';
	starray['4-3 Star 12'] = '0x770648';
	starray['4-3 Star 13'] = '0x770649';
	starray['4-3 Star 14'] = '0x77064a';
	starray['4-3 Star 15'] = '0x77064b';
	starray['4-3 Star 16'] = '0x77064c';
	starray['4-3 Star 17'] = '0x77064d';
	starray['4-3 Star 18'] = '0x77064e';
	starray['4-3 Star 19'] = '0x77064f';
	starray['4-3 Star 20'] = '0x770650';
	starray['4-3 Star 21'] = '0x770651';
	starray['4-3 Star 22'] = '0x770652';
	starray['4-4 Star 1'] = '0x770653';
	starray['4-4 Star 2'] = '0x770654';
	starray['4-4 Star 3'] = '0x770655';
	starray['4-4 Star 4'] = '0x770656';
	starray['4-4 Star 5'] = '0x770657';
	starray['4-4 Star 6'] = '0x770658';
	starray['4-4 Star 7'] = '0x770659';
	starray['4-4 Star 8'] = '0x77065a';
	starray['4-4 Star 9'] = '0x77065b';
	starray['4-4 Star 10'] = '0x77065c';
	starray['4-4 Star 11'] = '0x77065d';
	starray['4-4 Star 12'] = '0x77065e';
	starray['4-4 Star 13'] = '0x77065f';
	starray['4-4 Star 14'] = '0x770660';
	starray['4-4 Star 15'] = '0x770661';
	starray['4-4 Star 16'] = '0x770662';
	starray['4-4 Star 17'] = '0x770663';
	starray['4-4 Star 18'] = '0x770664';
	starray['4-4 Star 19'] = '0x770665';
	starray['4-4 Star 20'] = '0x770666';
	starray['4-4 Star 21'] = '0x770667';
	starray['4-4 Star 22'] = '0x770668';
	starray['4-4 Star 23'] = '0x770669';
	starray['4-4 Star 24'] = '0x77066a';
	starray['4-4 Star 25'] = '0x77066b';
	starray['4-4 Star 26'] = '0x77066c';
	starray['4-4 Star 27'] = '0x77066d';
	starray['4-4 Star 28'] = '0x77066e';
	starray['4-4 Star 29'] = '0x77066f';
	starray['4-4 Star 30'] = '0x770670';
	starray['4-4 Star 31'] = '0x770671';
	starray['4-4 Star 32'] = '0x770672';
	starray['4-4 Star 33'] = '0x770673';
	starray['4-4 Star 34'] = '0x770674';
	starray['4-4 Star 35'] = '0x770675';
	starray['4-4 Star 36'] = '0x770676';
	starray['4-4 Star 37'] = '0x770677';
	starray['4-4 Star 38'] = '0x770678';
	starray['4-4 Star 39'] = '0x770679';
	starray['4-4 Star 40'] = '0x77067a';
	starray['4-4 Star 41'] = '0x77067b';
	starray['4-4 Star 42'] = '0x77067c';
	starray['4-4 Star 43'] = '0x77067d';
	starray['4-4 Star 44'] = '0x77067e';
	starray['4-4 Star 45'] = '0x77067f';
	starray['4-4 Star 46'] = '0x770680';
	starray['4-4 Star 47'] = '0x770681';
	starray['4-4 Star 48'] = '0x770682';
	starray['4-4 Star 49'] = '0x770683';
	starray['4-4 Star 50'] = '0x770684';
	starray['4-5 Star 1'] = '0x770685';
	starray['4-5 Star 2'] = '0x770686';
	starray['4-5 Star 3'] = '0x770687';
	starray['4-5 Star 4'] = '0x770688';
	starray['4-5 Star 5'] = '0x770689';
	starray['4-5 Star 6'] = '0x77068a';
	starray['4-6 Star 1'] = '0x77068b';
	starray['4-6 Star 2'] = '0x77068c';
	starray['4-6 Star 3'] = '0x77068d';
	starray['4-6 Star 4'] = '0x77068e';
	starray['4-6 Star 5'] = '0x77068f';
	starray['4-6 Star 6'] = '0x770690';
	starray['4-6 Star 7'] = '0x770691';
	starray['4-6 Star 8'] = '0x770692';
	starray['4-6 Star 9'] = '0x770693';
	starray['4-6 Star 10'] = '0x770694';
	starray['4-6 Star 11'] = '0x770695';
	starray['4-6 Star 12'] = '0x770696';
	starray['4-6 Star 13'] = '0x770697';
	starray['4-6 Star 14'] = '0x770698';
	starray['4-6 Star 15'] = '0x770699';
	starray['4-6 Star 16'] = '0x77069a';
	starray['4-6 Star 17'] = '0x77069b';
	starray['4-6 Star 18'] = '0x77069c';
	starray['4-6 Star 19'] = '0x77069d';
	starray['4-6 Star 20'] = '0x77069e';
	starray['4-6 Star 21'] = '0x77069f';
	starray['4-6 Star 22'] = '0x7706a0';
	starray['4-6 Star 23'] = '0x7706a1';
	starray['4-6 Star 24'] = '0x7706a2';
	starray['4-6 Star 25'] = '0x7706a3';
	starray['4-6 Star 26'] = '0x7706a4';
	starray['4-6 Star 27'] = '0x7706a5';
	starray['4-6 Star 28'] = '0x7706a6';
	starray['4-6 Star 29'] = '0x7706a7';
	starray['4-6 Star 30'] = '0x7706a8';
	starray['4-6 Star 31'] = '0x7706a9';
	starray['4-6 Star 32'] = '0x7706aa';
	starray['4-6 Star 33'] = '0x7706ab';
	starray['5-1 Star 1'] = '0x7706ac';
	starray['5-1 Star 2'] = '0x7706ad';
	starray['5-1 Star 3'] = '0x7706ae';
	starray['5-1 Star 4'] = '0x7706af';
	starray['5-1 Star 5'] = '0x7706b0';
	starray['5-1 Star 6'] = '0x7706b1';
	starray['5-2 Star 1'] = '0x7706b2';
	starray['5-2 Star 2'] = '0x7706b3';
	starray['5-2 Star 3'] = '0x7706b4';
	starray['5-2 Star 4'] = '0x7706b5';
	starray['5-2 Star 5'] = '0x7706b6';
	starray['5-2 Star 6'] = '0x7706b7';
	starray['5-2 Star 7'] = '0x7706b8';
	starray['5-2 Star 8'] = '0x7706b9';
	starray['5-2 Star 9'] = '0x7706ba';
	starray['5-2 Star 10'] = '0x7706bb';
	starray['5-2 Star 11'] = '0x7706bc';
	starray['5-2 Star 12'] = '0x7706bd';
	starray['5-2 Star 13'] = '0x7706be';
	starray['5-2 Star 14'] = '0x7706bf';
	starray['5-2 Star 15'] = '0x7706c0';
	starray['5-2 Star 16'] = '0x7706c1';
	starray['5-2 Star 17'] = '0x7706c2';
	starray['5-2 Star 18'] = '0x7706c3';
	starray['5-2 Star 19'] = '0x7706c4';
	starray['5-3 Star 1'] = '0x7706c5';
	starray['5-3 Star 2'] = '0x7706c6';
	starray['5-3 Star 3'] = '0x7706c7';
	starray['5-3 Star 4'] = '0x7706c8';
	starray['5-3 Star 5'] = '0x7706c9';
	starray['5-3 Star 6'] = '0x7706ca';
	starray['5-3 Star 7'] = '0x7706cb';
	starray['5-3 Star 8'] = '0x7706cc';
	starray['5-3 Star 9'] = '0x7706cd';
	starray['5-3 Star 10'] = '0x7706ce';
	starray['5-3 Star 11'] = '0x7706cf';
	starray['5-3 Star 12'] = '0x7706d0';
	starray['5-3 Star 13'] = '0x7706d1';
	starray['5-3 Star 14'] = '0x7706d2';
	starray['5-3 Star 15'] = '0x7706d3';
	starray['5-3 Star 16'] = '0x7706d4';
	starray['5-3 Star 17'] = '0x7706d5';
	starray['5-3 Star 18'] = '0x7706d6';
	starray['5-3 Star 19'] = '0x7706d7';
	starray['5-3 Star 20'] = '0x7706d8';
	starray['5-3 Star 21'] = '0x7706d9';
	starray['5-4 Star 1'] = '0x7706da';
	starray['5-4 Star 2'] = '0x7706db';
	starray['5-4 Star 3'] = '0x7706dc';
	starray['5-5 Star 1'] = '0x7706dd';
	starray['5-5 Star 2'] = '0x7706de';
	starray['5-5 Star 3'] = '0x7706df';
	starray['5-5 Star 4'] = '0x7706e0';
	starray['5-5 Star 5'] = '0x7706e1';
	starray['5-5 Star 6'] = '0x7706e2';
	starray['5-5 Star 7'] = '0x7706e3';
	starray['5-5 Star 8'] = '0x7706e4';
	starray['5-5 Star 9'] = '0x7706e5';
	starray['5-5 Star 10'] = '0x7706e6';
	starray['5-5 Star 11'] = '0x7706e7';
	starray['5-5 Star 12'] = '0x7706e8';
	starray['5-5 Star 13'] = '0x7706e9';
	starray['5-5 Star 14'] = '0x7706ea';
	starray['5-5 Star 15'] = '0x7706eb';
	starray['5-5 Star 16'] = '0x7706ec';
	starray['5-5 Star 17'] = '0x7706ed';
	starray['5-5 Star 18'] = '0x7706ee';
	starray['5-5 Star 19'] = '0x7706ef';
	starray['5-5 Star 20'] = '0x7706f0';
	starray['5-5 Star 21'] = '0x7706f1';
	starray['5-5 Star 22'] = '0x7706f2';
	starray['5-5 Star 23'] = '0x7706f3';
	starray['5-5 Star 24'] = '0x7706f4';
	starray['5-5 Star 25'] = '0x7706f5';
	starray['5-5 Star 26'] = '0x7706f6';
	starray['5-5 Star 27'] = '0x7706f7';
	starray['5-5 Star 28'] = '0x7706f8';
	starray['5-5 Star 29'] = '0x7706f9';
	starray['5-5 Star 30'] = '0x7706fa';
	starray['5-5 Star 31'] = '0x7706fb';
	starray['5-5 Star 32'] = '0x7706fc';
	starray['5-5 Star 33'] = '0x7706fd';
	starray['5-5 Star 34'] = '0x7706fe';
	starray['5-6 Star 1'] = '0x7706ff';
	format = format.replace('%1',world);
	format = format.replace('%2',map);
	format = format.replace('%2',map);
	format = format.replace('%3',square);
	format = format.replace('%4',item);
	format = format.replace('%5',starray[map + ' ' + item]);
	return format;
}