var isAndroid = (Ti.Platform.osname == 'android');

var NAVBAR_HEIGHT = 44;
var TAB_HEIGHT = 54;

var colors = {
	navBackground : '#d5d5d5',
	shade1 : '#aeaeae',
	shade2 : '#c8c8c8',
	titleColor : 'white',
	titleColorOffset : 'black'
};

// An object that understands how to watch properties
var SmartObject = function() {
	return this;
};

SmartObject.prototype.watch = function(prop, handler) {
	var oldval = this[prop], newval = oldval, getter = function() {
		return newval;
	};
	var setter = function(val) {
		oldval = newval;
		return newval = handler.call(this, prop, oldval, val);
	};
	if (
	delete this[prop]) {// can't watch constants
		if (SmartObject.defineProperty) {// ECMAScript 5
			SmartObject.defineProperty(this, prop, {
				get : getter,
				set : setter,
				enumerable : false,
				configurable : true
			});
		} else if (SmartObject.prototype.__defineGetter__ && SmartObject.prototype.__defineSetter__) {// legacy
			SmartObject.prototype.__defineGetter__.call(this, prop, getter);
			SmartObject.prototype.__defineSetter__.call(this, prop, setter);
		}
	}
};

// object.unwatch
SmartObject.prototype.unwatch = function(prop) {
	var val = this[prop];
	delete this[prop];
	// remove accessors
	this[prop] = val;
};

// Propercase for Getters and Setters
function toProperCase(str) {
	return str.replace(/\w\S*/g, function(txt) {
		return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
	});
}

var navBarProperties = ['barColor', 'title', 'titleControl', 'barImage', 'rightNavButton', 'leftNavButton'];

var createBackButton = function(title) {

	var button = Ti.UI.createButton({
		title : title,
		backgroundImage : '/images/backbutton.png'
	});
	return button;
};

var defaultButtonStyles = {
	title : "",
	image : "",
	backgroundImage : "",
	width : 60,
	height : Ti.UI.FILL,
	borderWidth : 0,
	backgroundColor : 'transparent',
	font : {
		fontSize : 10,
		fontWeight : 'bold'
	},
	color : 'white'
};

var applyButtonStyles = function(button, newButton) {
	for (x in defaultButtonStyles) {
		if (newButton[x]) {
			button[x] = newButton[x];
		} else {
			button[x] = defaultButtonStyles[x];
		}
	}
};

var XNavBar = function(params) {

	var self = this;

	var navBar = Ti.UI.createView({
		height : NAVBAR_HEIGHT,
		top : 0
	});

	var title = Ti.UI.createLabel({
		textAlign : 'center',
		color : colors.titleColor,
		font : {
			fontSize : 18
		},
		text : params.title
	});

	var titleShadow = Ti.UI.createLabel({
		textAlign : 'center',
		color : colors.titleColorOffset,
		top : -2,
		left : 3,
		bottom : 0,
		right : 0,
		font : {
			fontSize : 18
		},
		text : params.title,
		opacity : 0.35
	});

	var rightNavButton = Ti.UI.createButton(defaultButtonStyles);
	rightNavButton.right = 0;

	rightNavButton.addEventListener('click', function() {
		if (self.rightNavButton) {
			self.rightNavButton.fireEvent('click');
		}
	});

	var leftNavButton = Ti.UI.createButton(defaultButtonStyles);
	leftNavButton.left = 0;

	leftNavButton.addEventListener('click', function() {
		if (self.leftNavButton) {
			self.leftNavButton.fireEvent('click');
		}
	});

	// titleControl (will be a view of some sort)
	var titleControl;

	self._view = navBar;
	navBar.add(titleShadow);
	navBar.add(title);
	navBar.add(rightNavButton);
	navBar.add(leftNavButton)

	self.watch('visible', function(id, oldval, newval) {
		navBar.visible = newval;
		return newval;
	});

	self.watch('title', function(id, oldval, newval) {
		title.text = newval;
		titleShadow.text = newval;
		return newval;
	});

	self.watch('barColor', function(id, oldval, newval) {
		if (!newval) {
			newval = colors.navBackground;
		}
		navBar.backgroundColor = newval;
		return newval;
	});

	self.barColor = colors.navBackground;

	self.watch('barImage', function(id, oldval, newval) {
		navBar.backgroundImage = newval;
		return newval;
	});

	self.watch('titleControl', function(id, oldval, newval) {
		if (titleControl) {
			navBar.remove(titleControl);
			titleControl = null;
		}
		if (newval) {
			titleControl = newval;
			titleShadow.visible = false;
			title.visible = false;
			navBar.add(titleControl);
		} else {
			titleShadow.visible = true;
			title.visible = true;
		}
		return newval;
	});

	self.watch('rightNavButton', function(id, oldval, newval) {
		if (newval) {
			applyButtonStyles(rightNavButton, newval);
			rightNavButton.visible = true;
		} else {
			rightNavButton.visible = false;
		}
		return newval;
	});

	self.watch('leftNavButton', function(id, oldval, newval) {
		if (newval) {
			applyButtonStyles(leftNavButton, newval);
			leftNavButton.visible = true;
		} else {
			leftNavButton.visible = false;
		}
		return newval;
	});

	for (var p in params) {
		self[p] = params[p];
	}

	return self;
};

XNavBar.prototype = new SmartObject();

var XWindow = function(params) {

	// TODO Need to be smart here about modal / navBarHidden / fullScreen
	// to make sure the Tab Windows will show ok
	// params.navBarHidden = true;

	var self = this;

	if (!params.width) {
		params.width = Ti.Platform.displayCaps.platformWidth;
	}

	// START - Add all the getters and setters that a window needs
	var passThruFunctions = ['open', 'close', 'show', 'hide', 'addEventListener', 'removeEventListener', 'fireEvent', 'animate'];
	for (var i = 0; i < passThruFunctions.length; i++) {
		(function() {
			var functionName = passThruFunctions[i];
			self[functionName] = function(val1, val2) {
				self._myWindow[functionName](val1, val2);
			}
		})();
	}

	// Properties to pass thru - need getters and setters
	var passThruProperties = ['top', 'bottom', 'left', 'right'];
	for (var i = 0; i < passThruProperties.length; i++) {
		(function() {
			var x = passThruProperties[i];
			self["set" + toProperCase(x)] = function(val) {
				self[x] = val;
				self._myWindow["set" + toProperCase(x)](val);
			};
			self["get" + toProperCase(x)] = function() {
				return self[x];
			};
			self.watch(x, function(id, oldval, newval) {
				self._myWindow[id] = newval;
				return newval;
			});
		})();
	}

	// Other passthru functions
	var otherPassThruFunctions = [];
	for (var i = 0; i < otherPassThruFunctions.length; i++) {
		(function() {
			var functionName = otherPassThruFunctions[i];
			self[functionName] = function(val1, val2) {
				self._myWindow[functionName](val1, val2);
			}
		})();
	}

	for (var i = 0; i < navBarProperties.length; i++) {
		(function() {
			var x = navBarProperties[i];
			self["set" + toProperCase(x)] = function(val) {
				self[x] = val;
			};
			self["get" + toProperCase(x)] = function() {
				return self[x];
			};
			self.watch(x, function(id, oldval, newval) {
				passToNavBar(id, newval);
				return newval;
			});
		})();
	}
	// END - Add all the getters and setters that a window needs

	var realWindowParams = {};

	for (var i in params) {
		realWindowParams[i] = params[i];
	}

	// remove the navBarProperty cause it will confuse lightweight / heavyweight windows
	delete realWindowParams.navBarHidden;

	var viewParams = {
		top : NAVBAR_HEIGHT
	};
	if (realWindowParams.layout) {
		// set the layout on the view, not the window
		viewParams.layout = realWindowParams.layout;
		delete realWindowParams.layout;
	}

	if (params.isTabGroup) {
		// Hide the navBar on the XWindow if this is a TabGroup
		realWindowParams.navBarHidden = true;
		params.navBarHidden = false;
	}

	// _myWindow is the real window
	self._myWindow = Ti.UI.createWindow(realWindowParams);

	// a backgroundView - all elements will really get added to this
	var backgroundView = Ti.UI.createView(viewParams);
	self._myWindow.add(backgroundView);

	self.add = function(obj) {
		backgroundView.add(obj);
	};

	self.remove = function(obj) {
		backgroundView.remove(obj);
	};

	function passToNavBar(propertyName, value) {
		if (self._tabParent) {
			self._tabParent[propertyName] = value;
		} else {
			navBar[propertyName] = value;
		}
	}

	function updateNavBar(val) {
		if (val === true) {
			navBar.visible = false;
			backgroundView.top = 0;
		} else {
			navBar.visible = true;
			backgroundView.top = NAVBAR_HEIGHT;
		}
	}


	self.watch('navBarHidden', function(id, oldval, newval) {
		updateNavBar(newval);
		return newval;
	});

	// Create the NavBar...
	var navBar = new XNavBar(params);
	self._myWindow.add(navBar._view);

	// Add all the parameters to self
	for (var i in params ) {
		self[i] = params[i];
	}

	self.addBackButton = function(title) {
		var backButton = createBackButton(title);
		backButton.addEventListener('click', function() {
			self.close();
		})
		self.leftNavButton = backButton;
	}

	return self;
};

XWindow.prototype = new SmartObject();

exports.createWindow = function(_args) {

	if (isAndroid) {
		var win = new XWindow(_args);
		return win;
	} else {
		return Ti.UI.createWindow(_args);
	}

}

exports.createTabGroup = function(_args) {

	if (!isAndroid) {
		return Ti.UI.createTabGroup(_args);
	}

	// need to roll our own
	_args = _args || {};
	_args.isTabGroup = true;
	_args.exitOnClose = true;

	// Is is actually a window
	var tabGroup = new SmartObject();
	var tabGroupBase = exports.createWindow(_args);

	var WINDOW_TOP = NAVBAR_HEIGHT + TAB_HEIGHT;

	var tabView = Ti.UI.createView({
		top : 0,
		height : TAB_HEIGHT,
		backgroundColor : '#161616'
	});
	tabGroupBase.add(tabView);

	var tabViews = [];
	var activeTab = 0;
	tabGroup.tabs = [];

	tabGroup.activeTab = {};
	tabGroup.activeTab.open = function(win) {
		win.addBackButton(win.backButtonTitle || tabGroup.tabs[activeTab].window.title);
		win.open({
			modal : true,
			navBarHidden : true,
			animated : true
		});
	}
	function createTabView(tab) {

	}

	function drawTabs() {
		var numberOfTabs = tabGroup.tabs.length;
		var needMoreButton = false;
		if (numberOfTabs > 5) {
			needMoreButton = true;
			numberOfTabs = 4;
		}
		var leftTracker = 0;
		for (var i = 0; i < numberOfTabs; i++) {
			var tab = Ti.UI.createView({
				width : Ti.Platform.displayCaps.platformWidth / numberOfTabs,
				left : leftTracker
			});
			var image = Ti.UI.createImageView({
				height : (NAVBAR_HEIGHT - 16),
				image : tabGroup.tabs[i].icon,
				top : 0
			});
			tab.add(image);
			var label = Ti.UI.createLabel({
				text : tabGroup.tabs[i].title,
				textAlign : 'center',
				height : 16,
				bottom : 1,
				font : {
					fontSize : 11
				}
			});
			tab.label = label;
			tab.add(label);
			var overlay = Ti.UI.createView({

			});
			overlay.myIndex = i;
			overlay.addEventListener('click', function(e) {
				tabGroup.setActiveTab(e.source.myIndex);
			});
			tab.add(overlay);
			leftTracker += tab.width;
			tabViews.push(tab);
			tabView.add(tab);
		}
	};

	// Need an add
	tabGroup.addTab = function(tab) {
		tabGroup.tabs.push(tab);
		var win = tab.window;
		win._tabParent = tabGroupBase;
		win.navBarHidden = true;
		win.top = WINDOW_TOP;
	}

	tabGroup.setActiveTab = function(tab) {
		activeTab = tab;
		// TODO - be a bit smarter about opening / showing
		for (var i = 0; i < tabViews.length; i++) {
			if (i == tab) {
				tabViews[i].label.color = 'white';
				tabViews[i].backgroundColor = '#808080';
				var win = tabGroup.tabs[i].window;
				win.open();
				win.show();
				for (var j = 0; j < navBarProperties.length; j++) {
					var prop = navBarProperties[j];
					tabGroupBase[prop] = win[prop];
				}
			} else {
				tabViews[i].label.color = '#969696';
				tabViews[i].backgroundColor = 'Transparent';
				tabGroup.tabs[i].window.hide();
			}
		}
	}

	tabGroup.open = function() {
		tabGroupBase.open();
	}

	tabGroup.close = function() {
		tabGroupBase.close();
	}

	tabGroupBase.addEventListener('open', function() {
		drawTabs();
		tabGroup.setActiveTab(0);
	});

	return tabGroup;

};

function XTab(params) {
	var self = this;
	for (prop in params ) {
		self[prop] = params[prop];
	}
	return self;
};

exports.createTab = function(params) {

	if (isAndroid) {
		return new XTab(params);
	} else {
		return Ti.UI.createTab(params);
	}

};
