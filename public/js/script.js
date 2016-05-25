var ractive;

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

	_.each(workbook.SheetNames, function(sheetName) {
		addSheet(workbook.Sheets[sheetName]);
	});

  //setData(extractWorkbookData(workbook));
}

var addSheet = function(worksheet) {
	var sheet = new Sheet(1, worksheet, XLSX);
}

var sheetKey = function(sheetId) {
	return 'sheets.' + sheetId;
}

var setSheetData = function(sheetId, data) {
	if(!data) data = {};

	var setDataObj = {};

	setDataObj[sheetKey(sheetId) + '.rows'] = data;
	setDataObj[sheetKey(sheetId) + '.dataSet'] = true;
	setDataObj[sheetKey(sheetId) + '.tags.cols'] = new Array(_.max(_.pluck(_.pluck(data, 'children'), 'length')))
		.fill(ractive.get('data.tags.common.col'));

	ractive.set(setDataObj);
}

var setMessage = function(message) {
	ractive.set('statusMessage', message);
}

var setColNodeNames = function(nodeNames) {
	ractive.set({
		'data.tags.cols': nodeNames,
		'data.tags.useCommon.col': false
	});
}

var setDeleteRow = function(row, value) {
	ractive.set('data.rows.' + row + '.deleted', value);
}

var renderNode = function(node, level) {
	if(node.deleted) return '';
	var initial = '';
	if(level === undefined) {
		// root node
		level = 0;
		initial = '\n';
	}
	return initial + renderNodeOpeningTag(node, level) + renderNodeContent(node, level) + renderNodeClosingTag(node, level, !_.isArray(node.children));
}

var renderNodeOpeningTag = function(node, level) {
	return renderNodeTab(level) + '<' + node.tag + '>';
}

var renderNodeClosingTag = function(node, level, noTab) {
	return (noTab ? '' : renderNodeTab(level)) + '</' + node.tag + '>\n';
}

var renderNodeContent = function(node, level) {
	var output = node.content || '';

	if(_.isArray(node.children)) {
		output += '\n' + _.reduce(node.children, function(carry, child) {
			return carry + renderNode(child, level + 1);
		}, '');
	}

	return output;
}

var renderNodeTab = function(level) {
	if(!level) return '';
	return _.reduce(new Array(level), function(carry) {return carry + tabCharacter()}, '');
}

var tabCharacter = function() {
	return '  ';
}

var updateAllColTags = function(tag, colIndex) {
	ractive.set('data.rows.*.children.' + colIndex + '.tag', tag);
}

var updateAllRowTags = function(tag) {

}

var initMain = function() {
	ractive = new Ractive({
	  el: '#container',
	  template: '#template-main',
	  data: {
	  	statusMessage: '',
	  	processing: false,
	  	//showConvertForm: false,
	  	showXml: false,
  		sheets: {},
  		global_tags: {
  			common: {
	  			row: 'row',
	  			col: 'cell'
  			},
  			root: 'root',
  			useCommon: {
  				row: true,
  				col: true
  			}
	  	},
	  	outputNode: renderNode,
	  },
  	useRowForColNodeNames: function(row) {
  		setColNodeNames(_.pluck(this.get('data.rows.' + row + '.children'), 'content'));
  		setDeleteRow(row, true);
  	},
  	deleteRow: function(row) {
  		setDeleteRow(row, true);
  	},
  	unDeleteRow: function(row) {
  		setDeleteRow(row, false);
  	},
  	longestRow: function() {
  		return _.max(_.map(this.get('data.rows'), function(row) {return row.length}));
  	}
	});

	ractive.on({
		chooseSheet: function(e) {
			ractive.set('processing', true);
			ractive.set('statusMessage', 'processing new file...');

			readFile(e.node.files[0]);
		},
		toggleConvertForm: function() {
			ractive.toggle('showConvertForm');
		}
	});

	ractive.observe('data.tags.cols.*', function(newValue, oldValue, keypath) {
		updateAllColTags(newValue, _.last(keypath.split('.')));
	}, {init: false});


}

var Sheet = function(id, worksheet, XLSX) {


	var extracted = function(json) {
		if(!_.isArray(json) || !json.length) {
			return [];
		}

		var rowTag = ractive.get('data.tags.common.row');

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
	}(XLSX.utils.sheet_to_json(worksheet));

}


initMain();


