(function(){

function selectTab(idx){
	var panels = xtag.query(this, 'x-tabpanels > x-tabpanel');
	xtag.query(this, 'x-tab').forEach(function(el,i,array){
		if(el == array[idx]){
			el.setAttribute('selected', null);
			panels[idx].setAttribute('selected', null);
			xtag.fireEvent(el, 'selected');
		} else{
			el.removeAttribute('selected');
			panels[i].removeAttribute('selected');
		}
	});
}

xtag.register('x-tabbox', {
	events: {
		'click:touch:delegate(x-tab)': function(event, element){
			var selectIdx = xtag.toArray(this.parentNode.children).indexOf(this);
			selectTab.call(element, selectIdx);
		},
		'keydown:delegate(x-tab)': function(event, element){
			var selectIdx = xtag.toArray(this.parentNode.children).indexOf(this);
			switch(event.keyCode) {
				case 13: selectTab.call(element,selectIdx); break;
				case 37: element.previousTab(); break;
				case 39: element.nextTab(); break;
			}
		}
	},
	methods: {
		setSelectedIndex: function(value){
			selectTab.call(this, value);
		},
		getSelectedIndex: function(){
			var tabs = xtag.query(this.firstElementChild, 'x-tab');
			return tabs.indexOf(this.getSelectedTab());
		},
		getSelectedTab: function(){
			return xtag.query(this.firstElementChild, 'x-tab[selected]')[0];
		},
		nextTab: function(){
			var idx = this.getSelectedIndex() + 1;
			if(this.firstElementChild.children.length -1 < idx ) selectTab.call(this,0);
			else selectTab.call(this,idx);
		},
		previousTab: function(){			
			var idx = this.getSelectedIndex() - 1;
			if(idx < 0) selectTab.call(this,this.firstElementChild.children.length -1)
			else  selectTab.call(this,idx);
		}
	}
});

xtag.register('x-tabs', {});

xtag.register('x-tab', {
	onCreate: function(){
		this.setAttribute('tabindex', 0);
	}
});

})();
