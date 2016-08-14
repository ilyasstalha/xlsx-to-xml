var ractive,
	visibleSheet;

var fileLoadFailed = function(e) {
	setMessage('unable to load file');
}

var readFile = function(file) {
  var reader = new FileReader();

	ractive.fire('hideFileInput');

	ractive.set('processing', true);
	setMessage('processing new file...');

  reader.onload = processLoadedFile;
  reader.readAsBinaryString(file);
}

var processLoadedFile = function(e) {
  var workbook = XLSX.read(e.target.result, {type: 'binary'});

  if(!_.isArray(workbook.SheetNames) || !workbook.SheetNames.length) {
  	setMessage('File parsed: the workbook has no sheets!');
  	return;
  }

  resetSheets(0);
	ractive.set('visibleSheet', 0);

  if(workbook.SheetNames) {
		_.each(workbook.SheetNames, function(sheetName, i) {
			addSheet(workbook.Sheets[sheetName], sheetName, i === 0);
		});
  }

  finishedProcessing('Workbook processed');
}

var resetSheets = function(visibleSheet) {
	ractive.set({sheets: [], visibleSheet: null});
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
	var visibleId = ractive.get('visibleSheet');
	ractive.set('sheets.' + visibleId + '.showSettingsForm', false);
	ractive.set('sheets.' + visibleId + '.isVisible', false);
	ractive.set('sheets.' + id + '.isVisible', true);
	ractive.set('visibleSheet', id);
	// visibleSheet = id;
}

var showSettingsForm = function(id) {
	ractive.toggle('sheets.' + id + '.showSettingsForm');
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
	var tag = (sheet.useCommonRowTag || !row.tag) ? sheet.commonRowTag : row.tag,
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
	  transitions: {
	  	slideDown: slideDownTransition
	  },
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
	  	visibleSheet: null,
	  	fileInput: {
	  		dragging: false,
	  		show: true,
	  		showHideButton: true
	  	}
	  }
	});

	ractive.on({
		navButtonPress: function(e, i) {
			if(i === ractive.get('visibleSheet')) {
				showSettingsForm(i);
			} else {
				switchSheet(i);
			}
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
		},
		fileInputDrag: function(e) {
			e.original.stopPropagation();
			e.original.preventDefault();
			ractive.set('fileInput.dragging', e.original.type === 'dragover');
		},
		fileInputDrop: function(e) {
			ractive.fire('fileInputDrag', e);

			if(e.original.dataTransfer && e.original.dataTransfer.files && e.original.dataTransfer.files instanceof FileList && 
					_.has(e.original.dataTransfer.files, 0)) {
				readFile(e.original.dataTransfer.files[0]);
			} else {
				fileLoadFailed(e);
			}
		},
		chooseFile: function(e) {
			readFile(e.node.files[0]);
		},
		showFileInput: function(e) {
			ractive.set('fileInput.showHideButton', true);
			ractive.set('fileInput.show', true);

		},
		hideFileInput: function(e) {
			ractive.set('fileInput.showHideButton', false);
			ractive.set('fileInput.show', false);
		},
	});
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

var slideDownTransition = function(t, params) {
	var targetStyles,
		props = [
			'height',
			'borderTopWidth',
			'borderBottomWidth',
			'paddingTop',
			'paddingBottom',
			'marginTop',
			'marginBottom'
		],
		collapsedStyle = {
			height: 0,
			borderTopWidth: 0,
			borderBottomWidth: 0,
			paddingTop: 0,
			paddingBottom: 0,
			marginTop: 0,
			marginBottom: 0
		};

	if(t.isIntro) {
		targetStyles = t.getStyle(props);

		t.setStyle(collapsedStyle);

	} else {
		t.setStyle(t.getStyle(props));

		targetStyles = collapsedStyle;

	}

	t.setStyle( 'overflowY', 'hidden' );

	t.animateStyle(targetStyles, {duration: 300}).then(t.complete);
};

initMain();


