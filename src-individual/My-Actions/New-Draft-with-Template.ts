// **NOTE:** For more details on using this action, see the related [tip document in the Forum](https://forums.getdrafts.com/t/tip-creating-new-drafts-with-templates/4253)
//
// Prompt to select from a list of existing drafts with the tag “template” assigned, then create a new draft with the content of that template.
// To create templates available in this action, simply type your template in a draft and assigned the tag “template” to that draft. It can be in the archive or inbox. The template can contain [Drafts tags](https://reference.getdrafts.com/topics/templates.html) to insert time stamps or other dynamic data in the template. Also, any tags other than “template” assigned to the template draft will be assigned to the new draft automatically.
// If the template contains and placeholders in the format `<|fieldname>` the first placeholder will be selected and ready to edit after creation.
// When run, if “Omit First Line in New Draft” selected in the prompt, the first line will be removed from the template. This allows you to use a friendly name for the template as the first line of the template without having it included in the new drafts created.
// **Note:** This action used functionality which requires a Pro subscription.

// defaults
const omitFirstLineDefault = true
const placeholderRe = /<\|.*?>/gm

// select from a list of drafts tagged "template" and create new draft based on selection.
let f = () => {
	// create temp workspace to query drafts
	let workspace = Workspace.create()
	if (!workspace) {
		return false
	}
	workspace.tagFilter = "template"
	workspace.queryString = ""
	workspace.setAllSort("name", false, true)
	// get list of drafts in workspace
	let drafts = workspace.query("all")
	
	// check if we found any valid templates
	if (drafts.length == 0) {
		alert("No templates found. To make templates available to this action, create a draft with the template content and assign it the tag \"template\".")
		return false
	}
	
	// prompt to select
	let p = Prompt.create()
	p.title = "New Draft with Template"
	p.message = "Select a template. A new draft will be created based the template selected."

	p.addSwitch("omitTitle", "Omit First Line in New Draft", omitFirstLineDefault)
	
	let ix = 0
	for (let d of drafts) {
		p.addButton(d.displayTitle, ix)
		ix++
	}
	
	if (!p.show()) {
		return false
	}
	
	// get the selected template draft
	let selectedIndex = p.buttonPressed
	let template = drafts[selectedIndex]
	let content = template.content
	let omitTitle = p.fieldValues["omitTitle"]

	if (omitTitle) {
		let lines = content.split('\n')
		if (lines.length > 0) {
			lines.shift()
			content = lines.join('\n').replace(/^\s+/,"")
		}
	}

	// create new draft and assign content/tags/syntax
	let d = Draft.create()
	for (let tag of template.tags) {
		if (tag != "template") {
			d.addTag(tag)
		}
	}
	d.syntax = template.syntax
	d.content = d.processTemplate(content)
	d.update()
	// load new draft
	editor.load(d)
	editor.activate()
	
	// look for placeholder <|> to set cursor location
	let match = placeholderRe.exec(d.content)
	if (match) {
		editor.setSelectedRange(match["index"], match[0].length)
	}
	
	return true;
}

if (app.isPro) {
	if (!f()) {
		context.cancel();
	}
}
else {
	alert("Drafts Pro features required to use this action.")
}