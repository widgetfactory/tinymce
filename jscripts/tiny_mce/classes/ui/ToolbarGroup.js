/**
 * ToolbarGroup.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

(function(tinymce) {
// Shorten class names
var dom = tinymce.DOM, each = tinymce.each, Event = tinymce.dom.Event;
/**
 * This class is used to group a set of toolbars together and control the keyboard navigation and focus.
 *
 * @class tinymce.ui.ToolbarGroup
 * @extends tinymce.ui.Container
 */
tinymce.create('tinymce.ui.ToolbarGroup:tinymce.ui.Container', {
	/**
	 * Renders the toolbar group as a HTML string.
	 *
	 * @method renderHTML
	 * @return {String} HTML for the toolbar control.
	 */
	renderHTML : function() {
		var t = this, h = [], controls = t.controls, each = tinymce.each, settings = t.settings;

		h.push('<div id="' + t.id + '" role="group">');

		each(controls, function(toolbar) {
			h.push(toolbar.renderHTML());
		});

		h.push('</div>');

		return h.join('');
	},
	
	focus : function() {
		var t = this;
		dom.get(t.id).focus();
	},
	
	postRender : function() {
		var t = this, items = [];

		each(t.controls, function(toolbar) {
			each (toolbar.controls, function(control) {
				if (control.id) {
					items.push(control);
				}
			});
		});

		t.keyNav = new tinymce.ui.KeyboardNavigation({
			root: t.id,
			items: items,
			onCancel: function() {
				//Move focus if webkit so that navigation back will read the item.
				if (tinymce.isWebKit) {
					dom.get(t.editor.id+"_ifr").focus();
				}
				t.editor.focus();
			},
			excludeFromTabOrder: !t.settings.tab_focus_toolbar
		});
	},
	
	destroy : function() {
		var self = this;

		self.parent();
		self.keyNav.destroy();
		Event.clear(self.id);
	}
});
})(tinymce);
