/* 

QuickDOM
Small HTML DOM manipulation library written in JS
(C) geoffrey roberts 2011 

*/

var QuickDOM = {
	
	/* isArray: check if something is an array
	*/
	
	isArray: function (obj) {
		return (
		  obj.constructor.toString().indexOf('Array') == -1 && 
		  typeof obj != 'string'
		);
	},
  
  /* create: generate a new DOM element */
  
  create: function (tag, params, children) {
    if (!tag) {
      throw { 
        name: 'NoTagException', 
        message: 'No tag name provided to QuickDOM.create' 
      };
    }
    if (!params || params == undefined) params = {};
    if (!children || children == undefined) children = [];
    
    var obj = null;
    if (params.xmlns) {
      obj = document.createElementNS(params.xmlns, tag);
      delete params.xmlns;
    } else {
      obj = document.createElement(tag)
    }
    
    for (var i in params) {
    	var targetIndex = i;
    	if (i == 'class') targetIndex = 'className';
    	if (i == 'style' || i == 'css' && typeof params[i] == 'object') {
    		QuickDOM.css(obj, params[i]);
    	} else if (params.hasOwnProperty(i)) {
    		QuickDOM.attr(obj, targetIndex, params[i]);
        }
    }
    
    if (QuickDOM.isArray(children) && children.length > 0) {
      for (var i in children) {
        if (children.hasOwnProperty(i) && !!children[i])
          obj.appendChild(children[i]);
      }
	} else if(typeof children == 'string' && children.length > 0) {
		QuickDOM.text(children, obj);
    } else if( children.length == undefined ) {
    	if (typeof children == 'object') {
    		obj.appendChild(children);
    	}
    }
    
    return obj;
  },
  
  /* attr: set or get attributes */
  
  attr: function (elem, attr, value) {
  	if (!attr) {
      throw { 
        name: 'NoAttributeException', 
        message: 'No attribute provided to QuickDOM.attr' 
      };
    }
    if (!elem) {
      throw { 
        name: 'NoElementException', 
        message: 'No element provided to QuickDOM.attr' 
      };
    }
    if (value == null || value == undefined) value = null;
    
    if (value == null) {
    	return elem.getAttribute(attr);
    } else {
    	if (attr == 'className') {
    		elem.className = value;
    	} else {
    		elem.setAttribute(attr, value);
    	}
    }
  },
  
  /* text: create a new Text node or change the text contents of a node */
  
  text: function (txt, target) {
  	if (typeof txt == 'string') {
		var txtNode = document.createTextNode(txt);
		if (!!target) {
			target.appendChild( txtNode );
		} else {
			return txtNode;
		}
  	}
  },
  
  /* get: get a list of DOM elements, or a single one */
  
  get: function (selector, index, context, level) {
    if (!selector) {
      throw { 
        name: 'NoSelectorException', 
        message: 'No selector provided to QuickDOM.get' 
      };
    }
    if (index == null || index == undefined) index = null;
    if (!context || context == undefined) context = document;
    if (level == null || level == undefined) level = 0;
    
    if (!!index && typeof index == 'object')
    {
    	context = index;
    	index = null;
    }
    
    var result = null;
    
    if (selector instanceof Array) {
      if (selector.length == 0) {
        throw { 
          name: 'NoSelectorException', 
          message: 'Selector array is empty' 
        };
      } else if (selector.length == 1) {
        result = QuickDOM.get( selector[0], null, context, level );
      } else {
        var parentContext = selector.shift();
        var newContext = QuickDOM.get( parentContext, null, context, level );
        if(!newContext.length && newContext.nodeName)
          newContext = [ newContext ];
        var items = [];
        for (var i in newContext) {
          if (!!newContext[i] && !!newContext[i].nodeName)
          {
            var items_ctx = QuickDOM.get( selector, null, newContext[i], level + 1 );
            if (!!items_ctx && items_ctx.length > 0) {
              for (var j in items_ctx) {
                if (!!items_ctx[j] && !!items_ctx[j].nodeName)
                  items.push( items_ctx[j] );
              }
            }
          }
        }
        result = items;
	    if (index != null) {
          result = result[index];
          if (!result) result = null;
        }
      }
    } else {
      if (selector.length == 0) {
        throw { 
          name: 'EmptySelectorException', 
          message: 'Selector is empty' 
        };
      } else if (selector.indexOf(' ') >= 0) {
        selector = selector.replace(/^\s*/, '').replace(/\s*$/, '').split(' ');
        result = QuickDOM.get(selector, index, context);
      } else {
        switch(selector.substring(0, 1)) {
          case '#':
            result = QuickDOM.getID(selector.replace(/^#/, ''), context);
            break;
          case '.':
            result = QuickDOM.getClass(selector.replace(/^\./, ''), index, context);
            break;
          default:
            result = QuickDOM.getTag(selector, index, context);
            break;
        }
      }
    }
    return result;
  },
  
  /* getID: get a DOM element by ID */
  
  getID: function (id, context) {
    if (!id) {
      throw { 
        name: 'NoSelectorException', 
        message: 'No ID provided to QuickDOM.getID' 
      };
    }
    if (!context || context == undefined) context = document;
    
    var result = context.getElementById( id );
    return result;
  },
  
  /* getClass: get DOM elements by class name */
  
  getClass: function (className, index, context) {
    if (!className) {
      throw { 
        name: 'NoSelectorException', 
        message: 'No Class name provided to QuickDOM.getClass' 
      };
    }
    if (index == null || index == undefined) index = null;
    if (!context || context == undefined) context = document;
    
    var result = context.getElementsByClassName( className );
    if (index != null) {
      result = result[index];
      if (!result) result = null;
    }
    return result;
  },
  
  /* getTag: get DOM elements by tag name */
  
  getTag: function (tagName, index, context) {
    if (!tagName) {
      throw { 
        name: 'NoSelectorException', 
        message: 'No Tag name provided to QuickDOM.getTag' 
      };
    }
    if (index == null || index == undefined) index = null;
    if (!context || context == undefined) context = document;
    
    var result = context.getElementsByTagName( tagName );
    if (index != null) {
      result = result[index];
      if (!result) result = null;
    }
    return result;
  },
  
  /* append: adds elem to end of target */
  
  append: function (elem, target) {
    if(!target) {
    	throw { 
    		name: 'NoElementException', 
    		message: 'No target element provided to QuickDOM.append' 
    	};
    }
    if(!elem) {
    	throw { 
    		name: 'NoElementException', 
    		message: 'No element provided to QuickDOM.append' 
    	};
    }
    target.appendChild(elem);
  },
  
  /* prepend: adds elem to start of target */
  
  prepend: function (elem, target) {
    if(!target) {
    	throw { 
    		name: 'NoElementException', 
    		message: 'No target element provided to QuickDOM.prepend' 
    	};
    }
    if(!elem) {
    	throw { 
    		name: 'NoElementException', 
    		message: 'No element provided to QuickDOM.prepend' 
    	};
    }
    target.insertBefore(elem, target.childNodes[0]);
  },
  
  /* prepend: adds elem to start of target */
  
  remove: function (elem) {
    if(!elem) {
    	throw { 
    		name: 'NoElementException', 
    		message: 'No element provided to QuickDOM.remove' 
    	};
    }
	elem.parentNode.removeChild( elem );
  },
  
  /* prepend: adds elem to start of target */
  
  css: function (elem, attr) {
  	if(!attr) {
    	throw { 
    		name: 'NoAttributeException', 
    		message: 'No attributes provided to QuickDOM.css' 
    	};
    }
    if(!elem) {
    	throw { 
    		name: 'NoElementException', 
    		message: 'No element provided to QuickDOM.css' 
    	};
    }
	for (var i in attr) {
		if (attr.hasOwnProperty(i)) {
			elem.style[i] = attr[i];
		}
	}
  }
  
};

var QD = QuickDOM;