/* 
 * This script is designed to auto correct some conflicts between
 * kockout.js and jquery.mobile.js
 * it needs to be added to the document after jquery, but before jquery.mobile
 * written by Master Morality.
 */

$(document)
	.bind('mobileinit',function(){ 
		/*
 		 * postpone mobile init
 		 * we need to make sure that ko.applyBindings(...)
 		 * is called prior to $.mobile.initializePage(), so that any
 		 * inline templates are parsed without added classes etc.
 		 */
		$.mobile.autoInitializePage = false; 
	})
	.bind('ready',function(){
		/*
		 * initialized page.
		 * we assume that ko.applyBindings(...) has been called ala:
		 * $(function(){... ko.applyBindings(...); });
		 * somewhere in the body, or at least has been call in
		 * a 'ready' event handler prior to now.
		 */
		$.mobile.initializePage();
		
		/*
		 * overwrite template update binding helper,
		 * this must be done after $.mobile.initializePage()
		 * because we want any initial data binding
		 * to work correctly. once the initial structure
		 * has been created, we are only worried about
		 * changes.
		 */
		var _update = ko.bindingHandlers.template.update,
			_root = false;
			
		ko.bindingHandlers.template.update = function(e){
			
			/*
			 * We don't want to enhance elements
			 * that were added as children of a root
			 * template, because they will be enhanced
			 * anyway once the parent element is
			 * enhanced.
			 */
			var isRoot = _root ? false : (_root = true),
				result = _update.apply(this, arguments);
				
			if(isRoot)
			{
				var elem = $(e);
				
				/*
				 * jQuery Mobile doesn't process pages
				 * until they are navigated to for the first time. 
				 * This can cause a problem with elements 
				 * being enhanced before their pages are.
				 * However, we only need to worry about
				 * enhanced pages anyway, because once
				 * a page is initially enhanced, it automatically
				 * enhances it's descendants.
				 */
				var page = elem.closest('.ui-page')[0];
				
				if( page )
				{
					/*
					 * when a template is rendered,
					 * the element is replaced, this will
					 * remove any enhancement that jQuery mobile has
					 * applied. 
					 * 
					 * In order to re-apply the enhancement,
					 * we need to find the closest parent widget.
					 */
					var widget = elem.parent(':jqmData(role)');
					
					/*
					 * we also need to divine what this widget
					 * is, so we can figure out if it can be
					 * refreshed or not.
					 */
					var widgetRole = widget.jqmData('role').replace('-',''),
						widgetInstance = widget.jqmData(widgetRole),
						widgetIsRefreshable = widgetInstance && $.isFunction(widgetInstance['refresh']);
						
					if( widgetIsRefreshable ){
						widgetInstance['refresh']();
					} else {
						/*
						 * if a widget isn't refreshable
						 * we need to do it the old fashion way.
						 */
						widget.trigger('create');
					}
					
				}
				
				_root = false;
			}
			
			return result;
		};
		
	});