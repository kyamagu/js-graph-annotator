JS Graph Annotator
==================

A Javascript widget to draw a graph on an image.

 * Draw a graph on an image with mouse.
 * Click to add a node.
 * Mouse drag to move a node.
 * Vanilla Javascript implementation.
 * HTML5 canvas is required to use.

There is an online demo at http://vision.cs.stonybrook.edu/~kyamagu/js-graph-annotator/ .

Here is a quick usage example.

    new GraphAnnotator('/path/to/image.jpg', {
      graph: {
        nodes: [
          {name: 'head'},
          {name: 'neck'},
          {name: 'right shoulder'},
          {name: 'right elbow'},
          {name: 'right hand'},
          {name: 'left shoulder'},
          {name: 'left elbow'},
          {name: 'left hand'},
          {name: 'right hip'},
          {name: 'left hip'},
          {name: 'right knee'},
          {name: 'left knee'},
          {name: 'right ankle'},
          {name: 'left ankle'}
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
          console.log(annotator.getGraph());
        else
          console.log('Not yet finished.');
      }
    });

API
---

__GraphAnnotator__ GraphAnnotator class constructor.

    new GraphAnnotator(image_url, { option: value, ... })

Create a new annotation widget. Following options are accepted.

 * `graph` - Graph structure to draw. It is an object with `nodes` and `edges`
             fields. Both are an array of objects, and `edges` must have
             `index` field that has two index values pointing to `nodes`. See
             below for an example.
 * `onchange` - Callback function when the graph is updated. The function takes
                one argument `current_node`, which is the index of the updated
                node. Also `this` is set to the annotator object.
 * `onselect` - Callback function when a node is selected. The function takes
                one argument `current_node`, which is the index of the selected
                node. Also `this` is set to the annotator object.
 * `onload` - Callback function when the annotator is initialized. The context
              is set to the annotator object.
 * `container` - Container DOM element to initialize the graph annotator.
 * `line_width` - Line width of the graph. Each node and edge can overwrite
                  this value by attributes.
 * `node_color` - Color of the node in RGB integer values in an array.
 * `edge_color` - Color of the edge in RGB integer values in an array.
 * `node_diameter` - Diameter of nodes in pixels.
 * `hit_distance` - Diameter in pixels to decide whether to select a closest
                    node.

Below is the an example of the graph structure.

    {
      nodes: [{}, {}, ...],
      edges: [{index: [0, 1]}, {index: [1, 2]}, ...]
    }

__setNodeAttributes__ Set node attributes.

    annotator.setNodeAttributes([index,] { attribute: value, ... })

The first argument is an index of the node. When omitted, attributes are set to
all nodes.

There are three attributes.

* `color` - RGB values in a 3-element integer array.
* `line_width` - Width of the line.
* `diameter` - Diameter of the node.

_Example_

    annotator.setNodeAttributes({color: [255, 255, 0]});
    annotator.setNodeAttributes(2, {color: [255, 255, 0]});

__setEdgeAttributes__ Set edge attributes.

    annotator.setEdgeAttributes([index,] { attribute: value, ... })

The first argument is an index of the edge. When omitted, attributes are set to
all edges.

There are two attributes.

* `color` - RGB values in a 3-element integer array.
* `line_width` - Width of the line.

_Example_

    annotator.setEdgeAttributes({color: [255, 255, 0]});
    annotator.setEdgeAttributes(2, {color: [255, 255, 0]});

__getNextNode__ Get the next node to annotate.

    next_node = annotator.getNextNode()

Return an index of the next node to annotate. When finished, return null.

__getGraph__ Get the current graph.

    graph = annotator.getGraph()

Return the current graph. After annotation is completed, each node gets a
position field filled with (x,y) coordinates of the node. Use `getNextNode()`
to check whether if there is a pending node to annotate.
