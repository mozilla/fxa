
## Syntax

The Tabbox enables you to easily create several content panels and toggle between them via tabs.  

```
<x-tabbox id="tabbox">
	<x-tabs>
		<x-tab selected="true">Tab 1</x-tab>
		<x-tab>Tab 2</x-tab>
		<x-tab>Tab 3</x-tab>
	</x-tabs>
	
	<x-tabpanels>
		<x-tabpanel selected="true">
			<p>
				Tabboxes are great for showing users only the content they need to see, while providing users an easy way to access additional content on-demand.
			</p>
		</x-tabpanel>
		
		<x-tabpanel>
			<p>
				Examples of use-cases for tabboxes include: a set of step-wise directions, grouping like content elements together, or as a building block for a tabbed viewing interface in a mobile web app.
			</p>
		</x-tabpanel>

		<x-tabpanel>
			<p>
				In short, tabboxes are pretty freaking cool, and when you pair them with CSS animations/transitions, you can do things with a few styles that used to take a ton of JavaScript and custom code.
			</p>
		</x-tabpanel>
	</x-tabpanels>
</x-tabbox>
```


## Usage

```
	var tabbox = document.getElementById('x-tabbox');
	
	// create a new tab and panel
	var tab = document.createElement('x-tab');
	tab.innerHTML = 'Tab 4';
	tabbox.firstChild.appendChild(tab);

	var panel = document.createElement('x-tabpanel');
	panel.innerHTML = '<p>New content</p>';
	tabbox.lastChild.appendChild(panel);

	// If you want to select a certain tab via code, you can 
	// either use the `selected` attribute OR
	// the tabboxes methods

	tabbox.setSelectedIndex(2);
	tabbox.getSelectedTab(); // returns the <x-tab>Tab 3</x-tab> element

	tabbox.addEventListener('selected', function(e){
		// fired each time the tab is changed
		// e.target equals the selected tab element
	});
	

```


