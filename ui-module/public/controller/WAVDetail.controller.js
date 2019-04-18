sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"com/sap/ec/engagementcontext/ui/customcontrols/WorkareaViewController",
	"sap/ui/model/json/JSONModel",
	"com/sap/ec/engagementcontext/ui/util/Util",
	"com/sap/ec/engagementcontext/ui/util/UtilManager",
	"com/sap/ec/engagementcontext/ui/bcd/SaveState",
	"com/sap/ec/engagementcontext/ui/bcd/BusinessDocumentManager"
], function (Controller, oWorkareaViewController, JSONModel, Util, UtilManager, SaveState, BusinessDocumentManager) {
	"use strict";

	return oWorkareaViewController.extend("com.sap.ec.moduletemplate.controller.WAVDetail", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.sap.ec.moduletemplate.view.WAVDetail
		 */
		onInit: function () {
			Object
				.getPrototypeOf(com.sap.ec.moduletemplate.controller.WAVDetail.prototype).initWorkareaView
				.call(this, {
					"beforeCancelContext": false,
					"beforeCloseContext": false
				});

			// view initialization parameters & global object references are accessible with controller variable oViewData
			this.getBCD().subscribe(
				com.sap.ec.engagementcontext.ui.bcd.Events.AccountConfirmed,
				this.onAccountConfirmed, this);

			this.getBCD().subscribe(
				com.sap.ec.engagementcontext.ui.bcd.Events.AccountUnconfirmed,
				this.onAccountUnconfirmed, this);


			this.orderServiceURL = "./scc/module_ext-service/order";

			// Differ logic between Edit an order and creating a new order.
			if (this.oViewData.oData.saveState !== SaveState.New) {
				var oModel = new JSONModel();
				var orderId = this.getView().getViewData().oData.businessDocumentId;
				// Log error message in case of failing request like Unauthorized!
				oModel.attachRequestFailed(
					this._logRequestError("MESSAGE_DOCUMENT_READ_FAILED", "MESSAGE_DOCUMENT_READ_FAILED_LONG")
				);
				// load data of the respective order from customer service for the model
				oModel.loadData(this.orderServiceURL + "/" + orderId);
				// set the model to the core
				this.getView().setModel(oModel);
			}
		},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf com.sap.ec.moduletemplate.view.WAVDetail
		 */
		onExit: function () {

			Object
				.getPrototypeOf(com.sap.ec.moduletemplate.controller.WAVDetail.prototype).onExit
				.call(this);

			this.getBCD().unsubscribe(
				com.sap.ec.engagementcontext.ui.bcd.Events.AccountConfirmed,
				this.onAccountConfirmed, this);

			this.getBCD().unsubscribe(
				com.sap.ec.engagementcontext.ui.bcd.Events.AccountUnconfirmed,
				this.onAccountUnconfirmed, this);
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
			var sDocumentId = this.getView().getViewData().oData.businessDocumentId;

			if (this.oViewData.oData.saveState === SaveState.New) {
				sDocumentId = UtilManager.getInstance().getText("NEW_ORDER_TEXT");
			}

			return {
				"title": "Order (" + sDocumentId + ")",
				"tooltip": "Order (" + sDocumentId + ")"
			};
		},


		/**
		 * Overwrite this method to implement
		 * your own logic whether your document
		 * contains unsaved changes.
		 *
		 * <pre>
		 *       true: there are unsaved changes, ask for confirmation
		 *       false: no unsaved changes, view can be closed immediately
		 * </pre>
		 *
		 * Overwrite this method and implement
		 * your specific logic.
		 */
		isSaveNeeded: function () {
			return true;
		},


		/**
		 * Save event handler. It uses jquery.ajax to make request to the service,
		 * but you can also choose your prefered way to communicate to a service.
		 */
		handleSavePress: function () {
			var that = this;

			var option = {
				url: this.orderServiceURL,
				headers: {
					"Content-Type": "application/json"
				},
				data: JSON.stringify({
					"title": this.byId("input-order-title").getValue()
				}),
				context: this,
				async: true,
				success: this._saveSuccess,
				error: this._logRequestError("MESSAGE_DOCUMENT_SAVE_FAILED", "MESSAGE_DOCUMENT_SAVE_FAILED_LONG")
			}

			// Differ logic between create a new order and and update an existing one
			if (this.oViewData.oData.saveState === SaveState.New) {
				option.type = "POST";
			} else {
				option.type = "PUT";
				option.url = option.url + "/" + this.getView().getViewData().oData.businessDocumentId;
			}

			this._fetshXSRF(
				function (data, textStatus, jqXHR) {
					option.headers['x-csrf-token'] = jqXHR.getResponseHeader('x-csrf-token');
					jQuery.ajax(option);
				},
				this._logRequestError("MESSAGE_DOCUMENT_SAVE_FAILED", "MESSAGE_DOCUMENT_SAVE_FAILED_LONG")
			);
		},

		
		/**
		 * Delete event handler. It uses jquery.ajax to make request to the service,
		 * but you can also choose your prefered way to communicate to a service.
		 */
		handleDeletePress: function () {
			var option = {
				type: "DELETE",
				url: this.orderServiceURL + "/" + this.getView().getViewData().oData.businessDocumentId,
				headers: {
					"Content-Type": "application/json"
				},
				context: this,
				async: true,
				success: this._deleteSuccess,
				error: this._logRequestError("MESSAGE_DOCUMENT_DELETE_FAILED", "MESSAGE_DOCUMENT_DELETE_FAILED_LONG")
			};
			
			var that = this;
			this._fetshXSRF(
				function (data, textStatus, jqXHR) {
					option.headers['x-csrf-token'] = jqXHR.getResponseHeader('x-csrf-token');
					jQuery.ajax(option);
				},
				this._logRequestError("MESSAGE_DOCUMENT_DELETE_FAILED", "MESSAGE_DOCUMENT_DELETE_FAILED_LONG")
			);
		},


		handleCancelPress: function () {
			this.closeCurrentView();
		},


		// Fetch at first the XSRF-Token
		_fetshXSRF: function (callbackSuccess, callbackError) {
			jQuery.ajax({
				type: "GET",
				url: this.orderServiceURL,
				headers: { "x-csrf-token": "fetch" },
				success: callbackSuccess,
				error: callbackError,
			});
		},


		_saveSuccess: function (data, textStatus, jqXHR) {
			/*
			 * When creating new document:
			 * After successful save, ensure returned document id is updated within BCD
			 */
			this.getBCD().saveBusinessDocument(
				BusinessDocumentManager.getInstance().getBusinessDocumentJson(
					"Module_Template_BDT", // YOUR BUSINESS DOCUMENT TYPE
					data.id, // NEWLY SAVED BUSINESS DOCUMENT ID
					SaveState.Saved,
					data //DOCUMENT IN JSON FORMAT
				),
				this.oViewData.oData.businessDocumentId
			);

			this.oViewData.oData.businessDocumentId = data.id;
			this.oViewData.oData.saveState = SaveState.Saved;
			this.updateWorkareaViewTexts();
		},


		_deleteSuccess: function (data, textStatus, jqXHR) {
			this.closeCurrentView();
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
