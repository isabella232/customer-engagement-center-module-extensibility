sap.ui.define("com/sap/ec/moduletemplate/helper/bcdhelper", [
	"com/sap/ec/engagementcontext/ui/bcd/BcdItem",
	"com/sap/ec/engagementcontext/ui/bcd/BcdItemKeys"
], function (BcdItem, BcdItemKeys) {
	"use strict";
	return BcdItem.extend("com.sap.ec.moduletemplate.helper.bcdhelper", {
		/**
		 * Initialization: initialize the data container.
		 * @param {object} oArgData data
		 */
		constructor: function (oArgData) {
			BcdItem.call(this, oArgData, "Module_Template_ItemKey");

		}

	});
});