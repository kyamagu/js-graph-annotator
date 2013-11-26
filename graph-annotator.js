// A graph annotation widget.
//
// A widget to draw a specified graph on an image. Here is a quick usage example.
//
//     GraphAnnotator('/path/to/image.jpg', {
//       graph: {
//         nodes: [
//           {name: 'head'},
//           {name: 'neck'},
//           {name: 'right_shoulder'},
//           {name: 'right_elbow'},
//           {name: 'right_hand'},
//           {name: 'left_shoulder'},
//           {name: 'left_elbow'},
//           {name: 'left_hand'},
//           {name: 'right_hip'},
//           {name: 'left_hip'},
//           {name: 'right_knee'},
//           {name: 'left_knee'},
//           {name: 'right_ankle'},
//           {name: 'left_ankle'}
//         ],
//         edges: [
//           {index: [0,1]},
//           {index: [5,9]},
//           {index: [9,11]},
//           {index: [11,13]},
//           {index: [8,9]},
//           {index: [2,8]},
//           {index: [8,10]},
//           {index: [10,12]},
//           {index: [1,2]},
//           {index: [2,3]},
//           {index: [3,4]},
//           {index: [1,5]},
//           {index: [5,6]},
//           {index: [6,7]}
//         ]
//       },
//       onchange: function(annotator) {
//         if (annotator.getNextNode() === null)
//           alert(annotator.getGraph());
//       },
//       node_color: [255, 255, 255],
//       edge_color: [  0, 255,   0]
//     });
//
// Kota Yamaguchi 2013

// GraphAnnotator class constructor
//
//     GraphAnnotator(image_url, { option: value, ... })
//
// Create a new annotation widget. Following options are accepted.
//
//  * `graph` - Graph structure to draw. It is an object with `nodes` and `edges`
//              fields. Both are an array of objects, and `edges` must have
//              `index` field that has two index values pointing to `nodes`.
//              See below for the structure.
//  * `onchange` - Callback function when the graph is updated. The function takes
//                 two arguments: `function(annotator, current_node) {}`. The
//                 `annotator` is this annotator object, and `current_node` is the
//                 index of the updated node.
//  * `onselect` - Callback function when a node is selected. The function takes
//                 two arguments: `function(annotator, current_node) {}`. The
//                 `annotator` is this annotator object, and `current_node` is the
//                 index of the selected node.
//  * `onload` - Callback function when the annotator is initialized. The function
//               takes one argument: `function(annotator) {}`. The `annotator` is
//               this annotator object.
//  * `container` - Container DOM element to initialize the graph annotator.
//  * `line_width` - Line width of the graph. Each node and edge can overwrite
//                   this value by attributes.
//  * `node_color` - Color of the node in RGB integer values in an array.
//  * `edge_color` - Color of the edge in RGB integer values in an array.
//  * `node_diameter` - Diameter of nodes in pixels.
//  * `hit_distance` - Diameter in pixels to decide whether to select a closest
//                     node.
//
// Following is the required graph structure.
//
//     {
//       nodes: [{}, {}, ...],
//       edges: [{index: [0, 1]}, {index: [1, 2]}, ...]
//     }
GraphAnnotator = function(image_url, options) {
  options = options || {};
  var _this = this;
  this.graph = options.graph || {nodes: [{}, {}], edges: [{index: [0, 1]}]};
  this.line_width = options.line_width || 3;
  this.node_color = options.node_color || [0, 255, 255];
  this.edge_color = options.edge_color || [0, 255, 255];
  this.node_diameter = options.node_diameter || 3;
  this.hit_distance = options.hit_distance || 10;
  this._initializeContainer(options);
  this._initializeLayers(image_url, function() {
    if (options.onchange)
      _this._initializeEvents(options);
    _this._renderGraph();
    if (options.onload) {
      options.onload(_this);
    }
  });
};

// Set node attributes.
//
// The first argument is an index of the node. When omitted, attributes are
// set to all nodes.
//
// Example
//
//     annotator.setNodeAttributes({color: [255, 255, 0]});
//     annotator.setNodeAttributes(2, {color: [255, 255, 0]});
//
// There are three attributes.
//
// * `color` - RGB values in a 3-element integer array.
// * `line_width` - Width of the line.
// * `diameter` - Diameter of the node.
//
GraphAnnotator.prototype.setNodeAttributes = function(index, attributes) {
  var start = 0, end = this.graph.nodes.length;
  if (attributes === undefined)
    attributes = index;
  else if (index !== null) {
    start = index;
    end = index + 1;
  }
  for (var i = start; i < end; ++i)
    for (var key in attributes)
      this.graph.nodes[i][key] = attributes[key];
  this._renderGraph();
  return this;
};

// Set edge attributes.
//
// The first argument is an index of the edge. When omitted, attributes are
// set to all edges.
//
// Example
//
//     annotator.setEdgeAttributes({color: [255, 255, 0]});
//     annotator.setEdgeAttributes(2, {color: [255, 255, 0]});
//
// There are two attributes.
//
// * `color` - RGB values in a 3-element integer array.
// * `line_width` - Width of the line.
//
GraphAnnotator.prototype.setEdgeAttributes = function(index, attributes) {
  var start = 0, end = this.graph.nodes.length;
  if (attributes === undefined)
    attributes = index;
  else {
    start = index;
    end = index + 1;
  }
  for (var i = start; i < end; ++i)
    for (var key in attributes)
      this.edges[i][key] = attributes[key];
  this._renderGraph();
  return this;
};

// Get the next node to annotate.
//
// Return an index of next node to annotate. When finished, return null.
//
GraphAnnotator.prototype.getNextNode = function() {
  return this._findNode(null);
};

// Get the current graph.
//
// After annotation is completed, each node gets position field filled.
// Use getNextNode() to check whether if there is a pending node to
// annotate.
//
GraphAnnotator.prototype.getGraph = function() {
  return this.graph;
};

// Private methods.

// Initialize a container.
GraphAnnotator.prototype._initializeContainer = function(options) {
  if (options.container)
    this.container = options.container;
  else {
    this.container = document.createElement('div');
    document.body.appendChild(this.container);
  }
  this.container.style.display = 'inline-block';
  this.container.style.position = 'relative';
  this.container.innerHTML = '';
};

// Create layer elements.
GraphAnnotator.prototype._initializeLayers = function(image_url, callback) {
  var _this = this;
  this.image = new Image();
  this.image.src = image_url;
  this.container.appendChild(this.image);
  this.image.onload = function(event) {
    _this.canvas = document.createElement('canvas');
    _this.canvas.width = event.target.width;
    _this.canvas.height = event.target.height;
    _this.canvas.style.position = 'absolute';
    _this.canvas.style.left = '0px';
    _this.canvas.style.top = '0px';
    _this.canvas.style.cursor = 'pointer';
    _this.container.appendChild(_this.canvas);
    _this.canvas.oncontextmenu = function() { return false; };
    callback();
  };
};

// Set up events.
GraphAnnotator.prototype._initializeEvents = function(options) {
  var _this = this;
  var mousestatus = false;
  var current_node = null;
  this.canvas.addEventListener('mousedown', function(event) {
    if (mousestatus === false) {
      mousestatus = true;
      current_node = _this._findNode(_this._getPosition(event));
      _this._updateNode(event, current_node);
      if (options.onselect)
        options.onselect(_this, current_node);
      document.onselectstart = function() { return false; };
    }
  });
  this.canvas.addEventListener('mousemove', function(event) {
    if (mousestatus === true)
      _this._updateNode(event, current_node);
  });
  window.addEventListener('mouseup', function(event) {
    if (mousestatus === true) {
      _this._updateNode(event, current_node);
      mousestatus = false;
      document.onselectstart = function() { return true; };
      options.onchange(_this, current_node);
      current_node = null;
    }
  });
};

// Find and update the current node.
GraphAnnotator.prototype._findNode = function(position) {
  var candidate = null;
  if (position) {
    // Find the nearest node.
    var min_distance = Infinity;
    for (var i = 0; i < this.graph.nodes.length; ++i) {
      if (this.graph.nodes[i].position !== undefined) {
        var node_position = this.graph.nodes[i].position;
        var distance = Math.sqrt(
            Math.pow(node_position[0] - position[0], 2) +
            Math.pow(node_position[1] - position[1], 2));
        if (distance <= this.hit_distance && distance <= min_distance) {
          min_distance = distance;
          candidate = i;
        }
      }
    }
  }
  if (candidate === null) {
    // Find the unfinished node.
    for (var i = 0; i < this.graph.nodes.length; ++i) {
      if (this.graph.nodes[i].position === undefined) {
        candidate = i;
        break;
      }
    }
  }
  return candidate;
};

// Render a graph.
GraphAnnotator.prototype._renderGraph = function() {
  // Get a format RGB string.
  function formatRGB(rgb) {
    return 'rgb(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ')';
  }
  this.canvas.width = this.image.width;
  var context = this.canvas.getContext('2d');
  for (var i = 0; i < this.graph.edges.length; ++i) {
    var edge = this.graph.edges[i];
    var node1 = this.graph.nodes[edge.index[0]];
    var node2 = this.graph.nodes[edge.index[1]];
    if (node1.position === undefined || node2.position === undefined)
      continue;
    context.lineWidth = edge.line_width || this.line_width;
    context.strokeStyle = formatRGB(edge.color || this.edge_color);
    context.beginPath();
    context.moveTo(node1.position[0], node1.position[1]);
    context.lineTo(node2.position[0], node2.position[1]);
    context.closePath();
    context.stroke();
  }
  for (var i = 0; i < this.graph.nodes.length; ++i) {
    var node = this.graph.nodes[i];
    if (node.position) {
      context.lineWidth = node.line_width || this.line_width;
      context.strokeStyle = formatRGB(node.color || this.node_color);
      context.beginPath();
      context.arc(node.position[0],
                  node.position[1],
                  node.diameter || this.node_diameter,
                  0,
                  Math.PI*2,
                  false);
      context.closePath();
      context.stroke();
    }
  }
};

// Get a mouse position.
GraphAnnotator.prototype._getPosition = function(event) {
  var x = event.pageX - this.container.offsetLeft + this.container.scrollLeft;
  var y = event.pageY - this.container.offsetTop + this.container.scrollTop;
  x = Math.max(Math.min(x, this.canvas.width - 1), 0);
  y = Math.max(Math.min(y, this.canvas.height - 1), 0);
  return [x, y];
};

// Update a node.
GraphAnnotator.prototype._updateNode = function(event, current_node) {
  if (current_node !== null) {
    this.graph.nodes[current_node].position = this._getPosition(event);
    this._renderGraph();
  }
};
