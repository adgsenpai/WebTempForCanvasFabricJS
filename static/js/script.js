
// --- Inline editor  
  function Tabs(id) {
    this.element = (typeof id === 'string') ? document.getElementById(id) : id;
    this.events = new Events(this);
    this.attach();
  }
  
  Tabs.prototype.attach = function() {
    this.tabs = this.getElements(this.element, '[data-tab]');
    this.pages = this.getElements(this.element, '[data-page]');
    
    this.tabs.forEach(function(tab, idx) {
      tab.addEventListener('click', this.select.bind(this, idx));
    }, this);
  }
  
  Tabs.prototype.select = function(idx, event) {
    if (idx < 0 || idx >= this.tabs.length) return;
    var tab = this.tabs[idx];
    var id = tab.getAttribute('data-tab');
    
    this.tabs.forEach(function(_tab) {
      if (_tab == tab) {
        _tab.classList.add('tab-active');
      } else {
        _tab.classList.remove('tab-active');
      }
    }, this);
    
    this.pages.forEach(function(page) {
      var pageId = page.getAttribute('data-page');
      if (pageId == id) {
        page.classList.add('page-active');
      } else {
        page.classList.remove('page-active');
      }
    }, this);
    
    this.events.fire('change', idx);
  }
  
  Tabs.prototype.getElements = function(el, selector) {
    return [].slice.call(el.querySelectorAll(selector));
  }
  
  // --- Splitter
  
  function Splitter(id, options) {
    this.element = (typeof id === 'string') ? document.getElementById(id) : id;
    this.options = options || {};
    
    if (!this.options.cookieKey) this.options.cookieKey = null;
    if (!this.options.minWidth) this.options.minWidth = 0;
    
    this.binds = {
      start: this.start.bind(this),
      move: this.move.bind(this),
      end: this.end.bind(this)
    };
    
    this.attach();
  }
  
  Splitter.prototype.attach = function() {
    this.left = this.element.previousElementSibling;
    this.right = this.element.nextElementSibling;
    
    // TODO: load from cookie?
    
    this.dragging = false;
    
    this.element.addEventListener('mousedown', this.binds.start);
  }
  
  Splitter.prototype.start = function(event) {
    var isLeftButton = (event.which ? (event.which == 1) : false) || 
                        (event.button ? (event.button == 1) : false);
    if (!isLeftButton) return;
    
    event.stopPropagation();
    event.preventDefault();
    
    this.startPos = this.eventPosition(event);
  
    // Add transparent cover to avoid IFRAMEs
    if (!this.cover) {
      this.cover = document.createElement('div');
      this.cover.style.position = 'fixed';
      this.cover.style.top = '0px';
      this.cover.style.bottom = '0px';
      this.cover.style.left = '0px';
      this.cover.style.right = '0px';
      this.cover.style.cursor = this.getComputedStyle(this.element, 'cursor');
      document.body.appendChild(this.cover);
    } else {
      this.cover.style.display = 'block';
    }
    
    document.body.addEventListener('mousemove', this.binds.move);
    document.body.addEventListener('mouseup', this.binds.end);
    this.dragging = true;
  }
  
  Splitter.prototype.move = function(event) {
    if (!this.dragging) return;
    
    event.stopPropagation();
    event.preventDefault();
    
    var pos = this.eventPosition(event);
    
    // TODO: resize
    var delta = pos.x - this.startPos.x;
    this.startPos = pos;
    
    //console.log(delta);
    
    var leftWidth = this.left.offsetWidth;
    var rightWidth = this.right.offsetWidth;
    
    //console.log(leftWidth, rightWidth);
    
    if (delta < 0) {
      if ((leftWidth + delta) < this.options.minWidth) delta -= this.options.minWidth - (leftWidth + delta);
    } else {
      if ((rightWidth - delta) < this.options.minWidth) delta -= this.options.minWidth - (rightWidth - delta);
    }
    
    this.left.style.width = (leftWidth + delta) + 'px';
    this.right.style.width = (rightWidth - delta) + 'px';
  }
  
  Splitter.prototype.end = function(event) {
    if (!this.dragging) return;
  
    event.stopPropagation();
    event.preventDefault();
    
    this.cover.style.display = 'none';
    
    var pos = this.eventPosition(event);
    
    // TODO: end dragging, fix new sizes
    
    // TODO: save to cookie?
  
    document.body.removeEventListener('mousemove', this.binds.move);
    document.body.removeEventListener('mouseup', this.binds.end);
    this.dragging = false;
  }
  
  Splitter.prototype.eventPosition = function(event) {
    var pageX = event.pageX;
    var pageY = event.pageY;
    if (pageX === undefined) {
      pageX = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
      pageY = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }
    return {
      x: pageX,
      y: pageY
    };
  }
  
  Splitter.prototype.getComputedStyle = function(elem, prop) {
    if (elem.currentStyle) {
      return elem.currentStyle[prop];
    } else if (window.getComputedStyle) {
      return window.getComputedStyle(elem, null).getPropertyValue(prop);
    }
  }
  
  // --- Create Editor
  
  function createEditor(id, mode, options) {
    options = options || {};
    
    var editor = ace.edit(id);
    //editor.setTheme("ace/theme/ambiance");
    editor.setTheme("ace/theme/twilight");
    editor.getSession().setMode("ace/mode/" + mode);
    editor.setFontSize(16);
    // enable autocompletion and snippets
    editor.setOptions({
      enableBasicAutocompletion: true,
      enableSnippets: true,
      enableLiveAutocompletion: false
    });
    
    if (options.onchange) {
      editor.getSession().on('change', options.onchange);
    }
    
    if (mode == 'html') {
      // Filter out doctype lint error
      var session = editor.getSession();
      session.on("changeAnnotation", function() {
        var annotations = session.getAnnotations()||[], i = len = annotations.length;
        while (i--) {
          if(/doctype first\. Expected/.test(annotations[i].text)) {
            annotations.splice(i, 1);
          }
        }
        if(len>annotations.length) {
          session.setAnnotations(annotations);
        }
      });
    }  
    
    var el = document.getElementById(id);
    el.ace = editor;
    
    return editor;
  }
  
  // ---
  
  window.addEventListener('DOMContentLoaded', function() {
    
    var splitterEl = document.querySelector('[data-splitter]');
    new Splitter(splitterEl/*, {minWidth: 200}*/);
    
    var tabsEl = document.querySelector('[data-tabs]');
    var tabs = new Tabs(tabsEl);
    
    var saveBtn = document.getElementById('save-btn');
    var markChanges = function() {
      saveBtn.classList.add('highlight');
    };
    
    var htmlEditor = createEditor('html-editor', 'html', {onchange: markChanges});
    var cssEditor = createEditor('css-editor', 'css', {onchange: markChanges});
    var jsEditor = createEditor('js-editor', 'javascript', {onchange: markChanges});
  
    var pages = [].slice.call(document.querySelectorAll('[data-editor-files]'));
    pages = pages.map(function(files, idx) {
      var f = new EditorFiles(files);
      f.events.add('change', function(newIndex) {
        tabs.select(idx);
      });
      return f;
    });
    tabs.events.add('change', function(idx) {
      pages[idx].focus();
    });
    
    if (window == window.top) {
      pages[0].focus();
    }
    
  });
  
  // --- Polyfills & utils
  
  if (typeof Object.forEach != 'function') {
    Object.forEach = function(object, fn, bind) {
        for (var key in object) {
            if (Object.prototype.hasOwnProperty.call(object, key)) fn.call(bind, object[key], key, object);
        }
    }
  }
  
  if (typeof Object.merge != 'function') {
    Object.merge = function() {
      'use strict';
      var target = Object({});
      for (var index = 0; index < arguments.length; index++) {
        var source = arguments[index];
        if (source != null) {
          for (var key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
              target[key] = source[key];
            }
          }
        }
      }
      return target;
    };
  }
  
  // === Events
  
  var Events = function(context) {
    this.context = context || null;
    this.events = {};
  }
  
  Events.prototype.add = function(event, listener) {
    if (typeof this.events[event] !== 'object') {
      this.events[event] = [];
    }
  
    this.events[event].push(listener);
  }
  
  Events.prototype.adds = function(events) {
    Object.forEach(events, function(listener, event) {
      this.add(event, listener);
    }, this);
  }
  
  Events.prototype.remove = function(event, listener) {
    var idx;
  
    if (typeof this.events[event] === 'object') {
      idx = this.events[event].indexOf(listener);
  
      if (idx > -1) {
        this.events[event].splice(idx, 1);
      }
    }
  }
  
  Events.prototype.fire = function(event) {
    var i, listeners, length, args = [].slice.call(arguments, 1);
  
    if (typeof this.events[event] === 'object') {
      listeners = this.events[event].slice();
      length = listeners.length;
  
      for (i = 0; i < length; i++) {
        listeners[i].apply(this.context, args);
      }
    }
  }
  
  Events.prototype.fireOnce = function(event, listener) {
    this.add(event, function g () {
      this.remove(event, g);
      listener.apply(this.context, arguments);
    });
  }
  