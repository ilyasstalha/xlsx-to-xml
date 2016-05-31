var ractive,
	visibleSheet;

var readFile = function(file) {
  var reader = new FileReader();

  reader.onload = processLoadedFile;
  reader.readAsBinaryString(file);
}

var processLoadedFile = function(e) {
  var workbook = XLSX.read(e.target.result, {type: 'binary'});

  if(!_.isArray(workbook.SheetNames) || !workbook.SheetNames.length) {
  	setMessage('File parsed: the workbook has no sheets!');
  	return;
  }

  resetSheets();

  if(workbook.SheetNames) {
		_.each(workbook.SheetNames, function(sheetName, i) {
			addSheet(workbook.Sheets[sheetName], sheetName, i === 0);
		});
  }

  finishedProcessing('Workbook processed');
}

var resetSheets = function() {
	ractive.set('sheets', []);
	visibleSheet = 0;
}

var addSheet = function(worksheet, name, isVisible) {
	var sheet = new Sheet(name, worksheet, ractive.get('tagsGlobal.row'), XLSX);

	setSheetData(name, sheet.json(), isVisible);
}

var finishedProcessing = function(message) {
	ractive.set({
		statusMessage: message,
		processing: false
	})
}

var switchSheet = function(id) {
	ractive.set('sheets.' + visibleSheet + '.isVisible', false);
	ractive.set('sheets.' + id + '.isVisible', true);
	visibleSheet = id;
}

var setSheetData = function(sheetName, data, isVisible) {
	if(!data) data = {};

	var setDataObj = {},
		commonColTag = ractive.get('tagsGlobal.col'),
		commonRowTag = ractive.get('tagsGlobal.row');

	setDataObj['name'] = sheetName;
	setDataObj['rows'] = data;
	setDataObj['showSettingsForm'] = false;
	setDataObj['isVisible'] = isVisible;
	setDataObj['useSelfClosingTags'] = true;
	setDataObj['tabLength'] = 4;
	setDataObj['useCommonColTag'] = true;
	setDataObj['useCommonRowTag'] = true;
	setDataObj['commonColTag'] = commonColTag;
	setDataObj['commonRowTag'] = commonRowTag;
	setDataObj['rootTag'] = ractive.get('tagsGlobal.root');
	setDataObj['numberOfCols'] = _.isEmpty(data) ? 0 : _.max(_.pluck(_.pluck(data, 'children'), 'length'));
	setDataObj['colTags'] = setDataObj.numberOfCols ? new Array(setDataObj.numberOfCols).fill(commonColTag) : [];

	ractive.push('sheets', setDataObj);
}

var setMessage = function(message) {
	ractive.set('statusMessage', message);
}

var setColNodeNames = function(nodeNames, sheetId) {
	var setObj = {};

	nodeNames = _.map(nodeNames, function(nodeName) {
		return formatNodeName(nodeName, 'col');
	});

	setObj['sheets.' + sheetId + '.colTags'] = nodeNames;
	setObj['sheets.' + sheetId + '.useCommonColTag'] = false;

	ractive.set(setObj);
}

var formatNodeName = function(name, rowOrCol) {
	if(!_.isString(name)) { return name };

	name = name.trim();

	if(name === '') { return ractive.get('tagsGlobal.' + rowOrCol) }

	return name.replace(/\s/g, '_').toLowerCase();
}

var setDeleteRow = function(row, sheet, value) {
	ractive.set('sheets.' + sheet + '.rows.' + row + '.deleted', value);
}

var renderSheetXML = function(sheet) {
	var xml = '\n' + renderNodeOpeningTag(sheet.rootTag, 0, sheet.tabLength) + '\n';

	if(sheet.rows) {
		xml += _.reduce(sheet.rows, function(carry, row) {
			return carry + renderRowNode(row, sheet);
		}, '');
	}

	xml += '\n' + renderNodeClosingTag(sheet.rootTag, 0, sheet.tabLength);

	return  xml;
}

var renderNodeOpeningTag = function(tag, level, tabLength) {
	return renderNodeTab(level, tabLength) + '<' + tag + '>';
}

var renderNodeClosingTag = function(tag, level, tabLength, noTab) {
	return (noTab ? '' : renderNodeTab(level, tabLength)) + '</' + tag + '>\n';
}

var renderNodeSelfClosingTag = function(tag, level, tabLength) {
	return renderNodeTab(level, tabLength) + '<' + tag + '/>\n';
}

var renderNodeTab = function(level, tabLength) {
	if(!level) return '';
	return _.reduce(new Array(level), function(carry) {return carry + tabCharacter(tabLength)}, '');
}

var tabCharacter = function(tabLength) {
	if(tabLength === '1') { return ' '; }

	return Array(Number(tabLength)).join(' ');
}

var renderRowNode = function(row, sheet) {
	var tag = (sheet.useCommonRowTag || !row.tag) ? sheet.commonRowTag : rowTag,
		xml = renderNodeOpeningTag(tag, 1, sheet.tabLength) + '\n';

	if(row.deleted) {
		return '';
	}

	xml += _.reduce(row.children, function(carry, cell, i) {
		return carry + renderColNode(cell, sheet, i);
	}, '');
	
	xml += renderNodeClosingTag(tag, 1, sheet.tabLength);

	return xml;
}

var renderColNode = function(cell, sheet, n) {
	var tag = sheet.useCommonColTag ? sheet.commonColTag : sheet.colTags[n],
		content = cell.content.trim();

	if(content === '' && sheet.useSelfClosingTags) {
		return renderNodeSelfClosingTag(tag, 2, sheet.tabLength);
	}

	return renderNodeOpeningTag(tag, 2, sheet.tabLength) + cell.content + renderNodeClosingTag(tag, 2, sheet.tabLength, true);
}

// var updateAllColTags = function(newTag, sheetId) {
// 	ractive.set('sheets.' + sheetId + '.colTags.*', newTag);
// }

// var updateAllRowTags = function(tag) {

// }

var getRowIdFromEvent = function(e) {
	return e.index.r;
}

var getSheetIdFromEvent = function(e) {
	return e.index.id;
}

var initMain = function() {
	ractive = new Ractive({
	  el: '#container',
	  template: '#template-main',
	  data: {
	  	statusMessage: 'waiting for file selection...',
	  	processing: false,
  		sheets: {},
  		tagsGlobal: {
  			row: 'row',
  			col: 'cell',
  			root: 'root'
	  	},
	  	outputXML: renderSheetXML,
	  	visibleSheet: null
	  }
	});

	ractive.on({
		chooseFile: function(e) {
			ractive.set('processing', true);
			ractive.set('statusMessage', 'processing new file...');

			readFile(e.node.files[0]);
		},
		toggleSettingsForm: function(e) {
			ractive.toggle('sheets.' + getSheetIdFromEvent(e) + '.showSettingsForm');
		},
		switchSheet: function(e, i) {
			switchSheet(i);
		},
		useRowForColNodeNames: function(e, row) {
			var sheetId = e.index.id,
				rowId = e.index.r;
			setColNodeNames(_.pluck(row.children, 'content'), sheetId);
			setDeleteRow(rowId, sheetId, true);
		},
		deleteRow: function(e, row) {
			setDeleteRow(getRowIdFromEvent(e), getSheetIdFromEvent(e), true);
		},
  	unDeleteRow: function(e, row) {
  		setDeleteRow(getRowIdFromEvent(e), getSheetIdFromEvent(e), false);
  	},
		scrollToElement: function(e, elementId) {
			var element = document.getElementById(elementId);

			if(element) {
				element.scrollIntoView();
			}
		}
	});

	// update col tag values when common tag is changed
	// ractive.observe('sheets.*.commonColTag', function(newValue, oldValue, keypath) {
	// 	if()
	// 	updateAllColTags(newValue, _.first(_.last(keypath.split('sheets.')).split('.')));
	// }, {init: false});

	// update data
	// ractive


}

var Sheet = function(id, worksheet, rowTag, XLSX) {

	var extracted = function(json) {
		if(!_.isArray(json) || !json.length) {
			return {};
		}

		var mapRow = function(row) {
			return {
				tag: rowTag,
				children: _.map(row, function(cell, key) {
					return {
						content: cell,
						attrs: {}
					}
				})
			}
		};

		return [mapRow(_.keys(json[0]))].concat( _.map(json, mapRow));
	}(XLSX.utils.sheet_to_json(worksheet, {blankValue: ''}));

	return {
		json: function() {
			return extracted;
		}
	}
}


initMain();


