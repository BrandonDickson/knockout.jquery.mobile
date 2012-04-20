/* 
 * This script is designed to auto correct some conflicts between
 * kockout.js and jquery.mobile.js
 * written by Master Morality.
 */
$(document)
	.bind('mobileinit', function(){
		/*
		 * we have to postpone jquery mobile's page initialization,
		 * otherwise it will add a bunch of elements to our inline
		 * templates.
		 */
		$.mobile.autoInitializePage = false; 
	})
	.bind('ready', function(){

		if($.mobile)
		{
			/*
			 * Any template parsing should have been taken care of by now.
			 */
			$.mobile.initializePage();
		
			/*
			 * a little extension method that applies the appropriate
			 * data role widgets to affected elements
			 * (this must still be called in custom binding handlers, if needed)
			 */
			$.fn.mobilize = function(){
				this.each(function(){
					/*
					 * knockout templates can sometimes use
					 * comments for control statements
					 * so we need to get the closest
					 * parent with a data role
					 */
					var that = $(this),
						root = this.nodeType == 8 
							? that.closest(':jqmData(role)')
							: that.is(":jqmData(role)")
								? that.parent()
								: that;
								
					/*
					 * now we need to initialize
					 * appropriate descendants
					 */
					root.find(":jqmData(role)")
						.each(function(){
							var desc = this,
								role = desc.jqmData('role').replace('-','');
							if(desc[role]) desc[role]();
						});
				});
			};
			
			/*
			 * now we need to overwrite
			 * some knockout js functions
			 * so they run mobilize when updated
			 */

			$.each(['foreach','with','if','ifnot'],function(){
				/*
				 * first, grab the handler with the corresponding name,
				 * then cache it's update method, and overwrite it.
				 */
				var handler = ko.bindingHandlers[this], 
					update  = handler.update;
					
				handler.update = function(e){
					update.apply(this,arguments);
					$(e).mobilize();
				};
			});
		}
	});
});