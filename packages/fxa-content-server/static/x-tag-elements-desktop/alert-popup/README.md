
## Syntax

The alert popup is similar to the native alert(), but has more options, such as being able to position it.

```
	<x-alert fade-duration="500" secondary-text="Cancel">
		<h2>Hello</h2>
		<p>yo yo</p>
	</x-alert>
```

## Usage

```
	var pop = document.createElement('x-alert');
	pop.innerHTML = '<h3>Delete all contacts?</h3>Contacts will be deleted forever!';
	pop.setAttribute('fade-duration', 500);
	pop.setAttribute('secondary-text', 'Cancel');
					

```


