Graph Annotator
===============

A Javascript widget to draw a graph on an image.

 * Draw an arbitrary graph on an image with mouse.
 * Vanilla Javascript implementation.
 * HTML5 canvas is required to use.

There is an online demo at http://vision.cs.stonybrook.edu/~kyamagu/js-graph-annotator/ .

Here is a quick usage example.

    GraphAnnotator('/path/to/image.jpg', {
      graph: {
        nodes: [
          {name: 'head'},
          {name: 'neck'},
          {name: 'right_shoulder'},
          {name: 'right_elbow'},
          {name: 'right_hand'},
          {name: 'left_shoulder'},
          {name: 'left_elbow'},
          {name: 'left_hand'},
          {name: 'right_hip'},
          {name: 'left_hip'},
          {name: 'right_knee'},
          {name: 'left_knee'},
          {name: 'right_ankle'},
          {name: 'left_ankle'}
        ],
        edges: [
          {index: [0,1]},
          {index: [5,9]},
          {index: [9,11]},
          {index: [11,13]},
          {index: [8,9]},
          {index: [2,8]},
          {index: [8,10]},
          {index: [10,12]},
          {index: [1,2]},
          {index: [2,3]},
          {index: [3,4]},
          {index: [1,5]},
          {index: [5,6]},
          {index: [6,7]}
        ]
      },
      onchange: function(annotator) {
        if (annotator.getNextNode() === null)
          alert(annotator.getGraph());
      }
    });

API
---

_GraphAnnotator_

GraphAnnotator class constructor.

    GraphAnnotator(image_url, { option: value, ... })

Create a new annotation widget. Following options are accepted.

 * `graph` - Graph structure to draw. It is an object with `nodes` and `edges`
             fields. Both are an array of objects, and `edges` must have a
             `index` field that has two index values pointing to `nodes`.
             See below for the structure.
 * `onchange` - Callback function when the graph is updated. The function takes
                two arguments: `function(annotator, current_node) {}`. The
                `annotator` is this annotator object, and `current_node` is the
                index of the updated node.
 * `onselect` - Callback function when a node is selected. The function takes
                two arguments: `function(annotator, current_node) {}`. The
                `annotator` is this annotator object, and `current_node` is the
                index of the selected node.
 * `onload` - Callback function when the annotator is initialized. The function
              takes one argument: `function(annotator) {}`. The `annotator` is
              this annotator object.
 * `container` - Container DOM element to initialize the graph annotator.
 * `line_width` - Line width of the graph. Each node and edge can overwrite
                  this value by attributes.
 * `node_color` - Color of the node in RGB integer values in an array.
 * `edge_color` - Color of the edge in RGB integer values in an array.
 * `node_diameter` - Diameter of nodes in pixels.
 * `hit_distance` - Diameter in pixels to decide whether to select a closest
                    node.

Following is the required graph structure.

    {
      nodes: [{}, {}, ...],
      edges: [{index: [0, 1]}, {index: [1, 2]}, ...]
    }

_setNodeAttributes_

Set node attributes.

    annotator.setNodeAttributes([index,] { attribute: value, ... })

The first argument is an index of the node. When omitted, attributes are set to
all nodes.

There are three attributes.

* `color` - RGB values in a 3-element integer array.
* `line_width` - Width of the line.
* `diameter` - Diameter of the node.

Example

    annotator.setNodeAttributes({color: [255, 255, 0]});
    annotator.setNodeAttributes(2, {color: [255, 255, 0]});

_setEdgeAttributes_

Set edge attributes.

    annotator.setEdgeAttributes([index,] { attribute: value, ... })

The first argument is an index of the edge. When omitted, attributes are set to
all edges.

There are two attributes.

* `color` - RGB values in a 3-element integer array.
* `line_width` - Width of the line.

Example

    annotator.setEdgeAttributes({color: [255, 255, 0]});
    annotator.setEdgeAttributes(2, {color: [255, 255, 0]});

_getNextNode_

Get the next node to annotate.

    next_node = annotator.getNextNode()

Return an index of next node to annotate. When finished, return null.

_getGraph_

Get the current graph.

    graph = annotator.getGraph()

After annotation is completed, each node gets a position field filled. Use
`getNextNode()` to check whether if there is a pending node to annotate.
