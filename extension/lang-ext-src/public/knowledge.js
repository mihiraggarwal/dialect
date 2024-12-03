
// Schema type
console.log("Here")
let graphData = null;
const API_URL = "https://dialect-phi.vercel.app";
chrome.storage.sync.get('user_id', function(result) {
  const userId = result.user_id;
  fetch(`${API_URL}/graph`, {
    headers: {
      'Authorization': userId
    }
  })
  .then(response => response.json())
  .then(data => {
    graphData = data;

    buildNodeHierarchy(graphData.clusters);

    showNode(createRootNode());
  })
  .catch(error => {
    console.error('Error fetching graph data:', error);
  }).then(() => {




    const nodeHierarchy = new Map();
    const nodeParents = new Map();
    const breadcrumbHistory = [];
    
    function findNodeInData(id, clusters) {
        for (const cluster of clusters) {
            if (cluster.id === id) return cluster;
            if (cluster.subclusters) {
                const found = findNodeInData(id, cluster.subclusters);
                if (found) return found;
            }
            if (cluster.words) {
                const found = cluster.words.find(word => word.id === id);
                if (found) return found;
            }
        }
        return null;
    }
    
    function buildNodeHierarchy(clusters, parentId = null) {
        clusters.forEach(cluster => {
            nodeHierarchy.set(cluster.id, cluster);
            if (parentId) nodeParents.set(cluster.id, parentId);
            
            if (cluster.subclusters) {
                buildNodeHierarchy(cluster.subclusters, cluster.id);
            }
            if (cluster.words) {
                cluster.words.forEach(word => {
                    nodeHierarchy.set(word.id, word);
                    nodeParents.set(word.id, cluster.id);
                });
            }
        });
    }
    
    function generateNodesAndEdges(node) {
        const nodes = new Set();
        const edges = new Set();
        const addedNodeIds = new Set();
    
        function addUniqueNode(nodeData) {
            if (!addedNodeIds.has(nodeData.id)) {
                nodes.add(nodeData);
                addedNodeIds.add(nodeData.id);
            }
        }
    
        function addUniqueEdge(edgeData) {
            const edgeKey = `${edgeData.from}-${edgeData.to}`;
            edges.add(edgeData);
        }
    
        addUniqueNode({
            id: node.id,
            label: node.label || node.id,
            title: node.word || '', 
            color: {
                background: node.color || '#2c3e50',
                border: '#fff'
            },
            font: { color: '#fff', size: 16 },
            size: 30
        });
    
        if (node.subclusters) {
            node.subclusters.forEach(subcluster => {
                addUniqueNode({
                    id: subcluster.id,
                    label: subcluster.label,
                    title: subcluster.word || '',
                    color: {
                        background: subcluster.color || '#ccc',
                        border: '#fff'
                    },
                    font: { color: '#fff', size: 16 },
                    size: 25
                });
                addUniqueEdge({
                    from: node.id,
                    to: subcluster.id,
                    color: { color: '#bdc3c7' }
                });
            });
        }
    
        if (node.words) {
            node.words.forEach(word => {
                addUniqueNode({
                    id: word.id,
                    label: word.label,
                    title: word.word || '',
                    color: {
                        background: '#95a5a6',
                        border: '#fff'
                    },
                    font: { color: '#fff', size: 14 },
                    size: 20
                });
                addUniqueEdge({
                    from: node.id,
                    to: word.id,
                    color: { color: '#bdc3c7' }
                });
            });
        }
    
        if (node.id === 'root') {
            graphData.clusters.forEach(cluster => {
                addUniqueNode({
                    id: cluster.id,
                    label: cluster.label,
                    title: cluster.word || '',
                    color: {
                        background: cluster.color || '#2c3e50',
                        border: '#fff'
                    },
                    font: { color: '#fff', size: 16 },
                    size: 30
                });
            });
        }
    
        return { 
            nodes: Array.from(nodes), 
            edges: Array.from(edges) 
        };
    }
    
    function createRootNode() {
      fetch()
        return {
            id: 'root',
            label: 'All Clusters',
            color: '#34495e',
            subclusters: graphData.clusters
        };
    }
    
    buildNodeHierarchy(graphData.clusters);
    
    const container = document.getElementById('network');
    const data = {
        nodes: new vis.DataSet([]),
        edges: new vis.DataSet([])
    };
    
    const options = {
        physics: {
            enabled: true,
            stabilization: true,
            barnesHut: { 
                gravitationalConstant: -2000,
                springLength: 150,
                springConstant: 0.04
            }
        },
        nodes: {
            shape: 'circle',
            borderWidth: 2,
            font: {
                size: 16,
                face: 'arial'
            }
        },
        edges: {
            width: 2,
            arrows: {
                to: { enabled: true, scaleFactor: 0.5 }
            },
            smooth: {
                type: 'continuous'
            }
        },
        interaction: {
            hover: true,
            tooltipDelay: 200
        }
    };
    
    const network = new vis.Network(container, data, options);
    
    function updateBreadcrumb() {
        const breadcrumbDiv = document.getElementById('breadcrumb');
        breadcrumbDiv.innerHTML = breadcrumbHistory.map((node, index) => {
            const text = `<span class="breadcrumb-item" data-id="${node.id}">${node.label || node.id}</span>`;
            return index < breadcrumbHistory.length - 1 
                ? text + '<span class="breadcrumb-separator">></span>' 
                : text;
        }).join('');
    
        document.querySelectorAll('.breadcrumb-item').forEach(item => {
            item.addEventListener('click', function() {
                const nodeId = this.dataset.id;
                const node = nodeHierarchy.get(nodeId);
                const index = breadcrumbHistory.findIndex(n => n.id === nodeId);
                breadcrumbHistory.splice(index + 1);
                showNode(node);
            });
        });
    }
    
    function showNode(node) {
        if (!node) {
            node = createRootNode();
        }
    
    
        if (!breadcrumbHistory.find(n => n.id === node.id)) {
            breadcrumbHistory.push(node);
        }
        updateBreadcrumb();
    
        const { nodes, edges } = generateNodesAndEdges(node);
        data.nodes.clear();
        data.edges.clear();
        data.nodes.add(nodes);
        data.edges.add(edges);
    
        network.fit({
            animation: {
                duration: 1000,
                easingFunction: 'easeInOutQuad'
            }
        });
    }
    
    network.on('click', function(params) {
        if (params.nodes.length > 0) {
            const clickedNodeId = params.nodes[0];
            const clickedNode = nodeHierarchy.get(clickedNodeId);
            
            if (clickedNode && (clickedNode.subclusters || clickedNode.words)) {
                showNode(clickedNode);
            }
        }
    });
    
    showNode(createRootNode());

  }
    
  );
});

