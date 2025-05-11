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
	
//	// prompt to select
//	let p = Prompt.create()
//	p.title = "New Draft with Template"
//	p.message = "Select a template. A new draft will be created based the template selected."
//
//	p.addSwitch("omitTitle", "Omit First Line in New Draft", omitFirstLineDefault)
//	
//	let ix = 0
//	for (let d of drafts) {
//		p.addButton(d.displayTitle, ix)
//		ix++
//	}
//	
//	if (!p.show()) {
//		return false
//	}
//	
	// get the selected template draft
//	let selectedIndex = p.buttonPressed
    let selectedIndex = 1
	let template = drafts[selectedIndex]

//  // get the specific 'Micropost Template' template draft
//  let template = Draft.query("Micropost Template")[0]
//  if (!template) {
//    alert("No 'Micropost Template' found. To make templates available to this action, create a 'Micropost Template' draft with the template content and assign it the tag \"template\".")
//    return false
//  }

    let content = template.content
    let omitTitle = omitFirstLineDefault

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