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
			 * it's pointless to call this recursively for
			 * nested templates...
			 */
			var isRoot = _root ? false : (_root = true),
				result = _update.apply(this, arguments);
				
			if(isRoot)
			{
				/*
				 * when a template is written,
				 * the element (e) that has the data-bind tag
				 * is replaced, instead of just filled.
				 * we need to find the closest parent
				 * of this element, that is a jquery mobile widget. If the widget is
				 * refreshable, we need to refresh it, otherwise
				 * we need to trigger it's create
				 * event, which will signal jquery mobile to
				 * create any child widgets.
				 */
				var elem = $(e),
					parent = elem.parent(),
					widget = parent.closest(':jqmData(role)'),
					role = widget.jqmData('role').replace('-','');
				
				try
				{
					/*
					 * this is incredibly brute force, but I
					 * don't know of a way to check if a
					 * jquery mobile widget has a refresh method
					 */
					widget[role]('refresh');
				}
				catch(exp)
				{
					widget.trigger('create');
				}
				
				_root = false;
			}
			
			return result;
		};
		
	});