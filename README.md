# TiXUI
This is an example that gives Android apps developed with Appcelerator Titanium much more parity with iOS' 'navBar'. I created this to reduce the amount of braching code I needed to write to get a functional Android App up and running.

![demo](https://dl.dropboxusercontent.com/u/843217/xui_screen.jpg)

The goal of this project is to allow to write code like `win.rightNavButton = button` on Android and have it work.

The current version supports a custom 'TabGroup' with a navBar above it and ads the following functions to Android windows.
```barColor
title
titleControl
barImage
rightNavButton
leftNavButton
```

To create a window using this framework, just swap out `Ti.UI.createWindow` with `require('xui').createWindow`

## Notes
On iOS, createWindow, createTab, and createTabGroup give you the same as if you used their Ti.UI functions.  On Android, you get back a pure JS wrapper object - not a real Ti 'proxy' object.  This shouldn't limit you much, but be aware.

There is still lots of work to do with this, and I'll be improving it as I use it in anger.
