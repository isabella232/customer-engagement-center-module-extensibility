sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"com/sap/ec/engagementcontext/ui/customcontrols/WorkareaViewController",
	"sap/ui/model/json/JSONModel",
	"com/sap/ec/engagementcontext/ui/bcd/SaveState",
	"com/sap/ec/engagementcontext/ui/bcd/BusinessDocumentManager",
	"com/sap/ec/engagementcontext/ui/bcd/BusinessDocumentAction"
], function (Controller, oWorkareaViewController, JSONModel, SaveState, BusinessDocumentManager, BusinessDocumentAction) {
	"use strict";

	return oWorkareaViewController.extend("com.sap.ec.moduletemplate.controller.WAVSearch", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.sap.ec.moduletemplate.view.WAVSearch
		 */
		onInit: function () {
			Object
				.getPrototypeOf(com.sap.ec.moduletemplate.controller.WAVSearch.prototype).initWorkareaView
				.call(this, {
					"beforeCancelContext": false,
					"beforeCloseContext": false
				});


			this.orderServiceURL = "./scc/module_ext-service/order";


			var oModel = new JSONModel();
			// Log error message in case of failing request like Unauthorized!
			oModel.attachRequestFailed(
				this._logRequestError("MESSAGE_DOCUMENT_READ_FAILED", "MESSAGE_DOCUMENT_READ_FAILED_LONG")
			);
			// load data from customer service for the model
			oModel.loadData(this.orderServiceURL);
			// set the model to the core
			this.getView().setModel(oModel);

			// view initialization parameters & global object references are accessible with controller variable oViewData
			this
				.getBCD()
				.subscribe(
					com.sap.ec.engagementcontext.ui.bcd.Events.AccountConfirmed,
					this.onAccountConfirmed, this);

			this
				.getBCD()
				.subscribe(
					com.sap.ec.engagementcontext.ui.bcd.Events.AccountUnconfirmed,
					this.onAccountUnconfirmed, this);

			this.initialLoad = true;

			//this.byId("textDocumentId").setText(this.getView().getViewData().oData.businessDocumentId);

			// Clear all messages
			this.clearAllMessages();
			this.updateMessageArea();

		},


		handleOrderItemPress: function (event) {
			var item = event.getSource(),
				index = item.getParent().indexOfItem(item),
				orderItem = this.getView().getModel().getData()[index];

			// Navigation to Order Detail Work Area View
			var oBusinessDocumentNavigator = BusinessDocumentManager.getInstance().getBusinessDocumentNavigator(
				"Module_Template_BDT",
				orderItem.id,
				SaveState.Edit,
				orderItem,
				BusinessDocumentAction.Edit,
				this.oViewData.oBusinessContextData
			);
			this.oViewData.oBusinessContextData.openBusinessDocument(oBusinessDocumentNavigator);
		},


		handleRefreshPress: function () {
			this.getView().getModel().loadData(this.orderServiceURL);
			this.getView().getModel().refresh(true);
		},


		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf com.sap.ec.moduletemplate.view.WAVSearch
		 */
		onExit: function () {
			Object
				.getPrototypeOf(com.sap.ec.moduletemplate.controller.WAVSearch.prototype).onExit
				.call(this);
		},

		/**
		 * return business document type
		 */
		getBusinessDocumentType: function () {
			return this.getView().getViewData().oData.businessDocumentType;
		},

		/**
		 * return business document id
		 */
		getBusinessDocumentId: function () {
			return this.getView().getViewData().oData.businessDocumentId;
		},

		/**
		 * Mandatory function for the Engagement Context
		 *
		 * If you specify the opened View then the Engagement
		 * Context need to know some ID of this view. E.g. if this
		 * is a creation view of a document with the ID xy, then the
		 * Object ID is xy. The title is the title of the opened
		 * view and the tooltip is used for some feedback messages
		 * that references on this view.
		 */
		getWorkareaViewTexts: function () {
			jQuery.sap.require("com.sap.ec.engagementcontext.ui.util.Util");

			var sText = com.sap.ec.engagementcontext.ui.util.UtilManager
				.getInstance().getText("SEARCH_ORDER_TEXT");

			return {
				"title": sText,
				"tooltip": sText
			};
		},

		_logRequestError: function(messageTitle, messageLong){
			var that = this;
			return function(responseObject){
				var errorReason = (responseObject.responseText) ? responseObject.responseText : responseObject.mParameters.responseText;
				that.logMessage(messageTitle, messageLong, errorReason);
			}
		},

		/**
		 * Log messages
		 * 
		 * @param sI18nText - Message text
		 * @param sI18nTextLong - Message long text
		 * @param aI18NParameters - Message Parameters. Embedded within message text for sI18nTextLong
		 */
		logMessage: function (sI18nText, sI18nTextLong, aI18NParameters) {

			var sErrorMessage = this.getView().getModel("i18n").getResourceBundle().getText(sI18nText);
			var sErrorMessageLong = (sI18nTextLong) ? this.getView().getModel("i18n").getResourceBundle().getText(sI18nTextLong, aI18NParameters) : "";

			this.raiseErrorMessage({
				"messageShort": sErrorMessage,
				"messageLong": sErrorMessageLong,
				"isGlobalMessage": false
			});

			this.updateMessageArea();
		}
	});

});
