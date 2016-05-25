var ractive;

var initConvertForm = function() {
	convertForm =  new Ractive({
	  el: '#convert-form-container',
	  template: '#convert-form',
	  data: {display: 'none', values: {
	  	nodeNameRoot: 'root',
	  	useCommonRowNodeName: true,
	  	nodeNameRowCommon: 'row',
	  	useCommonColNodeName: true,
	  	nodeNameColCommon: 'column'
	  }}
	});

}

var readFile = function(file) {
  var reader = new FileReader();

  reader.onload = function(e) {
    var workbook = XLSX.read(e.target.result, {type: 'binary'});

    setData(extractWorkbookData(workbook), 'File parsed!');
  };
  reader.readAsBinaryString(file);
}

var extractWorkbookData = function(workbook) {
	if(!_.isArray(workbook.SheetNames) || !workbook.SheetNames.length) {
		return false;
	}

	// we're only processing the first sheet at the moment
	var sheetOne = workbook.Sheets[workbook.SheetNames[0]],
		json = XLSX.utils.sheet_to_json(sheetOne);

	return reformatXslxJson(json);
}

var reformatXslxJson = function(json) {
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
}


var convertData = function(e) {
	var x2js = new X2JS({
      arrayAccessFormPaths : [
        "something.row"
      ]
    }),
		xmlStr = generateXML();

}

var generateXML = function() {
	return convertNode(formatDataForConversion())
}

var formatDataForConversion = function() {
	var rootNodeTag = ractive.get('data.tags.root'),
		commonRowTag = ractive.get('data.tags.useCommon.row') ? ractive.get('data.tags.common.row') : false,
		colTags = ractive.get('data.tags.useCommon.col') ? ractive.get('data.tags.common.col') : ractive.get('data.tags.cols'),
		obj = {};

	obj[rootNodeTag] = _.filter(_.map(ractive.get('data.rows'), function(rowData, i) {
		if(rowData.deleted) return false;
		debugger;
		return formatRowDataForConversion(rowData, commonRowTag || rowData.tag, colTags);
	}));

	return obj;
}

var formatRowDataForConversion = function(rowData, tagName, childTagNames) {
	return {
		tag: tagName,
		attrs: formatNodeAttrs(rowData),
		content: formatRowContent(rowData, childTagNames)
	}
}

var formatNodeAttrs = function(nodeData) {
	return {};
}

var formatRowContent = function(rowData, keys) {
	if(_.isArray(keys)) {
		return _.map(keys, function(key, i) {
			return {
				tag: key,
				content: rowData.values[i]
			}
		});
	}

	return _.map(rowData.values, function(value) {
		return {
			tag: keys,
			content: value
		};
	});
}

var setData = function(data, message) {
	if(!data) data = {};

	ractive.set({
		'data.rows': data,
		'data.tags.cols': new Array(_.max(_.pluck(_.pluck(data, 'children'), 'length'))).fill(ractive.get('data.tags.common.col')),
		processing: false,
		statusMessage: message,
		dataSet: true
	});
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
	return '  '
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
	  	converting: false,
	  	dataSet: false,
	  	showConvertForm: false,
	  	showXml: false,
	  	data: {
	  		rows: [],
	  		tags: {
	  			common: {
		  			row: 'row',
		  			col: 'cell'
	  			},
	  			root: 'root',
	  			cols: [],
	  			useCommon: {
	  				row: true,
	  				col: true
	  			}
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


initMain();


