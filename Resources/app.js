// this sets the background color of the master UIView (when there are no windows/tab groups on it)
Ti.UI.setBackgroundColor('#000');

// Shim for TiShadow
try {
	exports.close = function() {
		tabGroup.close();
	};
	Ti.API.info("Running in TiShadow");
} catch (e) {
	Ti.API.info("Running stand-alone");
}

var xui = require('xui');
// Want to see the standard Ti UI? Just UnREM the line below:
//xui = Ti.UI;

// create tab group
var tabGroup = xui.createTabGroup();

function createWindow1() {

	var barColors = ['orange', 'green', 'blue', 'red', 'yellow', 'black', null];
	var currentColor = 0;
	var win = xui.createWindow({
		title : 'Title Bar Colors',
		barColor : barColors[currentColor],
		backgroundColor : 'white'
	});

	var button = Ti.UI.createButton({
		top : 10,
		width : '80%',
		height : 44,
		title : 'change title bar color'
	});

	button.addEventListener('click', function() {
		currentColor++;
		if (currentColor >= barColors.length) {
			currentColor = 0;
		}
		win.barColor = barColors[currentColor];
	});

	win.add(button);
	return win;
};

function createWindow2() {
	var win2 = xui.createWindow({
		title : 'Title Bar Graphics',
		backgroundColor : 'white',
		barImage : '/images/redpaper.png'
	});

	var lastTitle = "New Title";

	var logo = Ti.UI.createImageView({
		image : 'title_logo.png'
	});

	var button1 = Ti.UI.createButton({
		height : 44,
		width : '80%',
		title : 'Toggle Title',
		top : 20
	});

	button1.addEventListener('click', function() {
		win2.titleControl = null;
		var temp = win2.title;
		win2.title = lastTitle;
		lastTitle = temp;
	});

	var button2 = Ti.UI.createButton({
		height : 44,
		width : '80%',
		title : 'Show Graphic',
		top : 84
	});

	button2.addEventListener('click', function() {
		win2.titleControl = logo;
	});

	win2.add(button1);
	win2.add(button2);

	var testNavButton = Ti.UI.createButton({
		title : "custom",
		height : 30,
		width : 60,
		backgroundImage : "/images/red_button.png",
		color : 'white',
		font : {
			fontSize : 12,
			fontWeight : 'bold'
		}
	});

	testNavButton.addEventListener('click', function() {
		alert('got clicked...');
	});

	win2.leftNavButton = testNavButton;

	return win2;

};

function createWindow3() {

	var win = xui.createWindow({
		title : 'Opening Windows',
		backgroundColor : 'white',
	});

	var button1 = Ti.UI.createButton({
		height : 44,
		title : 'Open Window 1',
		width : '80%',
		top : 10
	});

	button1.addEventListener('click', function() {
		var nextWin = xui.createWindow({
			title : 'Next Window',
			backgroundColor : 'white'
		});
		var testNavButtonOnSub = Ti.UI.createButton({
			title : 'subwindow'
		});
		testNavButtonOnSub.addEventListener('click', function() {
			alert('heard click on subwindow');
		});
		nextWin.rightNavButton = testNavButtonOnSub;
		tabGroup.activeTab.open(nextWin);
	});

	win.add(button1);

	var button2 = Ti.UI.createButton({
		height : 44,
		title : 'Open Window 2',
		width : '80%',
		top : 64
	});

	button2.addEventListener('click', function() {
		var nextWin = xui.createWindow({
			title : 'Next Window',
			backgroundColor : '#888',
			backButtonTitle : 'custom',
			barColor : 'navy'
		});
		tabGroup.activeTab.open(nextWin);
	});

	win.add(button2);

	return win;

};

function createWindow4() {

	var win = xui.createWindow({
		title : 'Nav Buttons',
		backgroundColor : '#fff',
		layout : 'vertical',
		barColor : '#333'
	});

	var left = Ti.UI.createButton({
		title : 'test'
	});

	left.addEventListener('click', function() {
		alert('left button');
	});

	var left2 = Ti.UI.createButton({
		image : '/images/burger.png'
	});

	left2.addEventListener('click', function() {
		alert('burger button');
	});

	win.leftNavButton = left;

	var right = Ti.UI.createButton({
		title : '+'
	});

	right.addEventListener('click', function() {
		alert('right button');
	});

	win.rightNavButton = right;

	var button2 = Ti.UI.createButton({
		title : '2'
	});

	button2.addEventListener('click', function() {
		alert('button2');
	});

	var button3 = Ti.UI.createButton({
		title : 'three'
	});

	button3.addEventListener('click', function() {
		alert('button three');
	});

	var currentButton = 0;
	var buttons = [right, button2, button3, null];

	var buttonChange = Ti.UI.createButton({
		top : 10,
		height : 44,
		width : '80%',
		title : 'Change Right Button'
	});

	buttonChange.addEventListener('click', function() {
		currentButton++;
		if (currentButton == buttons.length) {
			currentButton = 0;
		}
		win.rightNavButton = buttons[currentButton];
	});

	var buttonChange2 = Ti.UI.createButton({
		top : 10,
		height : 44,
		width : '80%',
		title : 'Change Left Button'
	});

	buttonChange2.addEventListener('click', function() {
		if (win.leftNavButton == left) {
			win.leftNavButton = left2;
		} else {
			win.leftNavButton = left;
		}
	});

	var label = Ti.UI.createLabel({
		text : "This window has a vertical layout",
		top : 10,
		width : '80%'
	});

	win.add(label);
	win.add(buttonChange);
	win.add(buttonChange2);

	return win;

};

var win1 = createWindow1();
var win2 = createWindow2();
var win3 = createWindow3();
var win4 = createWindow4();

var tab1 = xui.createTab({
	icon : 'KS_nav_views.png',
	title : 'Title Bar Colors',
	window : win1
});

var tab2 = xui.createTab({
	icon : 'KS_nav_ui.png',
	title : 'Title Bar Graphics',
	window : win2
});

var tab3 = xui.createTab({
	icon : 'KS_nav_ui.png',
	title : 'Opening Windows',
	window : win3
});

var tab4 = xui.createTab({
	icon : 'KS_nav_ui.png',
	title : 'Nav Buttons',
	window : win4
});

tabGroup.addTab(tab1);
tabGroup.addTab(tab2);
tabGroup.addTab(tab3);
tabGroup.addTab(tab4);

// open tab group
tabGroup.open();
