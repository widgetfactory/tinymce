/**
 * ForceBlocks.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

tinymce.ForceBlocks = function(editor) {
	var settings = editor.settings, dom = editor.dom, selection = editor.selection, blockElements = editor.schema.getBlockElements();

	function addRootBlocks() {
		var node = selection.getStart(), rootNode = editor.getBody(), rng, startContainer, startOffset, endContainer, endOffset, rootBlockNode, tempNode, offset = -0xFFFFFF, wrapped, isInEditorDocument;

		forcedRootBlock = settings.forced_root_block;

			if (!node || node.nodeType !== 1 || !forcedRootBlock) {
				return;
			}

			// Check if node is wrapped in block
			while (node && node != rootNode) {
				if (blockElements[node.nodeName]) {
					return;
				}

				node = node.parentNode;
			}

		// Get current selection
		rng = selection.getRng();
		if (rng.setStart) {
			startContainer = rng.startContainer;
			startOffset = rng.startOffset;
			endContainer = rng.endContainer;
			endOffset = rng.endOffset;
			
			try {
				restoreSelection = editor.getDoc().activeElement === rootNode;
			} catch (ex) {
				// IE throws unspecified error here sometimes
			}
			
		} else {
			// Force control range into text range
			if (rng.item) {
				node = rng.item(0);
				rng = editor.getDoc().body.createTextRange();
				rng.moveToElementText(node);
			}

			restoreSelection = rng.parentElement().ownerDocument === editor.getDoc();
			tmpRng = rng.duplicate();
			tmpRng.collapse(true);
			startOffset = tmpRng.move('character', offset) * -1;

			if (!tmpRng.collapsed) {
				tmpRng = rng.duplicate();
				tmpRng.collapse(false);
				endOffset = (tmpRng.move('character', offset) * -1) - startOffset;
			}
		}

		// Wrap non block elements and text nodes
		node = rootNode.firstChild;
		rootNodeName = rootNode.nodeName.toLowerCase();
		while (node) {
			if (node.nodeType === 3 || (node.nodeType == 1 && !blockElements[node.nodeName] && !node.getAttribute('data-mce-type')) &&
					editor.schema.isValidChild(rootNodeName, forcedRootBlock.toLowerCase())) {
				// Remove empty text nodes
				if (node.nodeType === 3 && node.nodeValue.length == 0) {
					tempNode = node;
					node = node.nextSibling;
					dom.remove(tempNode);
					continue;
				}

				if (!rootBlockNode) {
					rootBlockNode = dom.create(settings.forced_root_block, editor.settings.forced_root_block_attrs);
					node.parentNode.insertBefore(rootBlockNode, node);
					wrapped = true;
				}

				tempNode = node;
				node = node.nextSibling;
				rootBlockNode.appendChild(tempNode);
			} else {
				rootBlockNode = null;
				node = node.nextSibling;
			}
		}

		if (wrapped && restoreSelection) {
				if (rng.setStart) {
					rng.setStart(startContainer, startOffset);
					rng.setEnd(endContainer, endOffset);
					selection.setRng(rng);
				} else {
					// Only select if the previous selection was inside the document to prevent auto focus in quirks mode
					try {
						rng = editor.getDoc().body.createTextRange();
						rng.moveToElementText(rootNode);
						rng.collapse(true);
						rng.moveStart('character', startOffset);

						if (endOffset > 0) {
							rng.moveEnd('character', endOffset);
						}

						rng.select();
					} catch (ex) {
						// Ignore
					}
				}

				editor.nodeChanged();
			}
	};

	// Force root blocks
	if (settings.forced_root_block) {
		editor.onKeyUp.add(addRootBlocks);
		editor.onNodeChange.add(addRootBlocks);
	}
};
