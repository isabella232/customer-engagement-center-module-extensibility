sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"com/sap/ec/engagementcontext/ui/customcontrols/ActionTileViewController",
	"com/sap/ec/engagementcontext/ui/bcd/BusinessDocumentManager",
	"com/sap/ec/engagementcontext/ui/bcd/BusinessDocumentAction",
	"com/sap/ec/engagementcontext/ui/bcd/SaveState"
], function(Controller, oActionTileViewController, BusinessDocumentManager, BusinessDocumentAction, SaveState) {
	"use strict";

	return oActionTileViewController.extend("com.sap.ec.moduletemplate.controller.AAV", {

			/**
			 * Called when a controller is instantiated and its View controls (if available) are already created.
			 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
			 * @memberOf com.sap.ec.moduletemplate.view.AAV
			 */
			onInit: function() {
				Object
					.getPrototypeOf(com.sap.ec.moduletemplate.controller.AAV.prototype).initActionTileView
					.call(this);
				// view initialization parameters & global object references are accessible with controller variable oViewData
			},

			/**
			 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
			 * @memberOf com.sap.ec.moduletemplate.view.AAV
			 */
			onExit: function() {
				Object
					.getPrototypeOf(com.sap.ec.moduletemplate.controller.AAV.prototype).onExit
					.call(this);
			},

			/**
			 * Direct way to navigate
			 */
			onNavToWorkArea1: function(oEvent) {
				this.oViewData.oBusinessContextData.openWorkareaView(
					"WorkAreaView_Template_1",
					BusinessDocumentAction.Search
				);
			},

			/**
			 * Navigation with help of the Business Object
			 */
			onNavToWorkArea2: function(oEvent) {
				var sNewDocId = BusinessDocumentManager.getInstance().generateId();
				var oBusinessDocumentNavigator = BusinessDocumentManager.getInstance().getBusinessDocumentNavigator(
					"Module_Template_BDT",
					sNewDocId,
					SaveState.New,
					{
						id: sNewDocId
					},
					BusinessDocumentAction.Create,
					this.oViewData.oBusinessContextData
				);
				this.oViewData.oBusinessContextData.openBusinessDocument(oBusinessDocumentNavigator);
			}
	});

});
