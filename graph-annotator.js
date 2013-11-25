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
(function() {

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
  window.GraphAnnotator = function(image_url, options) {
    // Instance variables.
    var container, image, canvas, graph;
    var self = this;

    // Find and update the current node.
    function findNode(position) {
      var candidate = null;
      if (position) {
        // Find the nearest node.
        var min_distance = Infinity;
        for (var i = 0; i < graph.nodes.length; ++i) {
          if (graph.nodes[i].position !== undefined) {
            var node_position = graph.nodes[i].position;
            var distance = Math.sqrt(
                Math.pow(node_position[0] - position[0], 2) +
                Math.pow(node_position[1] - position[1], 2));
            if (distance <= options['hit_distance'] &&
                distance <= min_distance) {
              min_distance = distance;
              candidate = i;
            }
          }
        }
      }
      if (candidate === null) {
        // Find the unfinished node.
        for (var i = 0; i < graph.nodes.length; ++i) {
          if (graph.nodes[i].position === undefined) {
            candidate = i;
            break;
          }
        }
      }
      return candidate;
    }

    // Render a graph.
    function renderGraph() {
      // Get a format RGB string.
      function formatRGB(rgb) {
        return 'rgb(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ')';
      }
      canvas.width = image.width;
      var context = canvas.getContext('2d');
      for (var i = 0; i < graph.edges.length; ++i) {
        var edge = graph.edges[i];
        var node1 = graph.nodes[edge.index[0]];
        var node2 = graph.nodes[edge.index[1]];
        if (node1.position === undefined || node2.position === undefined)
          continue;
        context.lineWidth = edge['line_width'] || options['line_width'] || 3;
        context.strokeStyle = formatRGB(edge['color'] || options['edge_color'] || [0, 255, 255]);
        context.beginPath();
        context.moveTo(node1.position[0], node1.position[1]);
        context.lineTo(node2.position[0], node2.position[1]);
        context.closePath();
        context.stroke();
      }
      for (var i = 0; i < graph.nodes.length; ++i) {
        var node = graph.nodes[i];
        if (node.position) {
          context.lineWidth = node['line_width'] || options['line_width'] || 3;
          context.strokeStyle = formatRGB(node['color'] || options['node_color'] || [0, 255, 255]);
          context.beginPath();
          context.arc(node.position[0],
                      node.position[1],
                      node['diameter'] || options['node_diameter'] || 3,
                      0,
                      Math.PI*2,
                      false);
          context.closePath();
          context.stroke();
        }
      }
    }

    // Get a mouse position.
    function getPosition(event) {
      var x = event.pageX - container.offsetLeft + container.scrollLeft;
      var y = event.pageY - container.offsetTop + container.scrollTop;
      x = Math.max(Math.min(x, canvas.width - 1), 0);
      y = Math.max(Math.min(y, canvas.height - 1), 0);
      return [x, y];
    }

    // Update a node.
    function updateNode(event, current_node) {
      if (current_node !== null) {
        graph.nodes[current_node].position = getPosition(event);
        renderGraph();
      }
    }

    // Set up events.
    function initializeEvents() {
      var mousestatus = false;
      var current_node = null;
      canvas.addEventListener('mousedown', function(event) {
        if (mousestatus === false) {
          mousestatus = true;
          current_node = findNode(getPosition(event));
          updateNode(event, current_node);
          if (options['onselect'])
            options['onselect'](self, current_node);
          document.onselectstart = function() { return false; };
        }
      });
      canvas.addEventListener('mousemove', function(event) {
        if (mousestatus === true)
          updateNode(event, current_node);
      });
      window.addEventListener('mouseup', function(event) {
        if (mousestatus === true) {
          updateNode(event, current_node);
          mousestatus = false;
          document.onselectstart = function() { return true; };
          options['onchange'](self, current_node);
          current_node = null;
        }
      });
    }

    // Create layer elements.
    function createLayers(callback) {
      image = new Image();
      image.src = image_url;
      container.appendChild(image);
      image.onload = function() {
        canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        canvas.style.position = 'absolute';
        canvas.style.left = '0px';
        canvas.style.top = '0px';
        canvas.style.cursor = 'pointer';
        container.appendChild(canvas);
        canvas.oncontextmenu = function() { return false; };
        callback();
      };
    }

    // Initialize a container.
    function initializeContainer() {
      if (options['container'])
        container = options['container'];
      else {
        container = document.createElement('div');
        document.body.appendChild(container);
      }
      container.style.display = 'inline-block';
      container.style.position = 'relative';
    }

    // Initialize all.
    function initialize() {
      options = options || {};
      options['hit_distance'] = options['hit_distance'] || 10;
      graph = options['graph'] || {
        nodes: [{ name: 'node1' }, { name: 'node2' }],
        edges: [{ index: [0, 1], color: [0, 255, 255] }]
      };
      initializeContainer();
      createLayers(function() {
        if (options['onchange'])
          initializeEvents();
        renderGraph();
        if (options['onload']) {
          options['onload'](self);
        }
      });
    }

    // Public API.

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
    this.setNodeAttributes = function(index, attributes) {
      var start = 0, end = graph.nodes.length;
      if (attributes === undefined)
        attributes = index;
      else if (index !== null) {
        start = index;
        end = index + 1;
      }
      for (var i = start; i < end; ++i)
        for (var key in attributes)
          graph.nodes[i][key] = attributes[key];
      renderGraph();
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
    this.setEdgeAttributes = function(index, attributes) {
      var start = 0, end = graph.nodes.length;
      if (attributes === undefined)
        attributes = index;
      else {
        start = index;
        end = index + 1;
      }
      for (var i = start; i < end; ++i)
        for (var key in attributes)
          graph.edges[i][key] = attributes[key];
      renderGraph();
    };

    // Get the next node to annotate.
    //
    // Return an index of next node to annotate. When finished, return null.
    //
    this.getNextNode = function() {
      return findNode(null);
    };

    // Get the current graph.
    //
    // After annotation is completed, each node gets position field filled.
    // Use getNextNode() to check whether if there is a pending node to
    // annotate.
    //
    this.getGraph = function() {
      return graph;
    };

    initialize();
  };
}).call(this);
