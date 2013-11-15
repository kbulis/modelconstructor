/*!
 * knockoutJs ModelConstructor plugin
 *
 * Original author: @kbulis
 *
 * Further changes, comments: @kbulis
 *
 * Licensed under the MIT license
 *
 */
; (function (ko, undefined) {
	if (typeof(ko) !== "undefined") {
	    ko.model = function (oModel, oThat) {
	        function walk(oCurrent, oThat) {
	            for (var sProp in oCurrent) {
	                var sType = typeof (oCurrent[sProp]);
	
	                if (sType === "string" || sType === "number" || sType === "boolean") {
	                    oThat[sProp] = ko.observable(oCurrent[sProp]);
	                }
	                else
	                if (sType === "object") {
	                    if (typeof (oCurrent[sProp].length) === "undefined") {
	                        oThat[sProp] = ko.observable(walk(oCurrent[sProp], {}));
	                    }
	                    else {
	                        oThat[sProp] = ko.observableArray();
	
	                        for (var i = 0; i < oCurrent[sProp].length; ++i) {
	                            oThat[sProp].push(walk(oCurrent[sProp][i], {}));
	                        }
	                    }
	                }
	            }
	
	            return oThat;
	        }
	
	        return walk(oModel, oThat || {});
	    };

	    ko.bindingHandlers.using = {
	        init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
	        	var oV = valueAccessor();

	        	if (typeof(oV) !== "object" || oV === null) {
	                throw new Error("using binding requires valid object");
	        	}

	        	ko.applyBindingsToDescendants(bindingContext.createChildContext(oV), element);
	        	
	        	return { "controlsDescendantBindings": true };
	        }
	    };

	    ko.virtualElements.allowedBindings.using = true;
	    
	    ko.Controller = function (oItem) {
	    	this.updating = ko.observable(false);
	    	this.nowfocus = ko.observable(false);
	    	this.invoking = ko.observable(false);
	    	this.haserror = ko.observable(false);
	    	this.errormsg = ko.observable(false);

	    	this.keep = {};
	    	
	    	for (var sProp in oItem) {
	    		if (typeof(oItem[sProp]) === "function" && typeof(oItem[sProp]["subscribe"]) === "function") {
	    			var oProp = oItem[sProp]();
	    			
	    			if (typeof(oProp) === "string") {
	    				this.keep[sProp] = oProp;
	    			}
	    		}
	    	}

			this.item = oItem;
	    };
	
		ko.Controller.prototype.change = function (oItem) {
			this.invoking(false);
			this.haserror(false);
			this.nowfocus(false);
			this.updating(false);
			
	    	this.keep = {};
	    	
	    	for (var sProp in oItem) {
	    		if (typeof(oItem[sProp]) === "function" && typeof(oItem[sProp]["subscribe"]) === "function") {
	    			var oProp = oItem[sProp]();
	    			
	    			if (typeof(oProp) === "string") {
	    				this.keep[sProp] = oProp;
	    			}
	    		}
	    	}

	    	this.item = oItem;
		};
	
		ko.Controller.prototype.failed = function (sError) {
			this.errormsg(sError);

			this.invoking(false);
			this.nowfocus(false);
	
			this.haserror(true);

			console.log(sError);
		};

		ko.Controller.prototype.revert = function () {
			for (var sProp in this.keep) {
				if (typeof(this.keep[sProp]) === "string") {
					this.item[sProp](this.keep[sProp]);
				}
			}

			this.errormsg("");
			
			this.invoking(false);
			this.haserror(false);
			this.updating(false);
			this.nowfocus(false);
		};

		ko.Controller.prototype.update = function () {
			this.updating(true);
			this.nowfocus(true);
		};
		
		ko.Controller.prototype.invoke = function () {
			this.invoking(true);
		};		    

		ko.as = function (tBase, fType) {
			var fWrap = function () {
				tBase.apply(this, arguments);
				fType.apply(this, arguments);
			};
			
			fWrap.prototype = new tBase();
			fWrap.prototype.constructor = fWrap;
			
			return fWrap;
		}
	}
})(ko);