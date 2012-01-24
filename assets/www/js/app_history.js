window.appHistory = function() {
	var MAX_LIMIT = 50;
	/**
	 * @fixme has side effects of adding things into history, not obvious from the name
	 */
	function addCurrentPage() {

		var title = app.getCurrentTitle();
		var url = app.getCurrentUrl();
		if(url == 'about:blank') {
			return;
		}
		
		var historyDB = new Lawnchair({name:"historyDB"},function() {
			this.keys(function(records) {
				if (records.length > MAX_LIMIT) {
					cleanupHistory(addCurrentPage);
				}else{			
					if (records.length == 0 || records[records.length - 1].value !== url) {
						// Add if the last thing we saw wasn't the same URL
						this.save({key: Date.now(), title: title, value: url});
					}
				}
			});
		});
	}

	// Removes first element from history
	function cleanupHistory(success) {
		var historyDB = new Lawnchair({name:"historyDB"}, function() {
			this.each(function(record, index) {
				if (index == 0) {
					// remove the first item, then add the latest item
					this.remove(record.key, success);
				}
			});
		});
	}
	
	// Removes all the elements from history
	function deleteHistory() {
		title = mw.message('menu-history');
		var answer = confirm(mw.message('remove-list-prompt', title).plain());
		if (answer) {
			var historyDB = new Lawnchair({name:"historyDB"}, function() {
				this.nuke();
				$("#historyList").hide();
			});
		}
	}

	function onHistoryItemClicked() {
		var parent = $(this).parents(".listItemContainer");
		var url = parent.attr("data-page-url");
		app.navigateToPage(url);
	}

	function showHistory() {	
		var template = templates.getTemplate('history-template');
		$(".cleanButton").bind('click', deleteHistory);
		var historyDB = new Lawnchair({name:"historyDB"}, function() {
			this.all(function(history) {
				$('#historyList').html(template.render({'pages': history.reverse()}));
				$(".historyItem").click(onHistoryItemClicked);
				chrome.hideOverlays();
				chrome.hideContent();
				$('#history').localize().show();
				chrome.doFocusHack();
				chrome.doScrollHack('#history .scroller');
			});
		});

	}

	return {
		addCurrentPage: addCurrentPage,
		showHistory: showHistory
	};
}();
